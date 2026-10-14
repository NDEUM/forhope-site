/**
 * Les visages de For Hope. Sources : Rapport d'activités 2025 / Dossier de
 * presse 2026 (Idrissa Gana Gueye, Presnel Kimpembe, Macif Diouf) et
 * informations transmises par l'association (Nicolas Jackson, Kylian Mbappé).
 * Diffusion des photos des ambassadeurs et parrains autorisée par l'association
 * (13/10/2026) : il reste à recevoir les fichiers photo à utiliser.
 */

export interface Person {
  name: string;
  role: string;
  text?: string;
  photo?: string;
}

export const ambassadors: Person[] = [
  {
    name: "Idrissa Gana Gueye",
    role: "Ambassadeur et cofondateur",
    text:
      "Footballeur professionnel et international sénégalais, né et élevé au Sénégal. Confronté très tôt à la pauvreté, il a créé l'association avec ses proches pour centraliser les demandes d'aide et agir davantage.",
  },
  {
    name: "Nicolas Jackson",
    role: "Ambassadeur",
    text: "Footballeur international sénégalais, ambassadeur de For Hope.",
  },
];

export const godparents: Person[] = [
  {
    name: "Kylian Mbappé",
    role: "Parrain",
    text: "Parrain de l'association For Hope.",
  },
  {
    name: "Presnel Kimpembe",
    role: "Parrain",
    text: "Parrain de l'association. Son association STRONG3R est partenaire de For Hope pour le projet « 15 puits, 15 villages » d'accès à l'eau potable au Sénégal.",
  },
];

export const president: Person = {
  name: "Macif Diouf",
  role: "Président de For Hope Association",
  // Le seul portrait disponible (couverture du rapport) porte du texte incrusté :
  // à remplacer par une photo fournie par l'association.
};

/** Le mot du Président (Rapport d'activités 2025), cité tel quel. */
export const presidentWord = [
  "Tout ce que nous faisons, nous le faisons au service de la finalité qui nous guide : redonner de l'espoir aux nécessiteux.",
  "L'ambition de For Hope est immense, c'est pour cela qu'elle s'est construite autour d'une équipe solidaire, motivée et concernée entre la France et l'Afrique. Notre objectif est de nous assurer que nous avons un impact positif et durable là où nous opérons grâce à un engagement constructif avec les parties prenantes et avec des actions concrètes qui contribuent au développement socio-économique dans les pays, villes ou communes d'accueil.",
  "En d'autres termes, nous nous efforçons d'être un partenaire de confiance partout où nous opérons avec la population locale.",
];

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
