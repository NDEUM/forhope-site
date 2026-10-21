"use client";

import { useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { EARTH_RADIUS_KM, INTRO, outroShots, shots, type Shot } from "@/content/journey";
import { journey } from "@/lib/journey-store";
import { latLonToVector3 } from "@/lib/geo";
import { clamp, smoothstep } from "@/lib/math";

const MIN_HORIZONTAL_FOV = 50;
const DEG = Math.PI / 180;

/** Catmull-Rom uniforme sur une suite de valeurs. */
function catmull(p0: number, p1: number, p2: number, p3: number, t: number) {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

/** Les grandeurs interpolées d'un plan (altitude en log : l'échelle change régulièrement). */
const channels = (s: Shot) => [s.camera.lat, s.camera.lon, Math.log(s.camera.alt), s.target.lat, s.target.lon, s.target.alt, s.fov];

function createPath(shots: Shot[]) {
  const rows = shots.map(channels);
  const out = new Array<number>(7);
  return (progress: number) => {
    const p = clamp(progress);
    let k = 0;
    while (k < shots.length - 2 && p > shots[k + 1].at) k++;
    const a = shots[k].at;
    const b = shots[k + 1].at;
    // Lissage dans chaque segment : la caméra freine en approchant d'un repère.
    const t = (p - a) / (b - a);
    const e = t * t * (3 - 2 * t) * 0.55 + t * 0.45;
    const r0 = rows[Math.max(0, k - 1)];
    const r1 = rows[k];
    const r2 = rows[k + 1];
    const r3 = rows[Math.min(rows.length - 1, k + 2)];
    for (let i = 0; i < 7; i++) out[i] = catmull(r0[i], r1[i], r2[i], r3[i], e);
    return out;
  };
}

/**
 * Caméra drone : position et visée en coordonnées géographiques, sur une
 * trajectoire continue. En haute altitude le nord reste en haut ; en
 * descendant, la caméra s'incline et l'horizon se redresse.
 */
export function JourneyCamera() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const path = useMemo(() => createPath(shots), []);
  // La sortie, en bas du site : même caméra, plan de vol inverse.
  const outroPath = useMemo(() => createPath(outroShots), []);
  const introRow = useMemo(() => channels(INTRO.shot), []);
  const v = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      target: new THREE.Vector3(),
      normal: new THREE.Vector3(),
      north: new THREE.Vector3(),
      view: new THREE.Vector3(),
      up: new THREE.Vector3(),
    }),
    [],
  );

  useFrame(({ size, clock }) => {
    // La progression amortie est calculée par JourneyDirector : caméra et
    // repères typographiques partagent exactement le même temps.
    let [lat, lon, logAlt, tLat, tLon, tAlt, fovBase] = journey.outroActive ? outroPath(journey.outro) : path(journey.smooth);
    // Réglage des plans en développement : window.__shot = { camera, target, fov }.
    if (process.env.NODE_ENV !== "production") {
      const dev = (window as unknown as { __shot?: Shot }).__shot;
      if (dev) [lat, lon, logAlt, tLat, tLon, tAlt, fovBase] = channels(dev);
    }
    // Ouverture : depuis la Terre en miniature, au loin, jusqu'au premier plan.
    if (!journey.outroActive && journey.intro < 1) {
      const t = clamp((journey.intro - INTRO.move) / (1 - INTRO.move));
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const k = 1 - e;
      lat += (introRow[0] - lat) * k;
      lon += (introRow[1] - lon) * k;
      logAlt += (introRow[2] - logAlt) * k;
      tLat += (introRow[3] - tLat) * k;
      tLon += (introRow[4] - tLon) * k;
      tAlt += (introRow[5] - tAlt) * k;
      fovBase += (introRow[6] - fovBase) * k;
    }
    let alt = Math.exp(logAlt);
    // Écran vertical : le champ est plus haut, l'horizon apparaîtrait ; au début
    // du voyage, la caméra se rapproche pour que la Terre remplisse l'écran.
    if (!journey.outroActive && size.width < size.height) alt *= 1 - 0.38 * smoothstep(0.35, 0.72, alt);
    latLonToVector3(lat, lon, 1 + alt, v.pos);
    latLonToVector3(tLat, tLon, 1 + tAlt, v.target);

    // Respiration du drone : quelques mètres de vie, proportionnels à l'altitude.
    const t = clock.elapsedTime;
    const drift = alt * 0.004;
    v.pos.x += Math.sin(t * 0.21) * drift;
    v.pos.y += Math.sin(t * 0.17 + 1.3) * drift;

    // Haut de l'image : le nord vu du dessus, la verticale du lieu quand on regarde l'horizon.
    v.normal.copy(v.pos).normalize();
    const phi = lat * DEG;
    const lambda = lon * DEG;
    v.north.set(-Math.sin(phi) * Math.cos(lambda), Math.cos(phi), Math.sin(phi) * Math.sin(lambda));
    v.view.subVectors(v.target, v.pos).normalize();
    // La verticale du lieu, projetée perpendiculairement à la visée : horizon
    // toujours de niveau. En visée plongeante (verticale ≈ visée), le nord.
    v.up.copy(v.normal).addScaledVector(v.view, -v.normal.dot(v.view));
    const level = v.up.length();
    v.up.divideScalar(Math.max(level, 1e-6));
    v.up.lerp(v.north, 1 - smoothstep(0.12, 0.45, level)).normalize();

    camera.position.copy(v.pos);
    camera.up.copy(v.up);
    camera.lookAt(v.target);

    // Plans de coupe adaptés à l'altitude (précision du z-buffer).
    const near = Math.max(alt * 0.05, 0.0004);
    const aspect = size.width / Math.max(1, size.height);
    const minVertical = (2 * Math.atan(Math.tan((MIN_HORIZONTAL_FOV * DEG) / 2) / aspect)) / DEG;
    const fov = Math.min(75, aspect < 1 ? Math.max(fovBase, minVertical) : fovBase);
    if (Math.abs(camera.near - near) > near * 0.05 || Math.abs(camera.fov - fov) > 0.01) {
      camera.near = near;
      camera.far = 200;
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    journey.altitudeKm = alt * EARTH_RADIUS_KM;
  });

  return null;
}
