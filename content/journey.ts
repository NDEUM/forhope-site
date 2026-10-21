/**
 * LE VOYAGE — la caméra part de l'espace, descend vers l'Afrique, l'Afrique
 * de l'Ouest, le Sénégal, traverse les nuages et arrive chez For Hope.
 *
 * Unités 3D : le rayon de la Terre vaut 1 (EARTH_RADIUS_KM km).
 * Chaque plan place la caméra et son point de visée en coordonnées
 * géographiques (latitude, longitude en degrés, altitude en rayons
 * terrestres). La caméra interpole l'altitude en échelle logarithmique :
 * un changement d'échelle régulier, comme une vraie descente.
 */

export const EARTH_RADIUS_KM = 6371;

export interface GeoPoint {
  lat: number;
  lon: number;
  /** Altitude en rayons terrestres (0 = sol, -1 = centre de la Terre). */
  alt: number;
}

export interface Shot {
  /** Progression du voyage (0 → 1). */
  at: number;
  camera: GeoPoint;
  target: GeoPoint;
  /** Focale verticale (°). */
  fov: number;
}

/** Centre géographique approximatif du Sénégal (pour le cadrage seulement). */
export const SENEGAL = { lat: 14.45, lon: -14.6 };

/**
 * Plan de vol : France (point de départ) → Méditerranée et Sahara → Afrique
 * → Afrique de l'Ouest → Sénégal (cœur des actions), atteint à ARRIVAL.at.
 * Dès l'arrivée, une lumière dorée naît sur le Sénégal et s'étend, puis se
 * fond dans la section suivante (voir ARRIVAL) ; la caméra continue seulement de
 * s'approcher doucement pendant ce raccord.
 */
export const shots: Shot[] = [
  // L'Europe vue de haut : la Terre remplit tout le cadre.
  { at: 0, camera: { lat: 40, lon: -6, alt: 0.72 }, target: { lat: 46, lon: 0, alt: -0.5 }, fov: 36 },
  // La caméra se rapproche du territoire français.
  { at: 0.174, camera: { lat: 41.5, lon: 1.2, alt: 0.42 }, target: { lat: 47, lon: 2.4, alt: -0.06 }, fov: 36 },
  // Elle prend de la hauteur et part vers le sud : Méditerranée, puis Sahara.
  { at: 0.348, camera: { lat: 30, lon: -2, alt: 0.85 }, target: { lat: 20, lon: 2, alt: -0.25 }, fov: 35 },
  // L'Afrique remplit le cadre.
  { at: 0.504, camera: { lat: 8, lon: -6, alt: 0.95 }, target: { lat: 8, lon: 12, alt: -0.25 }, fov: 34 },
  // L'Afrique de l'Ouest : la caméra pivote vers l'Atlantique.
  { at: 0.643, camera: { lat: 9, lon: -11, alt: 0.28 }, target: { lat: 14, lon: -10, alt: -0.04 }, fov: 36 },
  // Le Sénégal, point focal de l'écran : arrivée.
  { at: 0.8, camera: { lat: 11.4, lon: -14.2, alt: 0.075 }, target: { lat: 14.6, lon: -14.9, alt: 0 }, fov: 38 },
  // Pendant la lumière dorée, une approche lente, sans pause.
  { at: 1, camera: { lat: 12.6, lon: -14.5, alt: 0.048 }, target: { lat: 14.6, lon: -14.9, alt: 0 }, fov: 38 },
];

/**
 * L'ouverture, avant le voyage : la Terre en miniature, au loin, dans le
 * noir ; les étoiles s'allument (jusqu'à `stars`), puis la caméra rejoint le
 * premier plan (`move`). Durée totale `duration` secondes, au temps (le
 * défilement l'accélère).
 */
export const INTRO = {
  shot: { at: 0, camera: { lat: 33, lon: -8, alt: 5.2 }, target: { lat: 33, lon: -8, alt: -1 }, fov: 30 } satisfies Shot,
  duration: 4.6,
  stars: 0.3,
  move: 0.32,
};

/**
 * L'arrivée au Sénégal : synchronisée sur la progression réelle de la
 * caméra (le plan Sénégal est atteint à `at`). Une lumière dorée naît sur
 * le Sénégal, s'étend (`bloomPeak`), puis se fond dans le bleu nuit
 * (`fadeFrom` → `fadeTo`) de la section qui suit (les photos qui se rassemblent).
 */
export const ARRIVAL = { focus: { lat: 14.6, lon: -14.9 }, at: 0.8, bloomPeak: 0.88, fadeFrom: 0.91, fadeTo: 0.98 };

/** Repères typographiques (progression du voyage). */
export interface Caption {
  id: string;
  title: string;
  /** Ligne secondaire discrète (coordonnées, contexte). */
  meta?: string;
  from: number;
  to: number;
}

export const captions: Caption[] = [
  { id: "france", title: "France", meta: "Le point de départ", from: 0.07, to: 0.26 },
  { id: "afrique", title: "Afrique", meta: "30,3 millions de km²", from: 0.4, to: 0.57 },
  { id: "senegal", title: "Sénégal", meta: "Le cœur de nos actions", from: 0.7, to: 0.86 },
];

