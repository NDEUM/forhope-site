/**
 * LA VISITE — cinq espaces d'un même bâtiment (voir content/architecture.ts).
 * Pour chaque espace : la longueur de scroll, les cartels (textes discrets,
 * comme dans un musée) et les plans de caméra en coordonnées du bâtiment.
 */

export type SceneId = "seuil" | "rencontre" | "galerie" | "salle" | "evenements" | "dehors";

export type Vec3 = [number, number, number];

export interface Shot {
  /** Progression locale dans l'espace (0 → 1). */
  at: number;
  pos: Vec3;
  target: Vec3;
  /** Focale verticale (°) : les changements de focale sont subtils. */
  fov: number;
  /** 0 = la caméra passe, 1 = elle se pose (temps de regard). */
  dwell: number;
}

export interface Step {
  kind: "cartel" | "lines" | "aerial";
  number?: string;
  title?: string;
  text?: string;
  lines?: string[];
  placeholder?: string;
}

export interface SceneConfig {
  id: SceneId;
  number: string;
  label: string;
  /** Thème For Hope de l'espace. */
  theme: string;
  length: number;
  stepStart?: number;
  stack?: boolean;
  steps: Step[];
  shots: Shot[];
}

export const scenes: SceneConfig[] = [
  {
    id: "seuil",
    number: "00",
    label: "Seuil",
    theme: "Entrée",
    length: 150,
    stepStart: 0.4,
    steps: [{ kind: "cartel", number: "00", title: "Seuil", text: "Entrez. Ici, chaque espace porte une rencontre." }],
    shots: [
      // Hero : la fente de lumière, dégagée du monolithe, sur le tiers droit du cadre.
      { at: 0, pos: [1.5, 1.5, -2], target: [-14.7, 3.8, -24], fov: 30, dwell: 1 },
      { at: 0.16, pos: [1.8, 1.6, -5], target: [-5, 5.6, -26], fov: 33, dwell: 0.2 },
      { at: 0.4, pos: [2.4, 2.1, -12], target: [-1, 4.8, -40], fov: 40, dwell: 0.3 },
      { at: 0.7, pos: [-0.6, 2.6, -36], target: [0, 5.4, -62], fov: 42, dwell: 0.3 },
      { at: 1, pos: [0, 3.2, -55], target: [0, 5.5, -80], fov: 44, dwell: 0 },
    ],
  },
  {
    id: "rencontre",
    number: "01",
    label: "Première rencontre",
    theme: "Les personnes",
    length: 180,
    stepStart: 0.3,
    steps: [{ kind: "cartel", number: "01", title: "Première rencontre", text: "Tout commence par quelqu'un qui tend la main." }],
    shots: [
      { at: 0.1, pos: [0, 3.4, -63], target: [0, 7.5, -100], fov: 46, dwell: 0.2 },
      { at: 0.38, pos: [-9, 3.2, -77], target: [2, 7.4, -100], fov: 42, dwell: 0.5 },
      { at: 0.6, pos: [8, 4, -83], target: [-1, 7.6, -100], fov: 42, dwell: 0.3 },
      { at: 0.84, pos: [0, 6, -93.5], target: [0, 7, -104], fov: 38, dwell: 0 },
      { at: 1, pos: [0, 5.4, -103], target: [0, 3.6, -125], fov: 44, dwell: 0 },
    ],
  },
  {
    id: "galerie",
    number: "02",
    label: "Galerie des actions",
    theme: "Les actions",
    length: 300,
    stepStart: 0.14,
    steps: [
      { kind: "cartel", number: "02.1", title: "Agir", text: "Une équipe de bénévoles, sur le terrain comme en coulisses." },
      { kind: "cartel", number: "02.2", title: "Accompagner", text: "Être présents auprès des enfants, simplement." },
      { kind: "cartel", number: "02.3", title: "Soutenir", text: "Redonner un sourire, jour après jour." },
      { kind: "cartel", number: "02.4", title: "Rassembler", text: "Gala, Octobre Rose, Movember, Septembre en Or." },
    ],
    shots: [
      { at: 0.05, pos: [0, 2.3, -108], target: [-1, 3.4, -130], fov: 44, dwell: 0.2 },
      { at: 0.24, pos: [1.6, 2.2, -116.5], target: [-5.9, 4.2, -123.5], fov: 40, dwell: 0.8 },
      { at: 0.34, pos: [-1.2, 2.2, -131], target: [2.4, 3.8, -140.5], fov: 40, dwell: 0.6 },
      { at: 0.44, pos: [-0.8, 2.3, -146.5], target: [4.3, 4.4, -153.5], fov: 40, dwell: 0.8 },
      { at: 0.64, pos: [0.8, 2.4, -165.5], target: [-12.9, 4.4, -172.5], fov: 42, dwell: 0.8 },
      { at: 0.84, pos: [-1.8, 2.6, -197], target: [10.9, 6.2, -205.5], fov: 44, dwell: 0.8 },
      { at: 0.95, pos: [0, 2.2, -240], target: [0, 2.2, -251], fov: 40, dwell: 0.3 },
      { at: 1, pos: [0, 2.2, -250], target: [0, 2.2, -262], fov: 32, dwell: 0 },
    ],
  },
  {
    id: "salle",
    number: "03",
    label: "Salle des histoires",
    theme: "Les histoires",
    length: 220,
    stepStart: 0.3,
    stack: true,
    steps: [
      { kind: "lines", number: "03", title: "Salle des histoires", lines: ["Une histoire."] },
      { kind: "lines", lines: ["Une rencontre."] },
      {
        kind: "lines",
        lines: ["Un nouveau départ."],
        placeholder: "Témoignage à venir — texte définitif fourni par For Hope",
      },
    ],
    shots: [
      { at: 0.08, pos: [0, 2.2, -252.5], target: [0, 6, -300], fov: 44, dwell: 0 },
      { at: 0.4, pos: [0, 2.6, -264], target: [0, 6.6, -305], fov: 42, dwell: 0.9 },
      { at: 0.75, pos: [0.4, 2.8, -269], target: [0, 6.8, -305], fov: 40, dwell: 0.9 },
      { at: 1, pos: [8, 3.6, -294], target: [2, 6, -340], fov: 42, dwell: 0.2 },
    ],
  },
  {
    id: "evenements",
    number: "04",
    label: "Événements",
    theme: "Les événements",
    length: 300,
    stepStart: 0.14,
    steps: [
      { kind: "cartel", number: "04.1", title: "Gala", text: "La soirée annuelle de For Hope." },
      { kind: "cartel", number: "04.2", title: "Septembre en Or", text: "Sensibiliser aux cancers de l'enfant." },
      { kind: "cartel", number: "04.3", title: "Octobre Rose", text: "Se mobiliser contre le cancer du sein." },
      { kind: "cartel", number: "04.4", title: "Movember", text: "Parler de la santé des hommes." },
    ],
    shots: [
      { at: 0.04, pos: [12, 4.2, -318], target: [2, 6, -362], fov: 46, dwell: 0 },
      { at: 0.12, pos: [3, 3.4, -354], target: [0, 3.5, -385], fov: 46, dwell: 0.2 },
      { at: 0.24, pos: [-3, 2.4, -365.5], target: [-12, 2.4, -374.5], fov: 40, dwell: 0.8 },
      { at: 0.44, pos: [3, 2.4, -375.5], target: [11, 2.4, -384.5], fov: 40, dwell: 0.8 },
      { at: 0.64, pos: [-2.5, 2.4, -389.5], target: [-10, 2.4, -398.5], fov: 40, dwell: 0.8 },
      { at: 0.84, pos: [3.5, 2.4, -401.5], target: [12, 2.4, -410.5], fov: 40, dwell: 0.8 },
      { at: 1, pos: [0, 4, -418], target: [0, 6, -450], fov: 46, dwell: 0.1 },
    ],
  },
  {
    id: "dehors",
    number: "05",
    label: "Dehors",
    theme: "Agir",
    length: 420,
    stepStart: 0.4,
    steps: [{ kind: "aerial", number: "05", title: "Dehors", text: "Tout ce que vous venez de traverser est un seul lieu." }],
    shots: [
      { at: 0.1, pos: [0, 7, -440], target: [0, 7, -490], fov: 52, dwell: 0.2 },
      { at: 0.3, pos: [50, 34, -505], target: [0, 8, -380], fov: 48, dwell: 0 },
      { at: 0.55, pos: [135, 165, -540], target: [0, 0, -215], fov: 42, dwell: 0.5 },
      { at: 0.74, pos: [145, 190, -555], target: [0, 0, -210], fov: 40, dwell: 1 },
    ],
  },
];

