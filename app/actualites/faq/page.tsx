import type { Metadata } from "next";
import Link from "next/link";
import { PageSection, PageShell } from "@/components/ui/PageShell";
import { Placeholder } from "@/components/ui/Placeholder";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Questions fréquentes sur For Hope Association.",
};

/** Réponses limitées à ce que le site permet déjà ; le reste est à compléter par l'association. */
const faq = [
  {
    q: "Comment devenir bénévole ?",
    a: (
      <>
        Écrivez-nous depuis la page <Link href="/contact">Contact</Link> en indiquant vos disponibilités : l&apos;équipe vous répondra.
      </>
    ),
  },
  {
    q: "Comment soutenir l'association ?",
    a: (
      <>
        Toutes les façons d&apos;agir (don, bénévolat, partenariat) sont présentées sur la page <Link href="/agir">Agir</Link>.
      </>
    ),
  },
  {
    q: "Comment participer à un événement ?",
    a: (
      <>
        Le calendrier des campagnes (Gala, Septembre en Or, Octobre Rose, Movember) est sur la page{" "}
        <Link href="/evenements">Événements</Link>.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <PageShell number="03.3" eyebrow="FAQ" title="Questions fréquentes." intro="Les réponses aux questions qu'on nous pose le plus souvent.">
      <PageSection>
        <div className="faq">
          {faq.map((item) => (
            <details key={item.q} className="faq__item" data-reveal>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
        <Placeholder>Autres questions et réponses à fournir par l&apos;association</Placeholder>
      </PageSection>
    </PageShell>
  );
}
