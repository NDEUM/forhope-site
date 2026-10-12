export const site = {
  name: "For Hope",
  fullName: "For Hope Association",
  url: "https://www.forhopeassociation.org",
  description:
    "For Hope Association — un mouvement humain. Une personne, puis une autre : des bénévoles engagés auprès des enfants, des rencontres, des actions et des histoires.",
  /** Comptes officiels (adresses transmises par l'association). */
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/forhope_association" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/forhopeassociation/" },
  ],
  /** Lien de don — plateforme à définir. */
  donateHref: "/agir#donner",
};

export interface NavItem {
  href: string;
  label: string;
  emphasis?: boolean;
  children?: { href: string; label: string }[];
}

export const navigation: NavItem[] = [
  {
    href: "/notre-histoire",
    label: "Notre histoire",
    children: [
      { href: "/notre-histoire/nos-missions", label: "Nos missions" },
      { href: "/notre-histoire/domaines-d-action", label: "Domaines d'action" },
    ],
  },
  {
    href: "/nos-projets",
    label: "Nos projets",
    children: [
      { href: "/nos-projets/impact", label: "Impact" },
      { href: "/nos-projets/temoignages", label: "Témoignages" },
    ],
  },
  {
    href: "/actualites",
    label: "Actualités",
    children: [
      { href: "/actualites/galerie", label: "Galerie" },
      { href: "/actualites/ambassadeurs", label: "Ambassadeurs" },
      { href: "/actualites/faq", label: "FAQ" },
    ],
  },
  { href: "/galerie", label: "Galerie" },
  { href: "/evenements", label: "Événements" },
  { href: "/agir", label: "Agir", emphasis: true },
  { href: "/contact", label: "Contact" },
];
