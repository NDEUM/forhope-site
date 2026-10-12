"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { createCameraPath, restPoints } from "@/lib/camera-path";
import { experience } from "@/lib/experience-store";
import { clamp, damp, smoothstep } from "@/lib/math";
import { passageAt } from "@/lib/transitions";

/** Rattrapage du scroll : bas = caméra lourde, travelling sur rail. */
const FOLLOW = 1.5;
/** Champ horizontal minimal (°) : sur mobile la caméra reste lisible. */
const MIN_HORIZONTAL_FOV = 52;

const nearestRest = (p: number) => restPoints.reduce((best, r) => (Math.abs(r - p) < Math.abs(best - p) ? r : best), 0);

/**
 * Caméra de cinéma : elle suit un rail (content/scenes.ts → shots),
 * avec de l'inertie, une respiration à peine perceptible et une focale
 * qui se resserre devant les photos.
 */
export function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const path = useMemo(() => createCameraPath(), []);
  const state = useRef({ smooth: experience.progress, initialized: false, veil: 0, px: 0, py: 0 });
  const pos = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock, size }, rawDt) => {
    const dt = Math.min(rawDt, 0.1);
    const s = state.current;
    const reduced = experience.reducedMotion;
    const target = reduced ? nearestRest(experience.progress) : experience.progress;
    if (!s.initialized || reduced) {
      s.smooth = target;
      s.initialized = true;
    } else {
      s.smooth = damp(s.smooth, target, FOLLOW, dt);
    }
    experience.smooth = s.smooth;

    let fov = path.sample(s.smooth, pos, look);

    // Passage d'un espace à l'autre : voile bref + respiration de focale.
    const passage = reduced ? { veil: 0, color: "" } : passageAt(s.smooth);
    fov += passage.veil * 9;
    const root = document.documentElement.style;
    if (Math.abs(passage.veil - s.veil) > 0.002) {
      s.veil = passage.veil;
      root.setProperty("--veil", passage.veil.toFixed(3));
      if (passage.veil > 0.004) root.setProperty("--veil-color", passage.color);
    }

    // Hero : travelling d'ouverture (la caméra avance dans la lumière) et
    // cadre qui suit la souris de quelques centimètres. Disparaît au scroll.
    const hero = 1 - smoothstep(0.004, 0.03, s.smooth);
    if (hero > 0) {
      s.px = damp(s.px, experience.pointer.x, 2.2, dt);
      s.py = damp(s.py, experience.pointer.y, 2.2, dt);
      pos.z += (1 - experience.intro) * 2.4 * hero;
      pos.y += (1 - experience.intro) * 0.25 * hero;
      pos.x += s.px * 0.35 * hero;
      look.x += s.px * 1.6 * hero;
      look.y -= s.py * 0.9 * hero;
    }

    if (!reduced) {
      // Stabilisateur : quelques millimètres de vie, plus en altitude (drone).
      const t = clock.elapsedTime;
      const amp = 0.012 + clamp(pos.y / 200) * 0.9;
      pos.x += Math.sin(t * 0.17) * amp;
      pos.y += Math.sin(t * 0.13 + 1.7) * amp * 0.6;
      look.x += Math.sin(t * 0.11 + 0.4) * amp * 0.4;
    }

    camera.position.copy(pos);
    camera.lookAt(look);

    const aspect = size.width / Math.max(1, size.height);
    const minVertical = (2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(MIN_HORIZONTAL_FOV) / 2) / aspect) * 180) / Math.PI;
    fov = Math.min(80, Math.max(fov, aspect < 1 ? minVertical : fov));
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