/** Au-delà de ce point, la dernière image (fond clair) remplace le bâtiment. */
export const END_FRAME_AT = 0.962;

export const STORY_LENGTH_VH = scenes.reduce((sum, s) => sum + s.length, 0);

export interface SceneRange {
  id: SceneId;
  start: number;
  end: number;
}

/** Plages de progression globale, cohérentes avec les ScrollTrigger de ScrollDirector. */
export const sceneRanges: SceneRange[] = (() => {
  const scrollable = STORY_LENGTH_VH - 100;
  let cursor = 0;
  return scenes.map((s) => {
    const start = cursor / scrollable;
    const end = Math.min(1, (cursor + s.length) / scrollable);
    cursor += s.length;
    return { id: s.id, start, end };
  });
})();

export const sceneIndexOf = (id: SceneId) => scenes.findIndex((s) => s.id === id);

export function toGlobal(scene: SceneId | number, local: number) {
  const r = sceneRanges[typeof scene === "number" ? scene : sceneIndexOf(scene)];
  return r.start + (r.end - r.start) * local;
}

export function localProgress(id: SceneId, global: number) {
  const r = sceneRanges[sceneIndexOf(id)];
  return Math.min(1, Math.max(0, (global - r.start) / (r.end - r.start)));
}

export function activeSceneIndex(global: number) {
  for (let i = sceneRanges.length - 1; i >= 0; i--) if (global >= sceneRanges[i].start - 1e-6) return i;
  return 0;
}

export const DEFAULT_STEP_START = 0.06;

/** Centre (local) du k-ième cartel — même formule que ScrollDirector. */
export function stepCenter(scene: SceneConfig, k: number) {
  const start = scene.stepStart ?? DEFAULT_STEP_START;
  const span = (0.94 - start) / scene.steps.length;
  return start + (k + 0.5) * span;
}
