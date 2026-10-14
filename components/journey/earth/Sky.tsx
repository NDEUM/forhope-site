"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { seeded, smoothstep } from "@/lib/math";
import { SUN_DIRECTION } from "@/components/journey/earth/Earth";
import { geoToVector3 } from "@/lib/geo";
import { shots } from "@/content/journey";

/** Vue de très haut, tout le globe visible est éclairé (même courbe que Earth). */
const highAltitudeFill = (alt: number) => smoothstep(0.35, 0.75, alt);

/**
 * Atmosphère : un halo fin autour du disque, plus lumineux côté soleil,
 * qui s'efface quand la caméra entre dans l'air.
 */
export function Atmosphere() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uSun: { value: SUN_DIRECTION.clone() }, uOpacity: { value: 1 }, uFill: { value: 0 } },
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vWorldNormal;
          varying vec3 vWorldPos;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vWorldNormal = normalize(mat3(modelMatrix) * normal);
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vWorldPos = wp.xyz;
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uSun;
          uniform float uOpacity;
          uniform float uFill;
          varying vec3 vNormal;
          varying vec3 vWorldNormal;
          varying vec3 vWorldPos;
          void main() {
            vec3 V = normalize(cameraPosition - vWorldPos);
            // faces arrière de la coquille : d ≈ -0.25 contre le disque, 0 au bord extérieur
            float d = dot(vWorldNormal, V);
            float rim = pow(clamp(-d / 0.32, 0.0, 1.0), 3.0);
            // vue de très haut : le halo fait tout le tour du globe éclairé
            float sun = max(smoothstep(-0.35, 0.6, dot(-vWorldNormal, uSun)), uFill * 0.85);
            vec3 col = mix(vec3(0.03, 0.12, 0.32), vec3(0.3, 0.68, 1.0), sun);
            gl_FragColor = vec4(col * rim * (0.15 + sun * 0.9), 1.0) * uOpacity;
            #include <colorspace_fragment>
          }
        `,
        side: THREE.BackSide,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  useFrame(({ camera }) => {
    const alt = camera.position.length() - 1;
    material.uniforms.uOpacity.value = smoothstep(0.03, 0.12, alt);
    material.uniforms.uFill.value = highAltitudeFill(alt);
  });
  return (
    <mesh material={material} scale={1.045}>
      <sphereGeometry args={[1, 96, 48]} />
    </mesh>
  );
}

/**
 * Nuages procéduraux (bruit fractal 3D) sur une coquille juste au-dessus
 * du sol : ils donnent l'échelle pendant la descente, et la caméra finit
 * par les traverser.
 */
export function Clouds() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uSun: { value: SUN_DIRECTION.clone() }, uTime: { value: 0 }, uOpacity: { value: 1 }, uFill: { value: 0 } },
        vertexShader: /* glsl */ `
          varying vec3 vPos;
          varying vec3 vWorldPos;
          void main() {
            vPos = position;
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vWorldPos = wp.xyz;
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uSun;
          uniform float uTime;
          uniform float uOpacity;
          uniform float uFill;
          varying vec3 vPos;
          varying vec3 vWorldPos;
          float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
          float noise(vec3 x) {
            vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
            return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                       mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
          }
          float fbm(vec3 p) { float v = 0.0; float a = 0.5; for (int i = 0; i < 6; i++) { v += a * noise(p); p *= 2.07; a *= 0.5; } return v; }
          void main() {
            vec3 n = normalize(vPos);
            // Grandes masses tourbillonnantes (déformation de domaine), étirées
            // le long des parallèles, puis un détail fin sur les bords.
            vec3 p = n * vec3(4.2, 6.5, 4.2) + vec3(uTime * 0.003, 0.0, uTime * 0.0015);
            vec3 warp = vec3(fbm(p * 1.3), fbm(p * 1.3 + 5.2), fbm(p * 1.3 + 9.7));
            float d = fbm(p + warp * 1.6);
            d += (fbm(p * 5.0 + warp) - 0.5) * 0.18;
            float lat = abs(n.y);
            // ciel dégagé sur le Sahara, bandes plus nuageuses aux tropiques humides et aux latitudes moyennes
            float cover = 0.55 - smoothstep(0.35, 0.7, lat) * 0.05 + smoothstep(0.2, 0.42, lat) * smoothstep(0.55, 0.42, lat) * 0.1;
            float a = smoothstep(cover, cover + 0.22, d);
            float light = max(smoothstep(-0.2, 0.35, dot(n, uSun)), uFill * 0.9);
            vec3 col = mix(vec3(0.05, 0.07, 0.14), vec3(1.0, 0.98, 0.95), light);
            float dist = length(cameraPosition - vWorldPos);
            a *= smoothstep(0.004, 0.03, dist);
            gl_FragColor = vec4(col, a * 0.82 * uOpacity);
            #include <colorspace_fragment>
          }
        `,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  useFrame(({ clock, camera }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
    material.uniforms.uFill.value = highAltitudeFill(camera.position.length() - 1);
  });
  return (
    <mesh material={material} scale={1.006}>
      <sphereGeometry args={[1, 160, 80]} />
    </mesh>
  );
}

/**
 * Le fond de l'espace : une Voie lactée discrète (bande de poussière
 * lumineuse traversée de lanes sombres), de légers voiles bleus aux
 * couleurs de la charte (Deep Blue, Hope Blue) et une poussière d'étoiles
 * très fines. Orientée pour traverser en diagonale la partie noire du
 * premier plan, à gauche de la Terre.
 */
export function SpaceBackdrop() {
  const material = useMemo(() => {
    // repère du premier plan : la bande passe à gauche de la Terre, en diagonale
    const cam = geoToVector3(shots[0].camera);
    const f = geoToVector3(shots[0].target).sub(cam).normalize();
    const r = new THREE.Vector3().crossVectors(f, cam.clone().normalize()).normalize();
    const u = new THREE.Vector3().crossVectors(r, f).normalize();
    const through = f.clone().addScaledVector(r, -0.42).addScaledVector(u, 0.05).normalize();
    const axis = u.clone().multiplyScalar(0.75).addScaledVector(r, 0.66).normalize();
    const bandNormal = new THREE.Vector3().crossVectors(through, axis).normalize();
    return new THREE.ShaderMaterial({
      uniforms: { uOpacity: { value: 1 }, uBand: { value: bandNormal }, uCore: { value: through } },
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uOpacity;
        uniform vec3 uBand;
        uniform vec3 uCore;
        varying vec3 vDir;
        float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
        float noise(vec3 x) {
          vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                     mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
        }
        float fbm(vec3 p) { float v = 0.0; float a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.1; a *= 0.5; } return v; }
        void main() {
          vec3 d = normalize(vDir);
          // fond : bleu nuit profond, jamais noir pur
          vec3 col = vec3(0.0012, 0.0016, 0.0045); // valeurs linéaires : ≈ #04050d à l'écran
          // voiles bleus très diffus (Deep Blue / Hope Blue)
          float veil = fbm(d * 1.6 + 3.0);
          col += vec3(0.0, 0.25, 0.43) * smoothstep(0.45, 0.85, veil) * 0.014;
          col += vec3(0.2, 0.57, 0.79) * smoothstep(0.6, 0.95, fbm(d * 2.4 + 9.0)) * 0.006;
          // Voie lactée : bande gaussienne, renforcée près de son cœur
          float b = dot(d, uBand);
          float wob = (fbm(d * 3.0) - 0.5) * 0.12;
          float band = exp(-pow((b + wob) / 0.2, 2.0));
          float core = smoothstep(0.2, 1.0, dot(d, uCore));
          float clouds = fbm(d * 6.0 + 1.7);
          float dust = smoothstep(0.42, 0.68, fbm(d * 9.0 + 4.2)); // lanes sombres
          float glow = band * (0.35 + clouds * 0.9) * (1.0 - dust * 0.65) * (0.55 + core * 0.7);
          col += mix(vec3(0.3, 0.45, 0.95), vec3(0.85, 0.85, 0.95), core * band * 0.5) * glow * 0.026;
          // poussière d'étoiles très fines, plus dense dans la bande
          vec3 q = d * 900.0;
          vec3 cell = floor(q);
          float h = hash(cell);
          float dotShape = smoothstep(0.3, 0.0, length(fract(q) - 0.5));
          float tiny = step(0.997 - band * 0.008, h) * (0.3 + hash(cell + 7.0) * 0.7) * dotShape;
          col += vec3(0.8, 0.86, 1.0) * tiny * 0.18;
          gl_FragColor = vec4(col, uOpacity);
          #include <colorspace_fragment>
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
  }, []);
  useEffect(() => () => material.dispose(), [material]);
  useFrame(({ camera }) => {
    material.uniforms.uOpacity.value = smoothstep(0.15, 0.6, camera.position.length() - 1);
  });
  return (
    <mesh material={material} renderOrder={-2} frustumCulled={false}>
      <sphereGeometry args={[95, 64, 32]} />
    </mesh>
  );
}

/** Étoiles fixes, à peine perceptibles, qui disparaissent dans le ciel de jour. */
export function Stars({ count = 2600 }: { count?: number }) {
  const { geometry, material } = useMemo(() => {
    const rand = seeded(11);
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const u = rand() * 2 - 1;
      const t = rand() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      pos.set([r * Math.cos(t) * 80, u * 80, r * Math.sin(t) * 80], i * 3);
      size[i] = 0.7 + Math.pow(rand(), 5) * 2.8;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    const m = new THREE.ShaderMaterial({
      uniforms: { uOpacity: { value: 1 }, uPixelRatio: { value: 1 } },
      vertexShader: /* glsl */ `
        attribute float aSize;
        uniform float uPixelRatio;
        varying float vB;
        void main() {
          vB = aSize;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * uPixelRatio;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uOpacity;
        varying float vB;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d) * uOpacity * (0.5 + vB * 0.25);
          // quelques étoiles plus chaudes, la plupart blanc bleuté
          vec3 tint = mix(vec3(0.82, 0.88, 1.0), vec3(1.0, 0.9, 0.75), step(2.2, vB));
          gl_FragColor = vec4(tint, a);
        }
      `,
      transparent: true,
      depthWrite: false,
    });
    return { geometry: g, material: m };
  }, [count]);
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );
  useFrame(({ camera, gl }) => {
    const alt = camera.position.length() - 1;
    material.uniforms.uOpacity.value = smoothstep(0.15, 0.6, alt);
    material.uniforms.uPixelRatio.value = gl.getPixelRatio();
  });
  return <points geometry={geometry} material={material} frustumCulled={false} renderOrder={-1} />;
}

/**
 * Ciel vu de l'intérieur de l'atmosphère : pâle et laiteux à l'horizon,
 * plus profond au zénith. N'apparaît qu'à basse altitude.
 */
export function SkyDome() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uUp: { value: new THREE.Vector3(0, 1, 0) }, uOpacity: { value: 0 } },
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uUp;
          uniform float uOpacity;
          varying vec3 vDir;
          void main() {
            float h = dot(normalize(vDir), uUp);
            vec3 horizon = vec3(0.78, 0.84, 0.9);
            vec3 zenith = vec3(0.16, 0.38, 0.7);
            vec3 col = mix(horizon, zenith, pow(clamp(h, 0.0, 1.0), 0.55));
            gl_FragColor = vec4(col, uOpacity);
            #include <colorspace_fragment>
          }
        `,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  // Sphère centrée sur la caméra : le sol (plus proche) la masque naturellement.
  const mesh = useMemo(() => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.9, 32, 16), material);
    m.frustumCulled = false;
    return m;
  }, [material]);
  useEffect(() => () => mesh.geometry.dispose(), [mesh]);
  useFrame(({ camera }) => {
    const alt = camera.position.length() - 1;
    material.uniforms.uOpacity.value = 1 - smoothstep(0.03, 0.12, alt);
    material.uniforms.uUp.value.copy(camera.position).normalize();
    mesh.position.copy(camera.position);
  });
  return <primitive object={mesh} />;
}