/** Le fil de lumière France → Sénégal, tracé pendant le voyage. */
export const LIGHT_PATH = {
  from: { lat: 46.6, lon: 2.4 },
  to: { lat: 14.6, lon: -14.6 },
  drawFrom: 0.117,
  drawTo: 0.54,
};

/**
 * Ancienne traversée des nuages entre le Sénégal et la photo : retirée de
 * l'ouverture (l'arrivée au Sénégal déclenche directement la lumière
 * dorée). Les nuages restent utilisés dans la sortie (OUTRO_CLOUDS).
 */

/**
 * Textures régionales (côtes et frontières Natural Earth 1:10m) : plus la
 * caméra descend, plus la carte est fine. Les emprises doivent contenir
 * celle de scripts/build-geo.mjs.
 */
export interface Region {
  id: string;
  west: number;
  east: number;
  south: number;
  north: number;
  /** Altitudes (rayons) entre lesquelles la région remplace la vue globale. */
  fadeFrom: number;
  fadeTo: number;
  /** Fichier de tracés (Natural Earth) et pays souligné. */
  geo: string;
  highlight: string;
}

export const regions: Region[] = [
  { id: "west-africa", west: -26, east: -2, south: 4, north: 28, fadeFrom: 0.5, fadeTo: 0.2, geo: "/geo/west-africa.json", highlight: "Senegal" },
  { id: "senegal", west: -18.4, east: -10.6, south: 11.4, north: 17.6, fadeFrom: 0.12, fadeTo: 0.05, geo: "/geo/west-africa.json", highlight: "Senegal" },
  { id: "france", west: -6, east: 10, south: 41, north: 52, fadeFrom: 0.7, fadeTo: 0.38, geo: "/geo/france.json", highlight: "France" },
];

/**
 * Séquences vidéo (Higgsfield ou tournage) : chaque emplacement se remplace
 * en renseignant `src`. Tant que `src` est null, le raccord 3D → photo
 * fonctionne seul. Les vidéos générées sont des images d'illustration et
 * doivent être signalées comme telles (`illustrative`).
 */
export interface VideoSlot {
  id: string;
  /** Vidéo paysage (ordinateur). */
  src: string | null;
  /** Vidéo portrait (mobile), facultative. */
  srcPortrait?: string;
  poster?: string;
  /** false : conservée (fichiers et réglages) mais retirée du parcours. */
  enabled?: boolean;
  /** Fenêtre d'affichage (progression du voyage). */
  from: number;
  to: number;
  illustrative: boolean;
  note: string;
}

export const videoSlots: VideoSlot[] = [
  {
    id: "descente-senegal",
    // Higgsfield (Kling 3.0), générée à partir de la dernière image 3D : raccord exact.
    src: "/media/video/descente-senegal-16x9.mp4",
    srcPortrait: "/media/video/descente-senegal-9x16.mp4",
    poster: "/media/video/descente-senegal-poster.jpg",
    // démarre sur l'image 3D exacte (même position dans le dernier segment qu'avant)
    from: 0.5845,
    to: 0.78,
    illustrative: true,
    // retirée de l'ouverture : l'arrivée au Sénégal mène directement aux photographies
    enabled: false,
    note: "Plan aérien qui prolonge la descente 3D au-dessus de la côte sénégalaise (image d'illustration).",
  },
];

/** Longueur de scroll du voyage (en hauteur d'écran). */
export const JOURNEY_LENGTH_VH = 300;

/**
 * LA SORTIE — en bas du site, le miroir du voyage : la caméra traverse les
 * nuages vers le haut, quitte le Sénégal, l'Afrique de l'Ouest, l'Afrique,
 * et la Terre s'éloigne dans l'espace.
 */
export const outroShots: Shot[] = [
  { at: 0, camera: { lat: 13.0, lon: -15.2, alt: 0.05 }, target: { lat: 14.7, lon: -15.8, alt: 0 }, fov: 42 },
  { at: 0.22, camera: { lat: 11.5, lon: -14.4, alt: 0.12 }, target: { lat: 14.4, lon: -14.6, alt: -0.01 }, fov: 38 },
  { at: 0.45, camera: { lat: 8, lon: -10, alt: 0.4 }, target: { lat: 12, lon: -8, alt: -0.08 }, fov: 36 },
  { at: 0.65, camera: { lat: 5, lon: -4, alt: 1.1 }, target: { lat: 8, lon: 8, alt: -0.3 }, fov: 34 },
  { at: 0.84, camera: { lat: 4, lon: -16, alt: 2.4 }, target: { lat: 10, lon: -18, alt: -0.55 }, fov: 33 },
  { at: 1, camera: { lat: 2, lon: -22, alt: 5.2 }, target: { lat: 4, lon: -22, alt: -1 }, fov: 32 },
];

export const outroCaptions: Caption[] = [
  { id: "senegal", title: "Sénégal", meta: "14° N · 14° O", from: 0.06, to: 0.3 },
  { id: "afrique", title: "Afrique", meta: "Le voyage continue", from: 0.42, to: 0.66 },
  { id: "terre", title: "La Terre", meta: "Un seul monde", from: 0.7, to: 0.86 },
];

/** Nuages traversés vers le haut au début de la sortie. */
export const OUTRO_CLOUDS = { from: 0, to: 0.12 };

/** Longueur de scroll de la sortie (en hauteur d'écran). */
export const OUTRO_LENGTH_VH = 380;
