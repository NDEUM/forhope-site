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
            <dd>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </dd>
          </div>
          <div>
            <dt>Téléphone</dt>
            <dd>
              <a href={site.phone.href}>{site.phone.display}</a>
            </dd>
          </div>
          <div>
            <dt>Site</dt>
            <dd>
              <a href={site.url}>{site.url.replace("https://", "")}</a>
            </dd>
          </div>
          <div>
            <dt>Réseaux</dt>
            <dd>
              {site.socials.map((s, i) => (
                <span key={s.label}>
                  {i > 0 && " · "}
                  <a href={s.href} target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                </span>
              ))}
            </dd>
          </div>
        </dl>
        <Placeholder>Adresse postale à fournir — formulaire de contact à brancher ensuite</Placeholder>
      </PageSection>
    </PageShell>
  );
}
