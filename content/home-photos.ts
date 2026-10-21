import { photos } from "@/content/media";

/**
 * Photos authentiques de l'association et de ses projets, avec leurs
 * descriptions (accueil : galerie en orbite, photos qui se rassemblent).
 */
const project = (file: string, alt: string) => ({ src: `/media/projets/${file}`, alt });

export const homePhotos: { src: string; alt: string }[] = [
  photos.benevolesEquipe,
  project("puits-solaire.jpg", "Puits solaire construit dans un village du Sénégal"),
  photos.enfantsGroupe,
  project("bibliotheque-numerique.jpg", "Salle informatique de la bibliothèque numérique de Cambérène"),
  photos.benevoleEnfants,
  project("maternite-gate-gallo.jpg", "Visite de la maternité de proximité de Gate Gallo"),
  photos.sourirePortrait,
  project("electrification-nguelou.jpg", "Les habitants de Nguélou réunis lors du projet d'électrification solaire"),
  photos.enfantsComplices,
  project("gala-paris-2022.jpg", "Gala caritatif For Hope à Paris, mai 2022"),
  photos.benevolePouponniere,
  project("ecolo-culture.jpg", "Élèves du programme ECOLO pratiquant la culture sur table"),
  photos.enfantSourire,
  project("espace-jeunes.jpg", "Inauguration de l'Espace des jeunes à l'hôpital Fann de Dakar"),
  photos.enfantsForce,
  project("maison-des-parents.jpg", "Pose de la première pierre de la Maison des parents à Sangalkam"),
  project("don-du-sang.jpg", "Une donneuse lors d'une journée de don du sang"),
  project("programme-vih-fann.jpg", "Remise d'une bourse d'études au Centre régional de recherche et de formation de Fann"),
  project("gala-londres-2024.jpg", "Gala caritatif For Hope à Londres, mai 2024"),
].map(({ src, alt }) => ({ src, alt }));

