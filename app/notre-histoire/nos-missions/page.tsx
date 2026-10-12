import type { Metadata } from "next";
import { PageSection, PageShell } from "@/components/ui/PageShell";
import { DOMAINS } from "@/content/domains";
import { PageLinks } from "@/components/ui/PageLinks";

export const metadata: Metadata = {
  title: "Nos missions",
  description: "Les missions de For Hope Association : redonner un sourire aux enfants.",
};

export default function MissionsPage() {
  return (
    <PageShell
      number="01.1"
      eyebrow="Nos missions"
      title="Redonner un sourire aux enfants."
      intro="For Hope rassemble des bénévoles engagés pour redonner un sourire aux enfants."
      photo="sourirePortrait"
    >
      <PageSection title="Notre mission">
        <p>
          La mission de l&apos;association est d&apos;apporter l&apos;aide nécessaire aux personnes frappées par la précarité et la pauvreté,
          en mettant en œuvre des solutions intelligentes et pérennes au niveau local, en s&apos;appuyant sur ses bénévoles, ses partenaires et
          ses donateurs.
        </p>
        <p className="pj-source">Source : Rapport d&apos;activités For Hope 2025.</p>
      </PageSection>
      <PageSection title="Nos domaines d'intervention">
        <ul className="domains">
          {DOMAINS.map((d) => (
            <li key={d.title} data-reveal>
              <h3>{d.title}</h3>
              <p>{d.text}</p>
            </li>
          ))}
        </ul>
      </PageSection>
      <PageSection title="Voir aussi">
        <PageLinks
          links={[
            { href: "/notre-histoire/domaines-d-action", label: "Domaines d'action", text: "Comment ces missions se traduisent sur le terrain." },
            { href: "/nos-projets", label: "Nos projets", text: "Les projets portés par l'association." },
          ]}
        />
      </PageSection>
    </PageShell>
  );
}
