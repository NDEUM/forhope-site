"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { LIGHT_PATH } from "@/content/journey";
import { journey } from "@/lib/journey-store";
import { latLonToVector3 } from "@/lib/geo";
import { smoothstep } from "@/lib/math";
import { brand } from "@/lib/brand";

/**
 * Le fil de lumière : un arc doré qui part de la France et se trace jusqu'au
 * Sénégal pendant le voyage — le lien entre les deux territoires d'action de
 * For Hope. Il suit l'arc de grand cercle, légèrement au-dessus du sol, et
 * s'efface quand la caméra descend sur le Sénégal.
 */
export function LightPath() {
  const { geometry, material } = useMemo(() => {
    const a = latLonToVector3(LIGHT_PATH.from.lat, LIGHT_PATH.from.lon, 1).normalize();
    const b = latLonToVector3(LIGHT_PATH.to.lat, LIGHT_PATH.to.lon, 1).normalize();
    const omega = Math.acos(THREE.MathUtils.clamp(a.dot(b), -1, 1));
    const points: THREE.Vector3[] = [];
    const N = 120;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      // interpolation sphérique (grand cercle), puis élévation en cloche
      const p = a
        .clone()
        .multiplyScalar(Math.sin((1 - t) * omega) / Math.sin(omega))
        .add(b.clone().multiplyScalar(Math.sin(t * omega) / Math.sin(omega)));
      points.push(p.normalize().multiplyScalar(1.006 + Math.sin(Math.PI * t) * 0.11));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const g = new THREE.TubeGeometry(curve, 240, 0.0055, 12, false);
    const m = new THREE.ShaderMaterial({
      uniforms: { uHead: { value: 0 }, uOpacity: { value: 0 }, uColor: { value: new THREE.Color(brand.goldMid) } },
      vertexShader: /* glsl */ `
        varying float vU;
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          vU = uv.x;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vView = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uHead;
        uniform float uOpacity;
        uniform vec3 uColor;
        varying float vU;
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          // cœur lumineux au centre du tube, bords transparents : un trait de lumière, pas une barre
          float facing = abs(dot(normalize(vNormal), normalize(vView)));
          float core = pow(facing, 2.5);
          float drawn = step(vU, uHead);
          float trail = mix(0.45, 1.0, smoothstep(uHead - 0.3, uHead, vU));
          float head = exp(-pow((vU - uHead) * 30.0, 2.0));
          float a = clamp((drawn * trail + head * 1.4) * (0.35 + core * 0.65), 0.0, 1.0) * uOpacity;
          // or chaud sur les bords, presque blanc au cœur et à la tête
          vec3 col = mix(uColor, vec3(1.0, 0.97, 0.88), clamp(core * 0.6 + head, 0.0, 1.0));
          gl_FragColor = vec4(col * 1.25, a);
        }
      `,
      transparent: true,
      depthWrite: false,
    });
    return { geometry: g, material: m };
  }, []);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame(({ camera }) => {
    const p = journey.outroActive ? 0 : journey.smooth;
    const alt = camera.position.length() - 1;
    const u = material.uniforms;
    // la tête de lumière avance au rythme de la caméra (progression linéaire)
    u.uHead.value = Math.min(1, Math.max(0, (p - LIGHT_PATH.drawFrom) / (LIGHT_PATH.drawTo - LIGHT_PATH.drawFrom))) * 1.02;
    // apparaît avec le tracé, s'efface à l'approche du sol sénégalais
    u.uOpacity.value = smoothstep(LIGHT_PATH.drawFrom - 0.02, LIGHT_PATH.drawFrom + 0.03, p) * smoothstep(0.26, 0.5, alt);
  });

  return <mesh geometry={geometry} material={material} frustumCulled={false} renderOrder={2} />;
}
