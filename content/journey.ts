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
 * Plan de vol. Le début est lent (le visiteur prend la mesure de la
 * planète), la descente accélère au-dessus de l'Afrique, puis se pose.
 */
export const shots: Shot[] = [
  // Très haute altitude : la Terre entière, l'Afrique dans la lumière du jour.
  { at: 0, camera: { lat: 4, lon: -22, alt: 2.1 }, target: { lat: 20, lon: -38, alt: 0.15 }, fov: 34 },
  { at: 0.14, camera: { lat: 5, lon: -14, alt: 1.55 }, target: { lat: 14, lon: -20, alt: -0.3 }, fov: 34 },
  // L'Afrique remplit le cadre.
  { at: 0.32, camera: { lat: 6, lon: -6, alt: 0.95 }, target: { lat: 8, lon: 12, alt: -0.25 }, fov: 34 },
  // L'Afrique de l'Ouest : la caméra pivote vers l'Atlantique.
  { at: 0.5, camera: { lat: 9, lon: -11, alt: 0.28 }, target: { lat: 14, lon: -10, alt: -0.04 }, fov: 36 },
  // Le Sénégal.
  { at: 0.68, camera: { lat: 11.4, lon: -14.2, alt: 0.075 }, target: { lat: 14.6, lon: -14.9, alt: 0 }, fov: 38 },
  // Basse altitude : la caméra s'incline vers l'horizon, face à la côte.
  { at: 0.82, camera: { lat: 13.2, lon: -14.6, alt: 0.034 }, target: { lat: 14.7, lon: -16.6, alt: 0.0 }, fov: 42 },
  // Traversée de la couche de nuages.
  { at: 1, camera: { lat: 14.0, lon: -15.4, alt: 0.012 }, target: { lat: 14.8, lon: -16.8, alt: 0.0 }, fov: 46 },
];

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
  { id: "terre", title: "La Terre", meta: "Altitude orbitale", from: 0.03, to: 0.17 },
  { id: "afrique", title: "Afrique", meta: "30,3 millions de km²", from: 0.24, to: 0.4 },
  { id: "ouest", title: "Afrique de l'Ouest", meta: "Océan Atlantique", from: 0.44, to: 0.58 },
  { id: "senegal", title: "Sénégal", meta: "14° N · 14° O", from: 0.62, to: 0.82 },
];

/** La couche de nuages traversée entre le Sénégal et For Hope. */
export const CLOUDS = { from: 0.8, peak: 0.94, to: 1 };

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
}

export const regions: Region[] = [
  { id: "west-africa", west: -26, east: -2, south: 4, north: 28, fadeFrom: 0.5, fadeTo: 0.2 },
  { id: "senegal", west: -18.4, east: -10.6, south: 11.4, north: 17.6, fadeFrom: 0.12, fadeTo: 0.05 },
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
  /** Fenêtre d'affichage (progression du voyage). */
  from: number;
  to: number;
  illustrative: boolean;
  note: string;
}

export const videoSlots: VideoSlot[] = [
  {
    id: "descente-senegal",
    // Higgsfield (Kling 3.0), générée à partir de la dernière image 3D (p = 0,83) : raccord exact.
    src: "/media/video/descente-senegal-16x9.mp4",
    srcPortrait: "/media/video/descente-senegal-9x16.mp4",
    poster: "/media/video/descente-senegal-poster.jpg",
    from: 0.83,
    to: 0.945,
    illustrative: true,
    note: "Plan aérien qui prolonge la descente 3D au-dessus de la côte sénégalaise (image d'illustration).",
  },
];

/** Longueur de scroll du voyage (en hauteur d'écran). */
export const JOURNEY_LENGTH_VH = 500;

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
