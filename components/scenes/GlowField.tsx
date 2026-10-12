"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createGlowMaterial, quadGeometry } from "@/components/scenes/glowMaterial";
import { experience } from "@/lib/experience-store";
import { seeded } from "@/lib/math";

export interface GlowInit {
  pos: THREE.Vector3;
  scale: number;
  color: THREE.Color;
}

interface GlowFieldProps {
  count: number;
  seed: number;
  init: (i: number, rand: () => number, out: GlowInit) => void;
  /** Opacité globale à une progression donnée (0 = champ masqué). */
  opacity: (progress: number) => number;
  color?: string;
  core?: number;
  fogFade?: number;
  fog?: boolean;
  additive?: boolean;
  /** Amplitude de la dérive individuelle (m). 0 = statique. */
  drift?: number;
  renderOrder?: number;
}

/**
 * Champ de lumières instanciées (un draw call). Chaque point dérive avec sa
 * propre phase : la scène respire sans rotation globale.
 */
export function GlowField({
  count,
  seed,
  init,
  opacity,
  color,
  core,
  fogFade,
  fog = true,
  additive = true,
  drift = 0,
  renderOrder = 0,
}: GlowFieldProps) {
  const { mesh, base, phases } = useMemo(() => {
    const material = createGlowMaterial({ color, core, fogFade, additive });
    material.fog = fog;
    const m = new THREE.InstancedMesh(quadGeometry(), material, count);
    m.frustumCulled = false;
    m.renderOrder = renderOrder;
    const rand = seeded(seed);
    const b = new Float32Array(count * 4);
    const ph = new Float32Array(count * 2);
    const tmp: GlowInit = { pos: new THREE.Vector3(), scale: 1, color: new THREE.Color(1, 1, 1) };
    const matrix = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      tmp.color.setRGB(1, 1, 1);
      init(i, rand, tmp);
      b.set([tmp.pos.x, tmp.pos.y, tmp.pos.z, tmp.scale], i * 4);
      ph[i * 2] = rand() * Math.PI * 2;
      ph[i * 2 + 1] = 0.15 + rand() * 0.35;
      matrix.makeScale(tmp.scale, tmp.scale, tmp.scale).setPosition(tmp.pos);
      m.setMatrixAt(i, matrix);
      m.setColorAt(i, tmp.color);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    return { mesh: m, base: b, phases: ph };
    // Le champ est construit une seule fois : les props sont des constantes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => () => {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
      mesh.dispose();
    },
    [mesh],
  );

  const matrix = useMemo(() => new THREE.Matrix4(), []);

  useFrame(({ clock }) => {
    const o = opacity(experience.smooth);
    mesh.visible = o > 0.002;
    if (!mesh.visible) return;
    (mesh.material as THREE.ShaderMaterial).uniforms.uOpacity.value = o;
    if (drift <= 0 || experience.reducedMotion) return;
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const j = i * 4;
      const ph = phases[i * 2];
      const sp = phases[i * 2 + 1];
      const s = base[j + 3];
      matrix
        .makeScale(s, s, s)
        .setPosition(
          base[j] + Math.sin(t * sp + ph) * drift,
          base[j + 1] + Math.sin(t * sp * 0.8 + ph * 1.7) * drift * 0.6,
          base[j + 2] + Math.cos(t * sp * 0.9 + ph) * drift,
        );
      mesh.setMatrixAt(i, matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return <primitive object={mesh} />;
}
