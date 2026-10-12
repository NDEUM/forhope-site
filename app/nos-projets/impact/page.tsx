import type { Metadata } from "next";
import { PageSection, PageShell } from "@/components/ui/PageShell";
import { keyFigures } from "@/content/projects";

export const metadata: Metadata = {
  title: "Impact",
  description: "L'impact des actions de For Hope Association : chiffres clés et indicateurs par domaine.",
};

/** Répartition des bénéficiaires par domaine sur 3 exercices (Rapport d'activités 2025). */
const byDomain = [
  { label: "Santé", value: 42 },
  { label: "Alimentation", value: 24 },
  { label: "Éducation", value: 15 },
  { label: "Accès à l'eau", value: 11 },
  { label: "Accès à l'énergie", value: 6 },
  { label: "Environnement", value: 2 },
];

export default function ImpactPage() {
  return (
    <PageShell
      number="02.1"
      eyebrow="Impact"
      title="Mesurer ce qui change."
      intro="Les chiffres publiés par l'association dans son Dossier de presse 2026 et son Rapport d'activités 2025."
      photo="enfantsForce"
    >
      <section className="pj-figures" aria-label="Chiffres clés" data-reveal>
        <dl>
          {keyFigures.map((f) => (
            <div key={f.label}>
              <dt>{f.value}</dt>
              <dd>{f.label}</dd>
            </div>
          ))}
        </dl>
        <p className="pj-source">Source : Dossier de presse For Hope 2026.</p>
      </section>

      <PageSection title="Au 31 décembre 2024">
        <p className="impact-lead">
          <strong>123 activités</strong> dans <strong>14 pays</strong>, plus de <strong>150 000 bénéficiaires directs</strong>, pour
          environ <strong>1 400 349 €</strong> de dépenses engagées.
        </p>
        <p className="pj-source">Source : Rapport d&apos;activités For Hope 2025.</p>
      </PageSection>

      <PageSection title="Bénéficiaires par domaine">
        <p>Répartition des bénéficiaires sur trois exercices.</p>
        <ul className="impact-bars" aria-label="Répartition des bénéficiaires par domaine">
          {byDomain.map((d) => (
            <li key={d.label} data-reveal>
              <span className="impact-bars__label">{d.label}</span>
              <span className="impact-bars__track" aria-hidden="true">
                <span style={{ width: `${d.value}%` }} />
              </span>
              <span className="impact-bars__value">{d.value} %</span>
            </li>
          ))}
        </ul>
        <p className="pj-source">Source : Rapport d&apos;activités For Hope 2025.</p>
      </PageSection>
    </PageShell>
  );
}
