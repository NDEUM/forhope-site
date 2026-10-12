import type { BoxExtents, RotatedBox } from "@/lib/architecture-geometry";
import type { PhotoKey } from "@/content/media";

/**
 * LE BÂTIMENT FOR HOPE — plan en mètres.
 * La caméra avance vers -Z : Seuil → Première rencontre → Galerie → Grande salle → Dehors.
 * Toute la géométrie est ici : déplacer un mur, une photo ou une ouverture
 * ne demande pas de toucher au code de rendu.
 */

const e = (x: [number, number], y: [number, number], z: [number, number]): BoxExtents => ({ x, y, z });

/* ---------------------------------------------------------------------------
   Béton : murs, dalles, poteaux (fusionnés en un seul volume au rendu)
   ------------------------------------------------------------------------- */

export const concrete: BoxExtents[] = [
  // 00 — SEUIL (z 10 → -60, h 16)
  e([-9.6, 14.6], [0, 16], [10.6, 10]), // mur d'entrée (derrière la caméra)
  e([-9.6, -9], [0, 16], [10, -22]), // mur gauche…
  e([-9.6, -9], [0, 16], [-26, -60]), // …interrompu par une fente verticale (z -22 → -26)
  e([9, 9.6], [0, 16], [10, -15]), // mur droit
  e([9, 14.6], [0, 16], [-15, -15.6]),
  e([14, 14.6], [0, 16], [-15, -45]), // renfoncement
  e([9, 14.6], [0, 16], [-44.4, -45]),
  e([9, 9.6], [0, 16], [-45, -60]),
  // dalle de toit, percée de trois fentes de lumière (z ≈ -8, -24, -40)
  e([-9.6, 14.6], [16, 16.8], [10.6, -7.3]),
  e([-9.6, 14.6], [16, 16.8], [-8.7, -23.3]),
  e([-9.6, 14.6], [16, 16.8], [-24.7, -39.3]),
  e([-9.6, 14.6], [16, 16.8], [-40.7, -60]),
  e([6, 6.6], [0, 16], [-29.7, -30.3]), // poteaux
  e([6, 6.6], [0, 16], [-37.7, -38.3]),
  e([6, 6.6], [0, 16], [-45.7, -46.3]),
  // mur du fond et sa grande fente (x -2 → 2, jusqu'à 13 m)
  e([-9.6, -2], [0, 16], [-60, -60.8]),
  e([2, 14.6], [0, 16], [-60, -60.8]),
  e([-2, 2], [13, 16], [-60, -60.8]),

  // 01 — PREMIÈRE RENCONTRE (z -60.8 → -104.6, h 24, ciel ouvert)
  e([-25.6, -9.6], [0, 24], [-60, -60.8]),
  e([14.6, 25.6], [0, 24], [-60, -60.8]),
  e([-9.6, 14.6], [16.8, 24], [-60, -60.8]),
  e([-25.6, -25], [0, 24], [-60.8, -104.6]),
  e([25, 25.6], [0, 24], [-60.8, -104.6]),
  e([-25.6, -3], [0, 24], [-104, -104.6]), // mur du fond, ouvert derrière la photo
  e([3, 25.6], [0, 24], [-104, -104.6]),
  e([-3, 3], [9.5, 24], [-104, -104.6]),
  e([-6, 6], [0, 0.45], [-84, -85.2]), // banc

  // 02 — GALERIE DES ACTIONS (z -104.6 → -250.6, h 12)
  e([-6.6, -6], [0, 12], [-104.6, -150]),
  e([-13.6, -6], [0, 12], [-150, -150.6]),
  e([-13.6, -13], [0, 12], [-150, -195]),
  e([-13.6, -5.6], [0, 12], [-194.4, -195]),
  e([-5.6, -5], [0, 12], [-195, -250.6]),
  e([7, 7.6], [0, 12], [-104.6, -135]),
  e([4.4, 7.6], [0, 12], [-135, -135.6]),
  e([4.4, 5], [0, 12], [-135, -170]),
  e([4.4, 11.6], [0, 12], [-169.4, -170]),
  e([11, 11.6], [0, 12], [-170, -250.6]),
  // toit : deux dalles et une fente continue au centre
  e([-13.6, -0.45], [12, 12.6], [-104.6, -250.6]),
  e([0.45, 11.6], [12, 12.6], [-104.6, -250.6]),
  // mur du fond : une porte minuscule (1,4 × 1 m), entièrement cachée par la petite photo
  e([-13.6, -0.7], [0, 12], [-250.6, -251.2]),
  e([0.7, 11.6], [0, 12], [-250.6, -251.2]),
  e([-0.7, 0.7], [0, 1.7], [-250.6, -251.2]),
  e([-0.7, 0.7], [2.7, 12], [-250.6, -251.2]),

  // 03 — GRANDE SALLE (z -251.2 → -360.6, h 30)
  e([-35.6, -13.6], [0, 30], [-250.6, -251.2]),
  e([11.6, 35.6], [0, 30], [-250.6, -251.2]),
  e([-13.6, 11.6], [12.6, 30], [-250.6, -251.2]),
  e([-35.6, -35], [0, 30], [-251.2, -360.6]),
  e([35, 35.6], [0, 30], [-251.2, -360.6]),
  e([-35.6, -10], [0, 30], [-360, -360.6]), // mur du fond, immense ouverture vers dehors
  e([10, 35.6], [0, 30], [-360, -360.6]),
  e([-10, 10], [26, 30], [-360, -360.6]),
  // toit percé d'un puits de lumière carré au-dessus de la photo centrale
  e([-35.6, 35.6], [30, 30.8], [-251.2, -296]),
  e([-35.6, 35.6], [30, 30.8], [-310, -360.6]),
  e([-35.6, -7], [30, 30.8], [-296, -310]),
  e([7, 35.6], [30, 30.8], [-296, -310]),
  e([-9.8, 9.8], [0, 0.5], [-304.4, -306.6]), // socle
  e([-5, 5], [0, 0.46], [-283.4, -284.6]), // banc : l'échelle humaine face à la photo
  e([-3.5, 3.5], [0, 0.46], [-182.4, -183.4]), // banc de la galerie

  // 04 — ÉVÉNEMENTS : une cour à ciel ouvert (z -360.6 → -426, h 14)
  e([-40.6, -40], [0, 14], [-360.6, -426]),
  e([40, 40.6], [0, 14], [-360.6, -426]),
  e([-40.6, -35.6], [0, 14], [-360, -360.6]),
  e([35.6, 40.6], [0, 14], [-360, -360.6]),
  e([-40.6, -14], [0, 14], [-425.4, -426]), // fond de la cour, grande ouverture vers dehors
  e([14, 40.6], [0, 14], [-425.4, -426]),

  // 05 — DEHORS : quelques monolithes et un mur bas dans le paysage
  e([-70, 70], [0, 2.6], [-560, -561]),
  e([-19, -17.6], [0, 18], [-470, -478]),
  e([17.6, 19], [0, 12], [-490, -498]),
];

