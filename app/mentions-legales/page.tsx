import type { Metadata } from "next";
import { PageSection, PageShell } from "@/components/ui/PageShell";
import { Placeholder } from "@/components/ui/Placeholder";

export const metadata: Metadata = {
  title: "Mentions légales",
  robots: { index: false },
};

export default function LegalPage() {
  return (
    <PageShell number="—" eyebrow="Informations" title="Mentions légales">
      <PageSection title="Éditeur">
        <p>For Hope Association — association loi 1901. Siège social, numéro RNA et directeur de la publication à compléter.</p>
      </PageSection>
      <PageSection title="Hébergement">
        <p>Nom, adresse et contact de l'hébergeur à compléter.</p>
      </PageSection>
      <PageSection title="Crédits et droits à l'image">
        <p>
          Les photographies sont publiées avec l'accord des personnes concernées et, pour les mineurs, de leurs
          représentants légaux. Crédits à compléter.
        </p>
      </PageSection>
      <PageSection title="Données personnelles">
        <p>Politique de confidentialité et gestion des cookies à compléter.</p>
        <Placeholder>Toutes les informations légales sont à fournir par l'association</Placeholder>
      </PageSection>
    </PageShell>
  );
}
