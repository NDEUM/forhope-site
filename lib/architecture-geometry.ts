import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/** Un volume défini par ses limites dans le monde (mètres). */
export interface BoxExtents {
  x: [number, number];
  y: [number, number];
  z: [number, number];
}

/** Un volume tourné autour de Y (panneaux libres). */
export interface RotatedBox {
  center: [number, number, number];
  size: [number, number, number];
  rotY: number;
}

/** Taille d'une « banche » de béton : la texture se répète tous les TILE mètres. */
const TILE = 2.4;

/**
 * Boîte aux UV à l'échelle du monde : la texture béton garde la même taille
 * sur un mur de 2 m et sur un mur de 40 m (pas d'étirement).
 */
export function worldBox(w: number, h: number, d: number) {
  const g = new THREE.BoxGeometry(w, h, d);
  const uv = g.attributes.uv as THREE.BufferAttribute;
  // Ordre des faces de BoxGeometry : +x, -x, +y, -y, +z, -z (4 sommets chacune).
  const faceSize: [number, number][] = [
    [d, h],
    [d, h],
    [w, d],
    [w, d],
    [w, h],
    [w, h],
  ];
  for (let f = 0; f < 6; f++) {
    const [su, sv] = faceSize[f];
    for (let v = 0; v < 4; v++) {
      const i = f * 4 + v;
      uv.setXY(i, (uv.getX(i) * su) / TILE, (uv.getY(i) * sv) / TILE);
    }
  }
  return g;
}

export function boxFromExtents({ x, y, z }: BoxExtents) {
  const w = Math.abs(x[1] - x[0]);
  const h = Math.abs(y[1] - y[0]);
  const d = Math.abs(z[1] - z[0]);
  const g = worldBox(w, h, d);
  g.translate((x[0] + x[1]) / 2, (y[0] + y[1]) / 2, (z[0] + z[1]) / 2);
  return g;
}

export function boxFromRotated({ center, size, rotY }: RotatedBox) {
  const g = worldBox(size[0], size[1], size[2]);
  g.rotateY(rotY);
  g.translate(center[0], center[1], center[2]);
  return g;
}

/** Fusionne des volumes statiques en une seule géométrie (un draw call). */
export function mergeBoxes(parts: THREE.BufferGeometry[]) {
  const merged = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  return merged;
}
