"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ARRIVAL } from "@/content/journey";
import { journey } from "@/lib/journey-store";
import { latLonToVector3 } from "@/lib/geo";

/**
 * Projette à l'écran le point d'arrivée au Sénégal : la lumière dorée (DOM)
 * naît exactement là où se trouve le Sénégal sur le globe, quel que soit
 * le cadrage (ordinateur, mobile).
 */
export function ArrivalFocus() {
  const point = useMemo(() => latLonToVector3(ARRIVAL.focus.lat, ARRIVAL.focus.lon, 1), []);
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera }) => {
    if (journey.outroActive) return;
    v.copy(point).project(camera);
    journey.focusX = Math.min(1.2, Math.max(-0.2, (v.x + 1) / 2));
    journey.focusY = Math.min(1.2, Math.max(-0.2, (1 - v.y) / 2));
  });
  return null;
}
