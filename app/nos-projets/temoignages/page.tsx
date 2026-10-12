import type { Metadata } from "next";
import Image from "next/image";
import { PageSection, PageShell } from "@/components/ui/PageShell";
import { Placeholder } from "@/components/ui/Placeholder";
import { ambassadors, initials, president, presidentWord } from "@/content/people";

export const metadata: Metadata = {
  title: "Témoignages",
  description: "Le mot du Président et de l'ambassadeur de For Hope Association.",
};

export default function TestimonialsPage() {
  const amb = ambassadors[0];
  return (
    <PageShell number="02.2" eyebrow="Témoignages" title="Ils racontent." intro="Celles et ceux qui portent For Hope, avec leurs propres mots." photo="benevoleEnfants">
      <PageSection title="Le mot du Président">
        <figure className="quote" data-reveal>
          {president.photo ? (
            <div className="quote__photo">
              <Image src={president.photo} alt={`Portrait de ${president.name}`} fill sizes="200px" />
            </div>
          ) : (
            <span className="quote__photo quote__photo--initials" aria-hidden="true">
              {initials(president.name)}
            </span>
          )}
          <blockquote className="quote__text">
            {presidentWord.map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
          </blockquote>
          <figcaption className="quote__by">
            <strong>{president.name}</strong>
            <span>{president.role}</span>
          </figcaption>
        </figure>
      </PageSection>

      <PageSection title="Le mot de l'ambassadeur">
        <p>
          <strong>{amb.name}</strong> — {amb.text}
        </p>
      </PageSection>

      <PageSection title="Leurs mots">
        <p>Bénévoles, familles, partenaires : chaque témoignage sera publié avec le prénom, le rôle et l&apos;accord de la personne.</p>
        <Placeholder>Autres témoignages à fournir (texte, prénom, rôle, autorisation)</Placeholder>
      </PageSection>
    </PageShell>
  );
}
