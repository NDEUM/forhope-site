import type { Metadata } from "next";
import Link from "next/link";
import { PageSection, PageShell } from "@/components/ui/PageShell";
import { Placeholder } from "@/components/ui/Placeholder";

export const metadata: Metadata = {
  title: "Agir",
  description: "Donner, devenir bénévole ou partenaire de For Hope.",
};

const ways = [
  {
    id: "donner",
    title: "Donner",
    text: "Chaque don finance directement les actions auprès des enfants.",
    cta: "Faire un don",
    href: "#donner",
    featured: true,
    note: "Plateforme de don à définir",
  },
  {
    id: "benevole",
    title: "Devenir bénévole",
    text: "Rejoindre l'équipe, sur le terrain ou à distance, selon votre temps.",
    cta: "Nous écrire",
    href: "/contact",
  },
  {
    id: "partenaire",
    title: "Devenir partenaire",
    text: "Entreprises, institutions, associations : construisons ensemble.",
    cta: "Prendre contact",
    href: "/contact",
  },
];

export default function ActPage() {
  return (
    <PageShell
      number="04"
      eyebrow="Agir"
      title="Seul on va plus vite, ensemble on va plus loin."
      intro="Trois façons de rejoindre le mouvement."
      photo="benevolePouponniere"
    >
      <ul className="ways">
        {ways.map((w) => (
          <li key={w.id} id={w.id} data-reveal>
            <Link href={w.href} className={`way${w.featured ? " way--featured" : ""}`}>
              <h2>{w.title}</h2>
              <p>{w.text}</p>
              <span className="way__cta">
                {w.cta}
                <svg width="14" height="10" viewBox="0 0 14 10" aria-hidden="true">
                  <path d="M1 5h12M9 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </span>
              {w.note && <Placeholder>{w.note}</Placeholder>}
            </Link>
          </li>
        ))}
      </ul>
      <PageSection>
        <Placeholder>Modalités précises (reçu fiscal, engagement bénévole) à fournir</Placeholder>
      </PageSection>
    </PageShell>
  );
}
