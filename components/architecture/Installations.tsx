"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { QualityTier } from "@/lib/experience-store";
import { installations, lanterns, type Installation } from "@/content/architecture";
import { photos } from "@/content/media";
import { brand, blend } from "@/lib/brand";
import { experience } from "@/lib/experience-store";
import { smoothstep } from "@/lib/math";

const URLS = Array.from(
  new Set([...installations.flatMap((i) => (i.photo ? [photos[i.photo].src] : [])), ...lanterns.map((l) => photos[l.photo].src)]),
);

/**
 * Une photographie qui fait partie du bâtiment : caisson lumineux sans
 * bordure de « carte », monochrome et flou au loin, nette et en couleur
 * de près, grain argentique, légère parallaxe interne.
 */
function createInstallationMaterial(map: THREE.Texture | null, inst: Installation) {
  const crop = inst.crop ?? { size: [1, 1], offset: [0, 0] };
  return new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: map },
      uHasMap: { value: map ? 1 : 0 },
      uCrop: { value: new THREE.Vector4(crop.size[0], crop.size[1], crop.offset[0], crop.offset[1]) },
      uFlipX: { value: inst.curveRadius ? 1 : 0 },
      uDark: { value: new THREE.Color(brand.midnight) },
      uLight: { value: new THREE.Color(blend(brand.white, brand.saloumBlue, 0.25)) },
      uFocus: { value: 0 },
      uOpacity: { value: 1 },
      uParallax: { value: new THREE.Vector2() },
      uTime: { value: 0 },
      uFogDensity: { value: 0.011 },
      uFogColor: { value: new THREE.Color(blend(brand.midnight, brand.white, 0.045)) },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying float vDepth;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform float uHasMap;
      uniform vec4 uCrop;
      uniform float uFlipX;
      uniform vec3 uDark;
      uniform vec3 uLight;
      uniform float uFocus;
      uniform float uOpacity;
      uniform vec2 uParallax;
      uniform float uTime;
      uniform float uFogDensity;
      uniform vec3 uFogColor;
      varying vec2 vUv;
      varying float vDepth;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main() {
        vec2 uv = vUv;
        if (uFlipX > 0.5) uv.x = 1.0 - uv.x;
        uv = (uv - 0.5) * 0.96 + 0.5 + uParallax;
        uv = uCrop.zw + uv * uCrop.xy;
        vec3 col;
        if (uHasMap > 0.5) {
          float r = (1.0 - uFocus) * 0.006;
          vec3 tex = texture2D(uMap, uv).rgb * 0.36;
          tex += texture2D(uMap, uv + vec2(r, 0.0)).rgb * 0.16;
          tex += texture2D(uMap, uv - vec2(r, 0.0)).rgb * 0.16;
          tex += texture2D(uMap, uv + vec2(0.0, r)).rgb * 0.16;
          tex += texture2D(uMap, uv - vec2(0.0, r)).rgb * 0.16;
          float l = dot(tex, vec3(0.2126, 0.7152, 0.0722));
          vec3 mono = mix(uDark, uLight, pow(l, 0.85));
          col = mix(mono, tex, smoothstep(0.35, 1.0, uFocus));
        } else {
          col = uDark;
        }
        // caisson lumineux : léger vignettage, comme un tirage rétroéclairé
        vec2 c = vUv - 0.5;
        col *= mix(0.78, 1.0, smoothstep(0.75, 0.2, length(c * vec2(1.0, 1.2))));
        col *= 0.94;
        col += (hash(gl_FragCoord.xy * 0.5 + fract(uTime * 7.0) * 113.0) - 0.5) * 0.045;
        // la brume s'interpose aussi devant les photos lointaines
        float fogF = 1.0 - exp(-uFogDensity * uFogDensity * vDepth * vDepth);
        col = mix(col, uFogColor, fogF);
        gl_FragColor = vec4(col, uOpacity);
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    side: inst.curveRadius ? THREE.BackSide : THREE.DoubleSide,
  });
}

