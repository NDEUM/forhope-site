"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { inscriptions } from "@/content/architecture";
import { brand } from "@/lib/brand";

/** Hauteur d'une inscription dans le monde (m). */
const HEIGHT = 0.62;

/**
 * Inscriptions murales (numéro de salle, titre) peintes sur le béton :
 * texte Roboto dessiné dans une texture, pris dans la brume et caché par
 * les murs comme un vrai lettrage. Décoratives : le texte accessible est
 * dans le récit HTML.
 */
function paint(num: string, sub: string, family: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.font = `300 118px ${family}`;
  ctx.fillText(num, 6, 120);
  ctx.fillStyle = brand.saloumBlue;
  ctx.font = `400 34px ${family}`;
  // espacement de lettres (letter-spacing) dessiné à la main
  let x = 10;
  for (const ch of sub.toUpperCase()) {
    ctx.fillText(ch, x, 196);
    x += ctx.measureText(ch).width + 11;
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

export function Inscriptions() {
  const [items, setItems] = useState<{ mesh: THREE.Mesh; texture: THREE.Texture }[]>([]);

  useEffect(() => {
    let cancelled = false;
    let built: { mesh: THREE.Mesh; texture: THREE.Texture }[] = [];
    // On attend Roboto : sinon le canvas dessinerait avec une police de repli.
    document.fonts.ready.then(() => {
      if (cancelled) return;
      const family = getComputedStyle(document.body).fontFamily;
      built = inscriptions.map((item) => {
        const texture = paint(item.text, item.sub, family);
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, fog: true });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(HEIGHT * 4, HEIGHT), material);
        // L'inscription commence à la position donnée et se lit vers la droite du mur.
        mesh.position.set(...item.position);
        mesh.rotation.y = item.rotY;
        mesh.translateX(HEIGHT * 2);
        mesh.renderOrder = 2;
        return { mesh, texture };
      });
      setItems(built);
    });
    return () => {
      cancelled = true;
      built.forEach(({ mesh, texture }) => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
        texture.dispose();
      });
    };
  }, []);

  return (
    <>
      {items.map(({ mesh }, i) => (
        <primitive key={i} object={mesh} />
      ))}
    </>
  );
}
