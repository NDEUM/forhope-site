"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { installations } from "@/content/architecture";
import { photos } from "@/content/media";
import { brand, blend } from "@/lib/brand";
import { smoothstep } from "@/lib/math";

/** Nombre de projecteurs réels : constant, pour ne jamais recompiler les shaders. */
const POOL = 3;
const COLOR = blend(brand.white, brand.goldLight, 0.3);

interface Spot {
  center: THREE.Vector3;
  source: THREE.Vector3;
  target: THREE.Vector3;
  intensity: number;
  angle: number;
}

/**
 * Projecteurs de musée : de vrais spots suspendus devant chaque photo
 * accrochée. Seuls les plus proches de la caméra sont allumés — la lumière
 * se pose sur le béton, s'arrête au bord des panneaux et touche le sol,
 * comme dans une vraie salle d'exposition.
 */
export function MuseumSpots() {
  const spots = useMemo<Spot[]>(
    () =>
      installations
        .filter((inst) => !inst.portal && !inst.curveRadius && inst.photo)
        .map((inst) => {
          const photo = photos[inst.photo!];
          const crop = inst.crop?.size ?? [1, 1];
          const height = inst.width / ((photo.width * crop[0]) / (photo.height * crop[1]));
          const normal = new THREE.Vector3(Math.sin(inst.rotY), 0, Math.cos(inst.rotY));
          const center = new THREE.Vector3(...inst.position);
          // Le spot recule et monte avec la taille de l'œuvre.
          const back = Math.max(2.2, inst.width * 0.45);
          const up = height * 0.5 + Math.max(1.4, inst.width * 0.22);
          const source = center.clone().addScaledVector(normal, back).setY(center.y + up);
          const target = center.clone().setY(center.y - height * 0.1);
          const reach = source.distanceTo(target);
          // Le cône déborde du cadre : c'est ce halo sur le béton qui se voit.
          const angle = Math.min(1.0, Math.atan((Math.max(inst.width, height) * 0.95) / reach));
          return { center, source, target, angle, intensity: 16 * reach * reach };
        }),
    [],
  );

  const lights = useRef<(THREE.SpotLight | null)[]>([]);
  const order = useMemo(() => spots.map((_, i) => i), [spots]);
  const dist = useMemo(() => new Float32Array(spots.length), [spots]);

  useFrame(({ camera }) => {
    for (let i = 0; i < spots.length; i++) dist[i] = camera.position.distanceTo(spots[i].center);
    order.sort((a, b) => dist[a] - dist[b]);
    for (let k = 0; k < POOL; k++) {
      const light = lights.current[k];
      if (!light) continue;
      const i = order[k];
      const s = spots[i];
      light.position.copy(s.source);
      light.target.position.copy(s.target);
      light.target.updateMatrixWorld();
      light.angle = s.angle;
      // Les spots lointains s'éteignent doucement : aucun saut quand on change de photo.
      light.intensity = s.intensity * (1 - smoothstep(45, 80, dist[i]));
    }
  });

  return (
    <>
      {Array.from({ length: POOL }, (_, k) => (
        <spotLight
          key={k}
          ref={(l) => {
            lights.current[k] = l;
          }}
          color={COLOR}
          intensity={0}
          distance={0}
          decay={2}
          penumbra={0.75}
        />
      ))}
    </>
  );
}