function Piece({ inst, texture, tier }: { inst: Installation; texture: THREE.Texture | null; tier: QualityTier }) {
  const photo = inst.photo ? photos[inst.photo] : null;
  const crop = inst.crop?.size ?? [1, 1];
  const aspect = photo ? (photo.width * crop[0]) / (photo.height * crop[1]) : 1.5;
  const height = inst.width / aspect;

  const { group, material, disposables } = useMemo(() => {
    const mat = createInstallationMaterial(texture, inst);
    const g = new THREE.Group();
    const toDispose: { dispose(): void }[] = [mat];
    if (inst.curveRadius) {
      const r = inst.curveRadius;
      const theta = inst.width / r;
      const geo = new THREE.CylinderGeometry(r, r, height, 64, 1, true, Math.PI - theta / 2, theta);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(inst.position[0], inst.position[1], inst.position[2] + r);
      g.add(mesh);
      toDispose.push(geo);
    } else {
      const geo = new THREE.PlaneGeometry(inst.width, height);
      const mesh = new THREE.Mesh(geo, mat);
      g.add(mesh);
      toDispose.push(geo);
      if (inst.frame) {
        const frameGeo = new THREE.BoxGeometry(inst.width + 0.14, height + 0.14, 0.1);
        const frameMat = new THREE.MeshStandardMaterial({ color: "#1d1f2b", metalness: 0.75, roughness: 0.4 });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.z = -0.07;
        frame.castShadow = true;
        g.add(frame);
        toDispose.push(frameGeo, frameMat);
      }
      // En qualité haute, de vrais projecteurs éclairent le mur (MuseumSpots) : pas de lavis peint.
      if (!inst.portal && tier !== "high") {
        const washGeo = new THREE.PlaneGeometry(inst.width * 1.9, height * 2.1);
        const washMat = washMaterial();
        const wash = new THREE.Mesh(washGeo, washMat);
        wash.position.set(0, height * 0.12, -0.025);
        wash.renderOrder = 0;
        g.add(wash);
        toDispose.push(washGeo, washMat);
      }
      g.position.set(...inst.position);
      g.rotation.y = inst.rotY;
    }
    return { group: g, material: mat, disposables: toDispose };
  }, [inst, texture, height, tier]);

  useEffect(() => () => disposables.forEach((d) => d.dispose()), [disposables]);

  const camera = useThree((s) => s.camera);
  const scene = useThree((s) => s.scene);
  const tmp = useMemo(
    () => ({ center: new THREE.Vector3(...inst.position), normal: new THREE.Vector3(), to: new THREE.Vector3(), right: new THREE.Vector3() }),
    [inst],
  );

  useFrame(({ clock }) => {
    const u = material.uniforms;
    tmp.to.subVectors(tmp.center, camera.position);
    const dist = tmp.to.length();
    // Distance à la surface (plan ou cylindre) : pour la traversée des portails.
    let surface: number;
    if (inst.curveRadius) {
      const dx = camera.position.x - inst.position[0];
      const dz = camera.position.z - (inst.position[2] + inst.curveRadius);
      surface = Math.abs(Math.hypot(dx, dz) - inst.curveRadius);
    } else {
      tmp.normal.set(Math.sin(inst.rotY), 0, Math.cos(inst.rotY));
      surface = Math.abs(tmp.to.dot(tmp.normal));
    }
    const portal = inst.portal ? smoothstep(0.35, 1.6, surface) : 1;
    u.uOpacity.value = portal;
    u.uFocus.value = smoothstep(Math.max(26, inst.width * 2.8), Math.max(9, inst.width * 1.8), dist);
    u.uTime.value = experience.reducedMotion ? 0 : clock.elapsedTime;
    const fog = scene.fog as THREE.FogExp2 | null;
    if (fog) {
      u.uFogDensity.value = fog.density;
      u.uFogColor.value.copy(fog.color);
    }
    // Parallaxe interne : l'image glisse un peu dans son cadre quand on passe.
    tmp.right.set(Math.cos(inst.rotY), 0, -Math.sin(inst.rotY));
    tmp.to.normalize();
    u.uParallax.value.set(tmp.to.dot(tmp.right) * 0.02, tmp.to.y * 0.012);
    group.visible = portal > 0.002;
  });

  return <primitive object={group} />;
}

