export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const invLerp = (a: number, b: number, v: number) => (a === b ? 0 : clamp((v - a) / (b - a)));

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = invLerp(edge0, edge1, x);
  return t * t * (3 - 2 * t);
}

export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

/** Amortissement indépendant du framerate (lambda ≈ vitesse de rattrapage). */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));

/** Fenêtre douce : 0 → 1 entre a et b, 1 → 0 entre c et d. */
export function window4(a: number, b: number, c: number, d: number, x: number) {
  return Math.min(smoothstep(a, b, x), 1 - smoothstep(c, d, x));
}

/** PRNG déterministe (mulberry32) — mêmes positions à chaque chargement. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Bruit de valeur 2D lisse (terrain procédural). */
export function valueNoise2D(rand: () => number, size = 256) {
  const table = Float32Array.from({ length: size * size }, () => rand());
  const at = (x: number, y: number) =>
    table[(((y % size) + size) % size) * size + (((x % size) + size) % size)];
  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const a = lerp(at(xi, yi), at(xi + 1, yi), u);
    const b = lerp(at(xi, yi + 1), at(xi + 1, yi + 1), u);
    return lerp(a, b, v);
  };
}
