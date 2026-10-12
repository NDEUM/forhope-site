import type { PhotoKey } from "@/content/media";

/**
 * Actions de For Hope (page /actions) — CONTENU PROVISOIRE.
 * Mêmes verbes que la homepage ; descriptions à valider par l'association.
 */
export interface Action {
  id: string;
  title: string;
  summary: string;
  photo: PhotoKey | null;
  placeholder: boolean;
}

export const actions: Action[] = [
  {
    id: "agir",
    title: "Agir",
    summary: "Une équipe de bénévoles, sur le terrain comme en coulisses.",
    photo: "benevolesEquipe",
    placeholder: true,
  },
  {
    id: "accompagner",
    title: "Accompagner",
    summary: "Être présents auprès des enfants, simplement.",
    photo: "benevoleEnfants",
    placeholder: true,
  },
  {
    id: "soutenir",
    title: "Soutenir",
    summary: "Redonner un sourire, jour après jour.",
    photo: "enfantsForce",
    placeholder: true,
  },
  {
    id: "rassembler",
    title: "Rassembler",
    summary: "Gala, Octobre Rose, Movember, Septembre en Or : sensibiliser et collecter.",
    photo: "enfantsGroupe",
    placeholder: true,
  },
];
