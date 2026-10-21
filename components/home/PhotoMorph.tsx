import { ScrollMorphHero } from "@/components/ui/scroll-morph-hero";
import { homePhotos as PHOTOS } from "@/content/home-photos";
import { ButtonLink } from "@/components/ui/ButtonLink";

/**
 * Juste après la photo d'arrivée « Redonnons un sourire aux enfants » : les photos de l'association et de ses projets se
 * rassemblent au fil du défilement — dispersées, en ligne, en cercle, puis
 * en arc. Uniquement des photos authentiques, avec leurs descriptions.
 */
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
