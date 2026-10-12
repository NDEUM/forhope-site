import * as THREE from "three";
import type { Region } from "@/content/journey";
import { brand } from "@/lib/brand";
import { seeded, valueNoise2D } from "@/lib/math";

export interface GeoCountry {
  id: string;
  name: string;
  rings: [number, number][][];
}

export interface GeoData {
  countries: GeoCountry[];
}

/** Bruit fractal en niveaux de gris (grain du sol, purement artistique). */
function noiseCanvas(size: number, seed: number) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  const n = valueNoise2D(seeded(seed), 256);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let v = 0;
      let amp = 0.5;
      let f = 6 / size;
      for (let o = 0; o < 5; o++) {
        v += n(x * f * 16, y * f * 16) * amp;
        amp *= 0.5;
        f *= 2.1;
      }
      const c = Math.max(0, Math.min(255, v * 255));
      const i = (y * size + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = c;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/**
 * Carte régionale pour l'approche à basse altitude :
 *  - fond : l'image satellite (Blue Marble) de la même emprise ;
 *  - côtes et frontières exactes (Natural Earth 1:10m) : le trait de côte
 *    reste net même quand l'image satellite devient floue ;
 *  - grain de sol procédural (artistique) ;
 *  - la silhouette du Sénégal, soulignée en Saloum Blue.
 */
export function paintRegion(region: Region, day: HTMLImageElement, geo: GeoData, size: number, highlight = "Senegal") {
  // Vue rapprochée : traits plus fins et plus discrets (on regarde le territoire, pas la carte).
  const close = region.east - region.west < 12;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const spanLon = region.east - region.west;
  const spanLat = region.north - region.south;
  const px = (lon: number) => ((lon - region.west) / spanLon) * size;
  const py = (lat: number) => ((region.north - lat) / spanLat) * size;

  // 1. L'image satellite de la même emprise.
  const W = day.naturalWidth;
  const H = day.naturalHeight;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    day,
    ((region.west + 180) / 360) * W,
    ((90 - region.north) / 180) * H,
    (spanLon / 360) * W,
    (spanLat / 180) * H,
    0,
    0,
    size,
    size,
  );

  // 2. Tracés exacts.
  const land = new Path2D();
  const byCountry = new Map<string, Path2D>();
  for (const c of geo.countries) {
    const path = new Path2D();
    for (const ring of c.rings) {
      ring.forEach(([lon, lat], i) => (i ? path.lineTo(px(lon), py(lat)) : path.moveTo(px(lon), py(lat))));
      path.closePath();
    }
    land.addPath(path);
    byCountry.set(c.name, path);
  }
  const lw = size / 1024;

  // 3. Mer : couleur profonde homogène, eaux claires le long des côtes.
  ctx.save();
  const sea = new Path2D();
  sea.rect(0, 0, size, size);
  sea.addPath(land);
  ctx.clip(sea, "evenodd");
  ctx.globalAlpha = 0.78;
  ctx.fillStyle = "#06173a";
  ctx.fillRect(0, 0, size, size);
  ctx.globalAlpha = 0.22;
  ctx.filter = `blur(${Math.round(10 * lw)}px)`;
  ctx.strokeStyle = brand.saloumBlue;
  ctx.lineWidth = 16 * lw;
  ctx.stroke(land);
  ctx.filter = "none";
  ctx.restore();

  // 4. Sol : grain fin (overlay), sans changer les teintes réelles.
  ctx.save();
  ctx.clip(land);
  const grain = noiseCanvas(512, 7);
  const pattern = ctx.createPattern(grain, "repeat")!;
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = 0.32;
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, size, size);
  ctx.globalAlpha = 0.18;
  ctx.setTransform(0.35, 0, 0, 0.35, 0, 0);
  ctx.fillRect(0, 0, size / 0.35, size / 0.35);
  ctx.restore();

  // 5. Côtes et frontières : traits fins, comme un repère de documentaire.
  ctx.lineJoin = "round";
  ctx.strokeStyle = close ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.16)";
  ctx.lineWidth = (close ? 0.8 : 1.1) * lw;
  for (const path of byCountry.values()) ctx.stroke(path);

  // 6. Le Sénégal.
  const target = byCountry.get(highlight);
  if (target) {
    ctx.save();
    ctx.clip(target);
    ctx.fillStyle = "rgba(61,178,222,0.06)";
    ctx.fillRect(0, 0, size, size);
    ctx.restore();
    ctx.save();
    ctx.shadowColor = "rgba(61,178,222,0.45)";
    ctx.shadowBlur = (close ? 2 : 6) * lw;
    ctx.strokeStyle = close ? "rgba(61,178,222,0.45)" : "rgba(61,178,222,0.85)";
    ctx.lineWidth = (close ? 0.9 : 1.5) * lw;
    ctx.stroke(target);
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}
