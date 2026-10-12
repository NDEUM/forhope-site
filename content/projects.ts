/**
 * Projets de For Hope — source : Rapport d'activités 2025 et Dossier de
 * presse 2026 de l'association. Les chiffres et dates sont repris tels
 * quels ; les photos sont celles des documents (public/media/projets).
 */

export type ProjectStatus = "acheve" | "programme" | "a-venir";

export interface Project {
  id: string;
  status: ProjectStatus;
  title: string;
  place?: string;
  date?: string;
  domain: string;
  summary: string;
  points?: string[];
  figures?: { value: string; label: string }[];
  partners?: string;
  photo?: { src: string; alt: string };
}

const ph = (file: string, alt: string) => ({ src: `/media/projets/${file}`, alt });

export const projects: Project[] = [
  // ——— Projets achevés (Dossier de presse 2026) ———
  {
    id: "espace-jeunes",
    status: "acheve",
    title: "Espace des jeunes PVVIH",
    place: "Dakar — Hôpital Fann",
    date: "Inauguré le 11 juin 2024",
    domain: "Santé",
    summary:
      "Un espace psychosocial pour les enfants et adolescents vivant avec le VIH, afin qu'ils puissent s'exprimer, se rencontrer et trouver des solutions aux difficultés rencontrées.",
    points: [
      "Soutien psychologique et groupes de parole",
      "Soutien juridique contre la discrimination",
      "Soutien à la scolarité et à la réinsertion professionnelle",
      "Activités récréatives, sportives et espace numérique",
    ],
    photo: ph("espace-jeunes.jpg", "Inauguration de l'Espace des jeunes à l'hôpital Fann de Dakar"),
  },
  {
    id: "bibliotheque",
    status: "acheve",
    title: "Bibliothèque numérique",
    place: "Cambérène",
    date: "Inaugurée le 21 juin 2024",
    domain: "Éducation",
    summary:
      "Améliorer les conditions d'apprentissage et initier élèves et enseignants à l'outil informatique, avec un accès facile aux ressources numériques.",
    points: [
      "Initiation des élèves et enseignants à l'informatique",
      "Accès rapide à l'information et aux documents numériques",
      "Outils pour encourager l'innovation et la créativité",
    ],
    photo: ph("bibliotheque-numerique.jpg", "Salle informatique de la bibliothèque numérique de Cambérène"),
  },
  {
    id: "maternite",
    status: "acheve",
    title: "Maternité de proximité",
    place: "Dangalma — Gate Gallo",
    date: "Inauguration en décembre 2024",
    domain: "Santé",
    summary:
      "Des locaux fonctionnels et des équipements sanitaires adéquats pour une meilleure prise en charge des patients, notamment en situation d'urgence avant évacuation.",
    photo: ph("maternite-gate-gallo.jpg", "Visite de la maternité de proximité de Gate Gallo"),
  },
  {
    id: "maison-des-parents",
    status: "acheve",
    title: "Maison des parents d'enfants atteints de cancer",
    place: "Sangalkam",
    date: "Inauguration prévue en avril 2025",
    domain: "Santé",
    partners: "Avec le GFAOP et l'association Sunu Dome Sunu Yitté",
    summary:
      "Un hébergement hors de l'hôpital pour les enfants suivis à l'Unité d'oncologie pédiatrique de Dakar et leur accompagnant, pendant les inter-cures.",
    points: [
      "Réduire les abandons de traitement et augmenter la survie",
      "Soutien psychologique, scolaire et activités d'éveil",
      "Désengorger l'UOP de Dakar",
    ],
    figures: [{ value: "300 000 €", label: "budget estimé" }],
    photo: ph("maison-des-parents.jpg", "Pose de la première pierre de la Maison des parents à Sangalkam"),
  },

  // ——— Programmes et actions ———
  {
    id: "vih",
    status: "programme",
    title: "Prise en charge médico-biologique des enfants vivant avec le VIH",
    place: "11 pays d'Afrique",
    date: "Depuis octobre 2022",
    domain: "Santé",
    partners: "Avec le CRCF et EVA",
    summary:
      "Financer les bilans de suivi, les médicaments, les frais d'hospitalisation et les transports des enfants infectés par le VIH.",
    figures: [{ value: "4 627", label: "enfants pris en charge dans 11 pays" }],
  },
  {
    id: "bourses",
    status: "programme",
    title: "500 bourses d'études en Afrique",
    domain: "Éducation",
    summary:
      "Fournitures scolaires, inscriptions et formations pour des enfants vulnérables, souvent orphelins, afin qu'ils poursuivent leurs études.",
    figures: [{ value: "+100", label: "enfants bénéficiaires aujourd'hui" }],
    photo: ph("programme-vih-fann.jpg", "Remise d'une bourse d'études au Centre régional de recherche et de formation de Fann"),
  },
  {
    id: "gfaop",
    status: "programme",
    title: "Soutien aux enfants atteints de cancer",
    place: "Kinshasa, Lubumbashi, Dakar",
    domain: "Santé",
    partners: "Avec le GFAOP",
    summary:
      "Soutien aux traitements et fonds pour les examens de diagnostic des enfants atteints d'un cancer curable dans les unités d'oncologie pédiatrique.",
    figures: [{ value: "70 à 80", label: "enfants soutenus par le programme" }],
  },
  {
    id: "electrification",
    status: "programme",
    title: "Électrification solaire",
    place: "Nguélou, région de Kaolack",
    domain: "Développement durable",
    partners: "Avec VIVO Energy",
    summary:
      "Des kits solaires de dernière génération pour les foyers, écoles, cases de santé et lieux de culte de la communauté rurale de Nguélou.",
    figures: [
      { value: "235", label: "maisons électrifiées (phase 1)" },
      { value: "10", label: "villages" },
      { value: "2 000", label: "habitants environ" },
    ],
    photo: ph("electrification-nguelou.jpg", "Les habitants de Nguélou réunis lors du projet d'électrification solaire"),
  },
  {
    id: "eau",
    status: "programme",
    title: "Accès à l'eau : 15 puits, 15 villages",
    place: "Sénégal",
    domain: "Accès à l'eau",
    partners: "Avec l'association STRONG3R de Presnel Kimpembe",
    summary:
      "Des puits traditionnels, à robinets et solaires pour faciliter l'accès à l'eau potable, réduire les maladies hydriques et améliorer les conditions de vie.",
    figures: [
      { value: "15", label: "puits" },
      { value: "15", label: "villages" },
      { value: "35 000", label: "habitants aidés" },
    ],
    photo: ph("puits-solaire.jpg", "Puits solaire construit dans un village du Sénégal"),
  },
  {
    id: "pouponnieres",
    status: "programme",
    title: "Pouponnières et orphelinats",
    place: "Sénégal",
    date: "Parrainage depuis janvier 2022",
    domain: "Alimentation",
    summary:
      "Visites et distributions trimestrielles dans les pouponnières et orphelinats qui accueillent des enfants abandonnés ou orphelins.",
    figures: [{ value: "+530", label: "enfants touchés" }],
    photo: { src: "/media/photos/benevole-pouponniere.jpg", alt: "Un bénévole For Hope salue un jeune enfant dans une pouponnière" },
  },
  {
    id: "ecolo",
    status: "programme",
    title: "ECOLO — éducation environnementale",
    place: "Dakar, Thiès, Kaolack, Fatick, Ziguinchor",
    domain: "Environnement",
    partners: "Avec l'association Senvie",
    summary:
      "Former les élèves au recyclage, à la gestion des déchets et à la culture sur table, pour qu'ils deviennent des éco-champions dans leur école et leur quartier.",
    figures: [
      { value: "10", label: "établissements" },
      { value: "100", label: "élèves éco-champions" },
    ],
    photo: ph("ecolo-culture.jpg", "Élèves du programme ECOLO pratiquant la culture sur table"),
  },
  {
    id: "sante",
    status: "programme",
    title: "Santé et médecine sociale",
    place: "Sénégal",
    domain: "Santé",
    summary:
      "Interventions chirurgicales, dons de matériel médical aux hôpitaux, réfection de services pédiatriques et aide en urgence.",
    figures: [
      { value: "4", label: "interventions chirurgicales" },
      { value: "18", label: "patients traités grâce aux dons de matériel cardio" },
    ],
  },
  {
    id: "don-du-sang",
    status: "programme",
    title: "Journées de don du sang",
    place: "Sénégal",
    domain: "Santé",
    summary: "Participer à l'élan de solidarité nationale pour renouveler le stock de sang et promouvoir le don au Sénégal.",
    figures: [
      { value: "465", label: "donneurs" },
      { value: "100", label: "poches en 2026" },
    ],
    photo: ph("don-du-sang.jpg", "Une donneuse lors d'une journée de don du sang"),
  },

  // ——— Projets à venir ———
  {
    id: "unicef",
    status: "a-venir",
    title: "Éducation inclusive en République centrafricaine",
    domain: "Éducation",
    partners: "Avec l'UNICEF",
    summary: "Créer et soutenir des centres d'apprentissage pour les enfants en situation de handicap, notamment non-voyants et malvoyants.",
  },
  {
    id: "maternelle",
    status: "a-venir",
    title: "École maternelle de Gate Gallo",
    domain: "Éducation",
    partners: "Avec Racines d'Enfance",
    summary: "Une maternelle de nouvelle génération, inclusive, dans le village où la maternité a été réalisée.",
  },
  {
    id: "jojq",
    status: "a-venir",
    title: "Jeux olympiques de la jeunesse des quartiers",
    place: "Dakar, Thiès",
    domain: "Éducation",
    summary: "À l'occasion des JOJ 2026 au Sénégal, des compétitions locales pour favoriser l'inclusion des jeunes des quartiers populaires par le sport.",
  },
  {
    id: "village-espoir",
    status: "a-venir",
    title: "Village de l'espoir",
    domain: "Développement durable",
    summary:
      "Encourager l'investissement durable dans les communautés rurales d'Afrique : nutrition, santé, eau, éducation, agriculture et énergie.",
  },
];

