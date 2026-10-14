/**
 * Photothèque disponible (extraite des roll-ups officiels).
 * `verified` : photo de terrain For Hope identifiable (t-shirts de l'association).
 * Autorisations de diffusion (enfants compris) confirmées par l'association
 * le 13/10/2026.
 */
export interface Photo {
  src: string;
  alt: string;
  width: number;
  height: number;
  verified: boolean;
}

const p = (file: string, alt: string, width: number, height: number, verified = false): Photo => ({
  src: `/media/photos/${file}`,
  alt,
  width,
  height,
  verified,
});

export const photos = {
  enfantsComplices: p("enfants-complices.jpg", "Deux enfants se tiennent par l'épaule et sourient", 1600, 1066),
  sourirePortrait: p("sourire-portrait.jpg", "Portrait d'une jeune fille souriante", 1600, 1066),
  enfantsForce: p("enfants-force.jpg", "Des enfants rient en montrant leurs bras", 1600, 1066),
  enfantSourire: p("enfant-sourire.jpg", "Un garçon sourit, la tête posée sur sa main", 1600, 1208),
  enfantsGroupe: p("enfants-groupe.jpg", "Un groupe d'enfants rieurs", 1600, 1175),
  benevolesEquipe: p("benevoles-equipe.jpg", "L'équipe de bénévoles For Hope en t-shirts de l'association", 1600, 1200, true),
  benevolePouponniere: p("benevole-pouponniere.jpg", "Un bénévole salue un jeune enfant dans une pouponnière", 1600, 1067, true),
  benevoleEnfants: p("benevole-enfants.jpg", "Un bénévole For Hope partage un moment avec des tout-petits", 1600, 1066, true),
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;