export const freePanels: RotatedBox[] = [
  // Cour des événements : quatre panneaux porteurs d'affiches (voir eventPanels)
  { center: [-12, 2.1, -374], size: [6, 4.2, 0.4], rotY: 0.35 },
  { center: [11, 2.1, -384], size: [6, 4.2, 0.4], rotY: -0.4 },
  { center: [-10, 2.1, -398], size: [6, 4.2, 0.4], rotY: 0.3 },
  { center: [12, 2.1, -410], size: [6, 4.2, 0.4], rotY: -0.35 },
  // Seuil : un monolithe, comme une première cloison
  { center: [-3.8, 5, -18], size: [0.4, 10, 8], rotY: 0 },
  // Galerie : panneau libre incliné qui porte une photo verticale
  { center: [2.6, 3.6, -140], size: [4.2, 7.2, 0.35], rotY: -0.55 },
];

/* ---------------------------------------------------------------------------
   Verre (surfaces translucides)
   ------------------------------------------------------------------------- */

export const glassPanels = [
  { center: [3.6, 4.6, -35] as [number, number, number], size: [5, 9.2] as [number, number], rotY: 0.35 },
  { center: [-9.6, 3.8, -172] as [number, number, number], size: [9, 7.6] as [number, number], rotY: Math.PI / 2 },
];

/* ---------------------------------------------------------------------------
   Lumière : fentes zénithales (émissives) et faisceaux
   ------------------------------------------------------------------------- */

export const skylights = [
  { x: [-9, 14] as [number, number], z: [-7.3, -8.7] as [number, number], y: 16 },
  { x: [-9, 14] as [number, number], z: [-23.3, -24.7] as [number, number], y: 16 },
  { x: [-9, 14] as [number, number], z: [-39.3, -40.7] as [number, number], y: 16 },
  { x: [-0.45, 0.45] as [number, number], z: [-104.6, -250.6] as [number, number], y: 12 },
  { x: [-7, 7] as [number, number], z: [-296, -310] as [number, number], y: 30 },
];

