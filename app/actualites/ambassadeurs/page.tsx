import type { Metadata } from "next";
import { PageSection, PageShell } from "@/components/ui/PageShell";
import { ambassadors, godparents, initials, type Person } from "@/content/people";

export const metadata: Metadata = {
  title: "Ambassadeurs",
  description: "Les ambassadeurs et parrains de For Hope Association : Idrissa Gana Gueye, Nicolas Jackson, Kylian Mbappé, Presnel Kimpembe.",
};

function PersonCard({ p }: { p: Person }) {
  return (
    <li className="person" data-reveal>
      <span className="person__avatar" aria-hidden="true">
        {initials(p.name)}
      </span>
      <div>
        <p className="person__role">{p.role}</p>
        <h3 className="person__name">{p.name}</h3>
        {p.text && <p className="person__text">{p.text}</p>}
      </div>
    </li>
  );
}

export default function AmbassadorsPage() {
  return (
    <PageShell
      number="03.2"
      eyebrow="Ambassadeurs"
      title="Ils portent notre voix."
      intro="Nos ambassadeurs et nos parrains font connaître les actions de For Hope et rassemblent autour de la cause des enfants."
    >
      <PageSection title="Nos ambassadeurs">
        <ul className="people">
          {ambassadors.map((p) => (
            <PersonCard key={p.name} p={p} />
          ))}
        </ul>
      </PageSection>
      <PageSection title="Nos parrains">
        <ul className="people">
          {godparents.map((p) => (
            <PersonCard key={p.name} p={p} />
          ))}
        </ul>
      </PageSection>
    </PageShell>
  );
}
