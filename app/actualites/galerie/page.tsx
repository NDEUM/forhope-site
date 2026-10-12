import type { Metadata } from "next";
import Image from "next/image";
import { PageSection, PageShell } from "@/components/ui/PageShell";
import { photos } from "@/content/media";

export const metadata: Metadata = {
  title: "Galerie",
  description: "Les photographies de For Hope Association.",
};

export default function GalleryPage() {
  const all = Object.values(photos);
  return (
    <PageShell number="03.1" eyebrow="Galerie" title="Nos images." intro="Photographies issues des supports de communication de l'association.">
      <PageSection>
        <ul className="gallery">
          {all.map((p) => (
            <li key={p.src} className="gallery__item" data-reveal>
              <Image src={p.src} alt={p.alt} width={p.width} height={p.height} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" />
            </li>
          ))}
        </ul>
      </PageSection>
    </PageShell>
  );
}
