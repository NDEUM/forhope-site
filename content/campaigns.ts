/**
 * Campagnes et événements portés par For Hope (logos officiels fournis).
 * Les descriptions décrivent la campagne elle-même ; les dates et lieux
 * restent à fournir par l'association.
 */
export interface Campaign {
  id: string;
  title: string;
  subtitle: string;
  logo: string;
  accent: string;
}

export const campaigns: Campaign[] = [
  { id: "gala", title: "Gala", subtitle: "La soirée annuelle de For Hope", logo: "/brand/events/gala.png", accent: "#E8BF6E" },
  { id: "septembre-en-or", title: "Septembre en Or", subtitle: "Sensibiliser aux cancers de l'enfant", logo: "/brand/events/septembre-en-or.png", accent: "#DEAC59" },
  { id: "octobre-rose", title: "Octobre Rose", subtitle: "Se mobiliser contre le cancer du sein", logo: "/brand/events/octobre-rose.png", accent: "#E71D73" },
  { id: "movember", title: "Movember", subtitle: "Parler de la santé des hommes", logo: "/brand/events/movember.png", accent: "#3392CA" },
];
