/**
 * État partagé entre le DOM (scroll) et la scène WebGL.
 * Objet mutable volontairement : lu à chaque frame dans useFrame,
 * sans provoquer de rendu React.
 */
export type QualityTier = "high" | "low";

export const experience = {
  /** Progression globale brute du scroll (0 → 1), écrite par ScrollDirector. */
  progress: 0,
  /** Progression amortie suivie par la caméra (écrite par CameraRig). */
  smooth: 0,
  reducedMotion: false,
  tier: "high" as QualityTier,
  /** Ouverture du hero (0 → 1), jouée une fois quand le chargement se lève. */
  intro: 0,
  /** Souris normalisée (-1 → 1), lue par la caméra au premier écran. */
  pointer: { x: 0, y: 0 },
};

// Scène active : petit émetteur pour les composants React (rarement mis à jour).
let activeScene = 0;
const listeners = new Set<() => void>();

export function setActiveScene(index: number) {
  if (index === activeScene) return;
  activeScene = index;
  listeners.forEach((l) => l());
}

export const getActiveScene = () => activeScene;

export function subscribeActiveScene(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/* -------------------------------------------------------------------------
   « Prêt » : l'écran de chargement se retire, l'expérience peut commencer.
   ------------------------------------------------------------------------- */
let ready = false;
export const READY_EVENT = "forhope:ready";

export function markReady() {
  if (ready) return;
  ready = true;
  document.documentElement.classList.add("is-ready");
  window.dispatchEvent(new Event(READY_EVENT));
}

/** Exécute `fn` dès que l'expérience est prête (immédiatement si c'est déjà le cas). */
export function onReady(fn: () => void) {
  if (ready) {
    fn();
    return () => {};
  }
  window.addEventListener(READY_EVENT, fn, { once: true });
  return () => window.removeEventListener(READY_EVENT, fn);
}

export const isReady = () => ready;
