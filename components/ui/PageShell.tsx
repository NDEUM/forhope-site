import Image from "next/image";
import type { ReactNode } from "react";
import { photos, type PhotoKey } from "@/content/media";
import { PageMotion } from "@/components/ui/PageMotion";

/**
 * Gabarit des pages internes, dans le langage du bâtiment de l'accueil :
 * une photo plein cadre avec son cartel (numéro de salle, titre), puis un
 * contenu éditorial posé sur du béton banché.
 */
export function PageShell({
  eyebrow,
  title,
  intro,
  photo,
  number,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  photo?: PhotoKey;
  /** Numéro de salle affiché dans le cartel. */
  number?: string;
  children: ReactNode;
}) {
  const media = photo ? photos[photo] : null;
  return (
    <main id="contenu" className="page">
      <header className={`page-hero${media ? " page-hero--photo" : ""}`}>
        {media && (
          <div className="page-hero__media" aria-hidden="true">
            <Image src={media.src} alt="" fill priority sizes="100vw" />
          </div>
        )}
        <div className="page-hero__glow" aria-hidden="true" />
        <div className="page-hero__inner">
          <div className="page-cartel">
            <span className="cartel__rule" aria-hidden="true" />
            <p className="cartel__head">
              {number && <span className="cartel__num">{number}</span>}
              <span className="cartel__title">{eyebrow}</span>
            </p>
            <h1 className="title">{title}</h1>
            {intro && <p className="lede">{intro}</p>}
          </div>
        </div>
      </header>
      <div className="page-body">{children}</div>
      <PageMotion />
    </main>
  );
}

export function PageSection({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="page-section" data-reveal>
      {title && <h2 className="page-section__title">{title}</h2>}
      <div className="page-section__content">{children}</div>
    </section>
  );
}