/**
 * Éclairage de musée : la tache d'un projecteur de plafond sur le mur,
 * nette en haut, qui s'ouvre et s'éteint en descendant derrière la photo.
 */
const washMaterial = () =>
  new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(blend(brand.white, brand.goldLight, 0.35)) }, uOpacity: { value: 0.32 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying float vDepth;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying vec2 vUv;
      varying float vDepth;
      void main() {
        // « Feston » d'un projecteur de plafond : le cône naît net en haut,
        // s'élargit en descendant et s'éteint doucement avant le sol.
        float t = 1.0 - vUv.y;
        float w = 0.16 + t * 0.42;
        float x = abs(vUv.x - 0.5);
        float a = 1.0 - smoothstep(w * 0.55, w, x);
        a *= smoothstep(0.02, 0.09, t);
        a *= 1.0 - smoothstep(0.6, 1.0, t);
        a *= 1.15 - t * 0.7;
        a *= uOpacity * (1.0 - smoothstep(30.0, 70.0, vDepth));
        gl_FragColor = vec4(uColor, a);
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    // Posé contre le mur : on évite qu'il se batte avec la surface du béton.
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -8,
  });

/** Vue du ciel : chaque photo devient une surface de lumière sur le toit. */
function Lantern({ item, texture }: { item: (typeof lanterns)[number]; texture: THREE.Texture }) {
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture,
        color: new THREE.Color(1.15, 1.15, 1.15),
        toneMapped: false,
        transparent: true,
        opacity: 0,
        fog: false,
        depthWrite: false,
      }),
    [texture],
  );
  useEffect(() => () => material.dispose(), [material]);
  const mesh = useMemo(() => new THREE.Mesh(new THREE.PlaneGeometry(item.size[0], item.size[1]), material), [item, material]);
  useEffect(() => () => mesh.geometry.dispose(), [mesh]);

  const halo = useMemo(() => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(item.size[0] * 1.9, item.size[1] * 2.2),
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(blend(brand.white, brand.saloumBlue, 0.35)) }, uOpacity: { value: 0 } },
        vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
        fragmentShader:
          "uniform vec3 uColor; uniform float uOpacity; varying vec2 vUv; void main(){ vec2 d = (vUv - 0.5) * 2.0; float a = pow(max(0.0, 1.0 - length(d)), 2.2) * uOpacity; gl_FragColor = vec4(uColor, a); }",
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    );
    return m;
  }, [item]);
  useEffect(
    () => () => {
      halo.geometry.dispose();
      (halo.material as THREE.Material).dispose();
    },
    [halo],
  );

  useFrame(({ camera }) => {
    const o = smoothstep(28, 95, camera.position.y);
    material.opacity = o;
    (halo.material as THREE.ShaderMaterial).uniforms.uOpacity.value = o * 0.55;
    mesh.visible = halo.visible = o > 0.003;
  });

  return (
    <group position={item.center} rotation={[-Math.PI / 2, 0, Math.PI]}>
      <primitive object={halo} position={[0, 0, -0.02]} renderOrder={5} />
      <primitive object={mesh} renderOrder={6} />
    </group>
  );
}

function PieceSet({ tier }: { tier: QualityTier }) {
  const textures = useTexture(URLS);
  const gl = useThree((s) => s.gl);
  const bySrc = useMemo(() => {
    const anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    const map = new Map<string, THREE.Texture>();
    URLS.forEach((src, i) => {
      const t = textures[i];
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = anisotropy;
      t.needsUpdate = true;
      map.set(src, t);
    });
    return map;
  }, [textures, gl]);

  useEffect(() => () => useTexture.clear(URLS), []);

  return (
    <>
      {installations.map((inst) => (
        <Piece key={inst.id} inst={inst} tier={tier} texture={inst.photo ? bySrc.get(photos[inst.photo].src) ?? null : null} />
      ))}
      {lanterns.map((l, i) => (
        <Lantern key={i} item={l} texture={bySrc.get(photos[l.photo].src)!} />
      ))}
    </>
  );
}

export function Installations({ tier }: { tier: QualityTier }) {
  return (
    <Suspense fallback={null}>
      <PieceSet tier={tier} />
    </Suspense>
  );
}
