import { PhotoTrail } from "@/components/gallery/PhotoTrail";

/**
 * Juste après la vidéo d'introduction : « For Hope en images ». Les photos
 * de l'association apparaissent sous la souris (au doigt sur mobile, aux
 * flèches au clavier), dans la continuité sombre de l'arrivée.
 */
export function PhotoArc() {
  return (
    <section className="arc" aria-labelledby="arc-title">
      <PhotoTrail
        className="trail--home"
        eyebrow="For Hope en images"
        title="Des actions concrètes. Des vies qui changent."
        titleAs="h2"
        titleId="arc-title"
        lede="Bénévoles, rencontres, moments partagés : les photographies de l'association."
      />
    </section>
  );
}
