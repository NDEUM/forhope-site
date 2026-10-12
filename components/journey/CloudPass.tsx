"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CLOUDS, OUTRO_CLOUDS } from "@/content/journey";
import { journey } from "@/lib/journey-store";
import { smoothstep } from "@/lib/math";

/**
 * Traversée de la couche nuageuse, en plein écran : plusieurs plans de
 * brume qui grossissent avec la descente (la caméra avance à travers),
 * jusqu'à un blanc laiteux d'où naît la première photographie.
 */
export function CloudPass() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uPass: { value: 0 }, uTravel: { value: 0 }, uAspect: { value: 1 }, uTime: { value: 0 } },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uPass;
          uniform float uTravel;
          uniform float uAspect;
          uniform float uTime;
          varying vec2 vUv;
          float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          float noise(vec2 p) {
            vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
            return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
          }
          float fbm(vec2 p) { float v = 0.0; float a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
          void main() {
            vec2 c = (vUv - 0.5) * vec2(uAspect, 1.0);
            float acc = 0.0;
            // Trois couches : chacune grossit puis s'efface en passant « derrière » la caméra.
            for (int i = 0; i < 3; i++) {
              float k = fract(uTravel * 1.6 + float(i) / 3.0);
              float zoom = mix(2.6, 0.35, k);
              float fade = smoothstep(0.0, 0.3, k) * (1.0 - smoothstep(0.75, 1.0, k));
              vec2 p = c * zoom + float(i) * 7.31 + vec2(uTime * 0.01, 0.0);
              float d = fbm(p * 2.2 + fbm(p * 1.3) * 0.8);
              acc += smoothstep(0.42 - uPass * 0.3, 0.8, d) * fade;
            }
            float a = clamp(acc * 0.75 * uPass + smoothstep(0.55, 1.0, uPass), 0.0, 1.0);
            // Blanc chaud côté lumière, ombre légèrement bleutée dans l'épaisseur.
            vec3 col = mix(vec3(0.72, 0.8, 0.9), vec3(1.0, 0.985, 0.96), clamp(acc * 0.6 + uPass * 0.5, 0.0, 1.0));
            gl_FragColor = vec4(col, a);
            #include <colorspace_fragment>
          }
        `,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ size, clock }) => {
    const p = journey.smooth;
    const u = material.uniforms;
    if (journey.outroActive) {
      // Sortie : on part dans les nuages, ils s'ouvrent sous la caméra qui monte.
      const o = journey.outro;
      u.uPass.value = 1 - smoothstep(OUTRO_CLOUDS.from, OUTRO_CLOUDS.to, o);
      u.uTravel.value = 1 - o / OUTRO_CLOUDS.to;
    } else {
      u.uPass.value = smoothstep(CLOUDS.from, CLOUDS.peak, p);
      u.uTravel.value = (p - CLOUDS.from) / (CLOUDS.to - CLOUDS.from);
    }
    u.uAspect.value = size.width / Math.max(1, size.height);
    u.uTime.value = clock.elapsedTime;
  });

  return (
    <mesh material={material} frustumCulled={false} renderOrder={100}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}
