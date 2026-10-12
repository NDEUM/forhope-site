import type { Metadata } from "next";
import { PageSection, PageShell } from "@/components/ui/PageShell";
import { Placeholder } from "@/components/ui/Placeholder";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contacter For Hope Association.",
};

export default function ContactPage() {
  return (
    <PageShell number="06" eyebrow="Contact" title="Écrivez-nous." intro="Une question, une envie d'agir, un projet de partenariat ?" photo="enfantSourire">
      <PageSection title="Coordonnées">
        <dl className="contact-list">
          <div>
            <dt>E-mail</dt>
            <dd>adresse@exemple.org</dd>
          </div>
          <div>
            <dt>Site</dt>
            <dd>{site.url.replace("https://", "")}</dd>
          </div>
          <div>
            <dt>Réseaux</dt>
            <dd>{site.socials.map((s) => s.label).join(" · ")}</dd>
          </div>
        </dl>
        <Placeholder>E-mail, adresse et liens des réseaux à fournir — formulaire à brancher ensuite</Placeholder>
      </PageSection>
    </PageShell>
  );
}
