import type { Metadata } from "next";
import Image from "next/image";
import { TiltedGridHero, type TiltedGridItem } from "@/components/ui/tilted-grid-hero";
import { photos, type PhotoKey } from "@/content/media";

const item = (k: PhotoKey): TiltedGridItem => ({ src: photos[k].src, alt: photos[k].alt });
const top: PhotoKey[] = ["benevolesEquipe", "enfantsComplices", "benevolePouponniere", "sourirePortrait", "benevoleEnfants", "enfantsForce", "enfantSourire", "enfantsGroupe"];
const bottom: PhotoKey[] = ["enfantSourire", "benevoleEnfants", "enfantsGroupe", "benevolesEquipe", "sourirePortrait", "enfantsComplices", "enfantsForce", "benevolePouponniere"];

export const metadata: Metadata = {
  title: "Galerie",
  description: "Les photographies de For Hope Association.",
};

/** Galerie : le carrousel 3D incurvé, puis toutes les photos en grille. */
export default function GaleriePage() {
  const all = Object.values(photos);
  return (
    <main id="contenu" className="galerie">
      <section className="galerie__hero" aria-labelledby="galerie-title">
        <div className="galerie__head">
          <p className="trail__eyebrow">For Hope en images</p>
          <h1 id="galerie-title" className="galerie__title">
            Galerie
          </h1>
        </div>
        <TiltedGridHero
          rows={[
            { items: top.map(item), direction: 1 },
            { items: bottom.map(item), direction: -1 },
          ]}
        />
      </section>
      <section className="galerie__grid" aria-labelledby="galerie-grid-title">
        <h2 id="galerie-grid-title" className="galerie__grid-title">
          Toutes nos photos
        </h2>
        <p className="galerie__note">Photographies issues des supports de communication de l&apos;association.</p>
        <ul className="gallery">
          {all.map((p) => (
            <li key={p.src} className="gallery__item">
              <Image src={p.src} alt={p.alt} width={p.width} height={p.height} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