/** Fente verticale du Seuil (lumière latérale). */
export const sideSlot = { x: -10.4, z: [-22, -26] as [number, number], y: [0, 16] as [number, number] };

/** Direction de la lumière naturelle (le soleil descend en biais). */
export const sunDirection: [number, number, number] = [-0.32, -1, 0.26];

export const beams = [
  { top: [2.5, 16, -8] as [number, number, number], width: 20, depth: 1.4, length: 15.5 },
  { top: [2.5, 16, -24] as [number, number, number], width: 20, depth: 1.4, length: 15.5 },
  { top: [2.5, 16, -40] as [number, number, number], width: 20, depth: 1.4, length: 15.5 },
  { top: [0, 30, -303] as [number, number, number], width: 14, depth: 14, length: 29.5, strength: 1.9 },
];

/* ---------------------------------------------------------------------------
   Photographies installées dans le bâtiment
   ------------------------------------------------------------------------- */

export interface Installation {
  id: string;
  photo: PhotoKey | null;
  /** Centre de l'image (m). */
  position: [number, number, number];
  rotY: number;
  width: number;
  /** Recadrage : part de l'image conservée [largeur, hauteur] et décalage [x, y] (0–1). */
  crop?: { size: [number, number]; offset: [number, number] };
  /** Photo incurvée : rayon du cylindre (concave vers la caméra). */
  curveRadius?: number;
  /** La caméra traverse la photo : elle s'efface quand on la touche. */
  portal?: boolean;
  /** Cadre en métal sombre derrière l'image. */
  frame?: boolean;
  /** Préparé pour une vidéo plus tard (même cadrage). */
  video?: string;
}

export const installations: Installation[] = [
  // 01 — une photographie de 22 m, incurvée, qui fait partie du bâtiment
  { id: "rencontre", photo: "enfantsComplices", position: [0, 8.3, -100], rotY: 0, width: 22, curveRadius: 26, portal: true },
  // 02 — galerie : formats, profondeurs et orientations différents
  { id: "agir", photo: "benevolesEquipe", position: [-5.94, 4.4, -123], rotY: Math.PI / 2, width: 8, frame: true },
  {
    id: "portrait",
    photo: "sourirePortrait",
    position: [2.6 + Math.sin(-0.55) * 0.2, 3.9, -140 + Math.cos(-0.55) * 0.2],
    rotY: -0.55,
    width: 3.4,
    crop: { size: [0.42, 1], offset: [0.3, 0] },
  },
  { id: "accompagner", photo: "benevolePouponniere", position: [4.34, 4.6, -153], rotY: -Math.PI / 2, width: 7, frame: true },
  { id: "soutenir", photo: "enfantsForce", position: [-12.94, 4.6, -172], rotY: Math.PI / 2, width: 10, frame: true },
  {
    id: "rassembler",
    photo: "enfantsGroupe",
    position: [10.94, 6.4, -205],
    rotY: -Math.PI / 2,
    width: 14,
    crop: { size: [1, 0.46], offset: [0, 0.36] },
    frame: true,
  },
  { id: "sourire", photo: "enfantSourire", position: [-4.94, 3.2, -232], rotY: Math.PI / 2, width: 2.6, frame: true },
  // la petite photo au bout de la galerie : un portail
  { id: "seuil-salle", photo: "benevoleEnfants", position: [0, 2.2, -250.52], rotY: 0, width: 1.6, frame: true, portal: true },
  // 03 — deux portraits verticaux, lointains, sur les murs de la grande salle
  {
    id: "salle-gauche",
    photo: "enfantSourire",
    position: [-34.94, 5.2, -282],
    rotY: Math.PI / 2,
    width: 5,
    crop: { size: [0.5, 1], offset: [0.18, 0] },
    frame: true,
  },
  {
    id: "salle-droite",
    photo: "sourirePortrait",
    position: [34.94, 5.4, -332],
    rotY: -Math.PI / 2,
    width: 5,
    crop: { size: [0.42, 1], offset: [0.3, 0] },
    frame: true,
  },
  // 03 — la même photo, monumentale, au centre de la grande salle
  { id: "histoire", photo: "benevoleEnfants", position: [0, 6.55, -305.5], rotY: 0, width: 18, frame: true },
];

