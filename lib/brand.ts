/**
 * Couleurs officielles — FH_CharteGGraphique2022.pdf (source de vérité).
 * Ne pas ajouter de teinte hors charte : les dégradés du site sont des
 * interpolations entre ces valeurs.
 */
export const brand = {
  // Couleurs principales
  midnight: "#0C0D23",
  hopeBlue: "#3392CA",
  saloumBlue: "#3DB2DE",
  // Couleurs secondaires
  deepBlue: "#00406D",
  pinkLively: "#E71D73",
  energy: "#EA5B1B",
  retba: "#EC607C",
  dynamicGreen: "#DEDC00",
  white: "#FFFFFF",
  /**
   * Golden'Hope : la charte le décrit comme un « dégradé 6 couleurs » sans
   * valeurs. Ces trois teintes sont échantillonnées sur le logo officiel
   * FH_Gala.png (sombre → clair). À remplacer si les valeurs exactes sont fournies.
   */
  goldDeep: "#DEAC59",
  goldMid: "#E8BF6E",
  goldLight: "#FDE79F",
} as const;

export type BrandColor = keyof typeof brand;

export type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function mixRgb(a: RGB, b: RGB, t: number, out: RGB = [0, 0, 0]): RGB {
  out[0] = a[0] + (b[0] - a[0]) * t;
  out[1] = a[1] + (b[1] - a[1]) * t;
  out[2] = a[2] + (b[2] - a[2]) * t;
  return out;
}

export function rgbToCss([r, g, b]: RGB): string {
  return `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)})`;
}

/** Mélange deux couleurs de la charte (t = part de la seconde). */
export function blend(a: string, b: string, t: number): string {
  const [r, g, bl] = mixRgb(hexToRgb(a), hexToRgb(b), t);
  const h = (v: number) => Math.round(v * 255).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(bl)}`;
}
