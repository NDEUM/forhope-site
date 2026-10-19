/**
 * État partagé du voyage (DOM ↔ WebGL), lu à chaque frame sans rendu React.
 */
export const journey = {
  /** Progression brute du scroll sur le voyage (0 → 1), écrite par JourneyDirector. */
  progress: 0,
  /** Progression amortie suivie par la caméra. */
  smooth: 0,
  /** Altitude courante de la caméra (km), pour le repère d'altitude. */
  altitudeKm: 0,
  /** Sortie de la Terre (bas du site) : progression amortie (0 → 1) et activité. */
  outro: 0,
  outroActive: false,
  /** Position à l'écran (0 → 1) du point d'arrivée au Sénégal, d'où naît la lumière dorée. */
  focusX: 0.5,
  focusY: 0.5,
};