/* ---------------------------------------------------------------------------
   Inscriptions murales (numéros de salle, titres discrets)
   ------------------------------------------------------------------------- */

export const inscriptions = [
  { text: "FOR HOPE", sub: "00 — Seuil", position: [-8.96, 2.6, -2] as [number, number, number], rotY: Math.PI / 2 },
  { text: "01", sub: "Première rencontre", position: [-24.96, 2.2, -72] as [number, number, number], rotY: Math.PI / 2 },
  { text: "02.1", sub: "Agir", position: [-5.96, 1.5, -128.9] as [number, number, number], rotY: Math.PI / 2 },
  { text: "02.2", sub: "Accompagner", position: [4.36, 1.5, -158.4] as [number, number, number], rotY: -Math.PI / 2 },
  { text: "02.3", sub: "Soutenir", position: [-12.96, 1.5, -179.6] as [number, number, number], rotY: Math.PI / 2 },
  { text: "02.4", sub: "Rassembler", position: [10.96, 2.4, -213.6] as [number, number, number], rotY: -Math.PI / 2 },
  { text: "03", sub: "Salle des histoires", position: [-34.96, 2.4, -270] as [number, number, number], rotY: Math.PI / 2 },
  { text: "04", sub: "Événements", position: [-39.96, 2.4, -366] as [number, number, number], rotY: Math.PI / 2 },
];

/** Emprise intérieure (sol poli). */
export const interiorFloor = { x: [-41, 41] as [number, number], z: [11, -426] as [number, number] };

/* ---------------------------------------------------------------------------
   04 — Les événements : des affiches sur des panneaux libres, dans la cour
   ------------------------------------------------------------------------- */

export interface EventPanel {
  id: string;
  title: string;
  subtitle: string;
  /** Déclinaison officielle du logo (charte). */
  logo: string | null;
  paper: "light" | "dark";
  /** Couleur secondaire de la charte, utilisée ponctuellement (liseré lumineux). */
  accent: string;
  center: [number, number, number];
  rotY: number;
}

export const eventPanels: EventPanel[] = [
  { id: "gala", title: "Gala", subtitle: "La soirée annuelle de For Hope", logo: "/brand/events/gala.png", paper: "dark", accent: "#E8BF6E", center: [-12, 2.1, -374], rotY: 0.35 },
  { id: "septembre-en-or", title: "Septembre en Or", subtitle: "Sensibiliser aux cancers de l'enfant", logo: "/brand/events/septembre-en-or.png", paper: "light", accent: "#DEAC59", center: [11, 2.1, -384], rotY: -0.4 },
  { id: "octobre-rose", title: "Octobre Rose", subtitle: "Se mobiliser contre le cancer du sein", logo: "/brand/events/octobre-rose.png", paper: "light", accent: "#E71D73", center: [-10, 2.1, -398], rotY: 0.3 },
  { id: "movember", title: "Movember", subtitle: "Parler de la santé des hommes", logo: "/brand/events/movember.png", paper: "light", accent: "#3392CA", center: [12, 2.1, -410], rotY: -0.35 },
];

/** Panneau porteur : 6 × 3,4 m, l'affiche est posée sur sa face avant. */
export const EVENT_PANEL = { width: 6, height: 3.4, depth: 0.4, posterWidth: 5.6, posterHeight: 2.8 };

/**
 * Lanternes : vues du ciel, les photographies deviennent des surfaces de
 * lumière posées sur le bâtiment, à l'aplomb de l'endroit où elles sont exposées.
 */
export const lanterns: { photo: PhotoKey; center: [number, number, number]; size: [number, number] }[] = [
  { photo: "enfantsComplices", center: [0, 24.1, -82], size: [40, 26.6] }, // au-dessus de la cour à ciel ouvert
  { photo: "benevolesEquipe", center: [-6.8, 12.66, -123], size: [12, 9] },
  { photo: "benevolePouponniere", center: [5.8, 12.66, -153], size: [11, 7.3] },
  { photo: "enfantsForce", center: [-6.9, 12.66, -176], size: [12.6, 8.4] },
  { photo: "enfantsGroupe", center: [6, 12.66, -210], size: [11, 7.5] },
  { photo: "benevoleEnfants", center: [0, 30.86, -303], size: [36, 24] }, // sur le toit de la grande salle
];
