import { toGlobal, type SceneId } from "@/content/scenes";
import { brand, blend } from "@/lib/brand";

/**
 * Les passages entre les espaces : à l'instant où la caméra franchit un
 * seuil, un voile très bref (lumière ou nuit) et une légère respiration
 * de la focale — comme une coupe de montage dans un plan continu.
 */
interface Passage {
  scene: SceneId;
  /** Instant du franchissement (progression locale de l'espace). */
  at: number;
  color: string;
  /** Opacité maximale du voile. */
  strength: number;
  /** Largeur (progression globale) : plus petit = plus bref. */
  width: number;
}

const raw: Passage[] = [
  // la fente du Seuil : on débouche dans la cour baignée de jour
  { scene: "rencontre", at: 0.045, color: blend(brand.white, brand.goldLight, 0.25), strength: 0.38, width: 0.008 },
  // la photo incurvée : on la traverse, l'image se referme en nuit
  { scene: "rencontre", at: 0.94, color: brand.midnight, strength: 0.7, width: 0.007 },
  // la petite photo au bout de la galerie : un éclair, puis l'immensité
  { scene: "salle", at: 0.016, color: blend(brand.white, brand.saloumBlue, 0.12), strength: 0.55, width: 0.005 },
  // l'ouverture de la grande salle : la lumière de la cour
  { scene: "evenements", at: 0.19, color: blend(brand.white, brand.goldLight, 0.2), strength: 0.28, width: 0.01 },
  // sortie vers le paysage
  { scene: "dehors", at: 0.03, color: brand.midnight, strength: 0.25, width: 0.01 },
];

const passages = raw.map((p) => ({ ...p, at: toGlobal(p.scene, p.at) }));

/** Intensité du passage le plus proche et sa couleur. */
export function passageAt(progress: number) {
  let best = 0;
  let color = passages[0].color;
  for (const p of passages) {
    const d = (progress - p.at) / p.width;
    const v = p.strength * Math.exp(-d * d);
    if (v > best) {
      best = v;
      color = p.color;
    }
  }
  return { veil: best, color };
}
