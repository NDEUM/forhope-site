import * as THREE from "three";
import type { GeoPoint } from "@/content/journey";

const DEG = Math.PI / 180;

/**
 * Coordonnées géographiques → position 3D, alignée sur les UV de
 * THREE.SphereGeometry (texture équirectangulaire : u = 0 à 180° O).
 * Longitude 0 sur +X, 90° E sur -Z, pôle Nord sur +Y.
 */
export function latLonToVector3(lat: number, lon: number, radius = 1, out = new THREE.Vector3()) {
  const phi = lat * DEG;
  const lambda = lon * DEG;
  const c = Math.cos(phi);
  return out.set(c * Math.cos(lambda) * radius, Math.sin(phi) * radius, -c * Math.sin(lambda) * radius);
}

export const geoToVector3 = (p: GeoPoint, out?: THREE.Vector3) => latLonToVector3(p.lat, p.lon, 1 + p.alt, out);
