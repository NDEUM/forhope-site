import { ScrollMorphHero, type MorphPhoto } from "@/components/ui/scroll-morph-hero";
import { photos } from "@/content/media";
import { ButtonLink } from "@/components/ui/ButtonLink";

/**
 * Juste après la photo d'arrivée « Redonnons un sourire aux enfants » : les photos de l'association et de ses projets se
 * rassemblent au fil du défilement — dispersées, en ligne, en cercle, puis
 * en arc. Uniquement des photos authentiques, avec leurs descriptions.
 */
const project = (file: string, alt: string): MorphPhoto => ({ src: `/media/projets/${file}`, alt });

const PHOTOS: MorphPhoto[] = [
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

export function PhotoMorph() {
  return (
    <ScrollMorphHero
      className="smh--after-photo"
      photos={PHOTOS}
      hint="Continuez à défiler"
      title="De la France à l'Afrique, faisons grandir l'espoir."
      titleId="morph-title"
      backLogo="/brand/forhope-logo-blanc.png"
    >
      <p className="smh-sup">Nos actions en images</p>
      <p className="smh-lede">Puits solaires, bibliothèque numérique, maternité, galas caritatifs : des moments partagés avec les enfants, les familles et les bénévoles.</p>
      <ButtonLink href="/nos-projets" variant="outline" arrow>
        Découvrir nos projets
      </ButtonLink>
    </ScrollMorphHero>
  );
}
