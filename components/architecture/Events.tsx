"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { EVENT_PANEL, eventPanels, type EventPanel } from "@/content/architecture";
import { brand } from "@/lib/brand";

const W = 2048;
const H = 1024;

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Coupe un titre en lignes qui tiennent dans la largeur donnée. */
function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > max && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  let cx = x;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + spacing;
  }
}

/**
 * Une affiche imprimée : papier clair (ou sombre pour le Gala), titre en
 * Roboto, déclinaison officielle du logo de la campagne.
 */
async function paintPoster(panel: EventPanel, index: number, family: string) {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const dark = panel.paper === "dark";
  const ink = dark ? "#ffffff" : brand.midnight;

  // papier clair = blanc pur, pour que le logo officiel (fond blanc) se fonde dans l'affiche
  ctx.fillStyle = dark ? brand.midnight : "#ffffff";
  ctx.fillRect(0, 0, W, H);

  const logo = panel.logo ? await loadImage(panel.logo) : null;
  if (logo) {
    if (dark) {
      // Le visuel du Gala occupe la droite et se fond dans le papier sombre.
      const w = 1020;
      const h = w / (logo.width / logo.height);
      const x = W - w - 20;
      ctx.drawImage(logo, x, (H - h) / 2, w, h);
      const fade = ctx.createLinearGradient(x, 0, x + 360, 0);
      fade.addColorStop(0, brand.midnight);
      fade.addColorStop(1, "rgba(12,13,35,0)");
      ctx.fillStyle = fade;
      ctx.fillRect(x - 2, 0, 362, H);
    } else {
      const box = { x: 1180, y: 190, w: 760, h: 640 };
      const s = Math.min(box.w / logo.width, box.h / logo.height, logo.width < 400 ? 2.2 : 1);
      const w = logo.width * s;
      const h = logo.height * s;
      ctx.drawImage(logo, box.x + (box.w - w) / 2, box.y + (box.h - h) / 2, w, h);
    }
  }

  // filet d'accent (couleur secondaire de la charte, ponctuelle)
  ctx.fillStyle = panel.accent;
  ctx.fillRect(120, 150, 6, 724);

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = panel.accent;
  ctx.font = `400 36px ${family}`;
  spaced(ctx, `04.${index + 1}  ·  FOR HOPE`, 170, 196, 9);

  ctx.fillStyle = ink;
  ctx.font = `300 150px ${family}`;
  const lines = wrap(ctx, panel.title, 900);
  lines.forEach((l, i) => ctx.fillText(l, 166, 380 + i * 160));

  ctx.globalAlpha = 0.78;
  ctx.font = `300 50px ${family}`;
  wrap(ctx, panel.subtitle, 820).forEach((l, i) => ctx.fillText(l, 170, 380 + (lines.length - 1) * 160 + 110 + i * 64));
  ctx.globalAlpha = 0.6;
  ctx.font = `400 34px ${family}`;
  spaced(ctx, "DATE À VENIR", 170, 862, 8);
  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

export function Events() {
  const [group, setGroup] = useState<THREE.Group | null>(null);

  useEffect(() => {
    let cancelled = false;
    const disposables: { dispose(): void }[] = [];
    document.fonts.ready.then(async () => {
      const family = getComputedStyle(document.body).fontFamily;
      const g = new THREE.Group();
      for (const [i, panel] of eventPanels.entries()) {
        const map = await paintPoster(panel, i, family);
        if (cancelled) {
          map.dispose();
          return;
        }
        const paper = new THREE.MeshStandardMaterial({
          map,
          roughness: 0.82,
          metalness: 0,
          emissive: new THREE.Color(1, 1, 1),
          emissiveMap: map,
          emissiveIntensity: panel.paper === "dark" ? 0.55 : 0.22,
        });
        const posterGeo = new THREE.PlaneGeometry(EVENT_PANEL.posterWidth, EVENT_PANEL.posterHeight);
        const poster = new THREE.Mesh(posterGeo, paper);
        poster.position.set(0, 0.3, 0.205);

        // liseré lumineux au pied du panneau, à la couleur de la campagne
        const stripGeo = new THREE.BoxGeometry(EVENT_PANEL.posterWidth, 0.035, 0.05);
        const stripMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(panel.accent).multiplyScalar(2.2), toneMapped: false });
        const strip = new THREE.Mesh(stripGeo, stripMat);
        strip.position.set(0, -2.05, 0.24);

        const holder = new THREE.Group();
        holder.position.set(...panel.center);
        holder.rotation.y = panel.rotY;
        holder.add(poster, strip);
        g.add(holder);
        disposables.push(map, paper, posterGeo, stripGeo, stripMat);
      }
      if (!cancelled) setGroup(g);
    });
    return () => {
      cancelled = true;
      disposables.forEach((d) => d.dispose());
    };
  }, []);

  return group ? <primitive object={group} /> : null;
}