/** Chiffres clés — Dossier de presse 2026. */
export const keyFigures = [
  { value: "+2 000 000 €", label: "de fonds récoltés" },
  { value: "250 000", label: "bénéficiaires directs" },
  { value: "110 000", label: "bénéficiaires indirects (projets à long terme)" },
  { value: "+530", label: "membres, bénévoles et adhérents" },
  { value: "14", label: "pays" },
  { value: "12", label: "projets soutenus" },
  { value: "120", label: "actions" },
  { value: "+160", label: "donateurs" },
];

/** Grands événements — Rapport d'activités 2025 (photo uniquement quand elle est propre à l'événement). */
export const galas: { title: string; place: string; date: string; photo: { src: string; alt: string } | null }[] = [
  { title: "Gala caritatif", place: "Paris", date: "Mai 2022", photo: ph("gala-paris-2022.jpg", "Gala caritatif For Hope à Paris, mai 2022") },
  { title: "Gala « Love for Humanity »", place: "Paris", date: "Janvier 2023", photo: null },
  { title: "Gala caritatif", place: "Londres", date: "Mai 2024", photo: ph("gala-londres-2024.jpg", "Gala caritatif For Hope à Londres, mai 2024") },
];

export const statusLabel: Record<ProjectStatus, string> = {
  acheve: "Projet achevé",
  programme: "Programme",
  "a-venir": "À venir",
};
