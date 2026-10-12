import * as THREE from "three";
import { seeded } from "@/lib/math";

/**
 * Béton banché généré une fois (aucune image à télécharger) : grain fin,
 * nuances douces, joints de banches et trous de serrage, comme un béton
 * architectonique. Une tuile = 2,4 m (voir worldBox).
 */
export function createConcreteTexture(size = 1024) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const rand = seeded(31);

  ctx.fillStyle = "rgb(128,128,128)";
  ctx.fillRect(0, 0, size, size);

  // Nuances : grandes taches très douces.
  for (let i = 0; i < 26; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = size * (0.08 + rand() * 0.25);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const tone = rand() < 0.5 ? "0,0,0" : "255,255,255";
    g.addColorStop(0, `rgba(${tone},${0.035 + rand() * 0.05})`);
    g.addColorStop(1, `rgba(${tone},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }

  // Grain : bruit basse résolution, étiré et adouci (pas de moiré au loin).
  const small = document.createElement("canvas");
  small.width = small.height = size / 4;
  const sctx = small.getContext("2d")!;
  const img = sctx.createImageData(small.width, small.height);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = 128 + (rand() - 0.5) * 70;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = n;
    img.data[i + 3] = 255;
  }
  sctx.putImageData(img, 0, 0);
  ctx.globalAlpha = 0.16;
  ctx.filter = "blur(1.5px)";
  ctx.drawImage(small, 0, 0, size, size);
  ctx.filter = "none";
  ctx.globalAlpha = 1;

  // Joints de banches (bords de tuile + mi-hauteur).
  ctx.strokeStyle = "rgba(0,0,0,0.22)";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, size - 2, size - 2);
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath();
  ctx.moveTo(0, size / 2);
  ctx.lineTo(size, size / 2);
  ctx.stroke();

  // Trous de serrage.
  for (const fx of [0.2, 0.8]) {
    for (const fy of [0.25, 0.75]) {
      const x = fx * size;
      const y = fy * size;
      const g = ctx.createRadialGradient(x, y, 0, x, y, size * 0.012);
      g.addColorStop(0, "rgba(0,0,0,0.55)");
      g.addColorStop(0.6, "rgba(0,0,0,0.25)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.012, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/** Une dalle du sol poli = 6 m : granulats, nuances douces, joints sciés. */
export const FLOOR_TILE = 6;

export function createFloorTexture(size = 1024) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const rand = seeded(57);

  ctx.fillStyle = "rgb(150,150,152)";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 18; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = size * (0.12 + rand() * 0.3);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const tone = rand() < 0.55 ? "0,0,0" : "255,255,255";
    g.addColorStop(0, `rgba(${tone},${0.03 + rand() * 0.04})`);
    g.addColorStop(1, `rgba(${tone},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }

  // granulats : petites mouchetures claires et sombres
  for (let i = 0; i < 2600; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 0.6 + rand() * 1.6;
    ctx.fillStyle = rand() < 0.5 ? `rgba(255,255,255,${0.05 + rand() * 0.08})` : `rgba(0,0,0,${0.05 + rand() * 0.1})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // joints sciés (bords de dalle)
  ctx.strokeStyle = "rgba(0,0,0,0.42)";
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, size - 3, size - 3);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
