import type { Metadata } from "next";
import { PageSection, PageShell } from "@/components/ui/PageShell";
import { Placeholder } from "@/components/ui/Placeholder";

export const metadata: Metadata = {
  title: "Événements",
  description: "Gala, Octobre Rose, Movember, Septembre en Or : les rendez-vous solidaires de For Hope.",
};

const events = [
  { name: "Gala For Hope", text: "La soirée annuelle de l'association." },
  { name: "Septembre en Or", text: "Sensibilisation aux cancers de l'enfant." },
  { name: "Octobre Rose", text: "Mobilisation contre le cancer du sein." },
  { name: "Movember", text: "Sensibilisation à la santé masculine." },
];

export default function EventsPage() {
  return (
    <PageShell number="05" eyebrow="Événements" title="Se retrouver, sensibiliser, collecter." intro="Les rendez-vous qui rythment l'année de For Hope." photo="enfantsGroupe">
      <PageSection>
        <ul className="event-list">
          {events.map((e) => (
            <li key={e.name} className="event-row" data-reveal>
              <p className="event-row__date">Date à venir</p>
              <div>
                <h2>{e.name}</h2>
                <p>{e.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <Placeholder>Dates, lieux et descriptions à fournir</Placeholder>
      </PageSection>
    </PageShell>
  );
}
