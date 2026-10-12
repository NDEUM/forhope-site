import type { Metadata } from "next";
import { PageSection, PageShell } from "@/components/ui/PageShell";
import { Placeholder } from "@/components/ui/Placeholder";
import { PageLinks } from "@/components/ui/PageLinks";

export const metadata: Metadata = {
  title: "Actualités",
  description: "Les actualités de For Hope Association.",
};

export default function NewsPage() {
  return (
    <PageShell number="03" eyebrow="Actualités" title="La vie de l'association." intro="Ce qui se passe chez For Hope : actions, rencontres, campagnes." photo="enfantsGroupe">
      <PageSection title="Dernières nouvelles">
        <p>Aucune actualité n&apos;est encore publiée.</p>
        <Placeholder>Articles d&apos;actualité à fournir (titre, date, texte, photo)</Placeholder>
      </PageSection>
      <PageSection title="À découvrir">
        <PageLinks
          links={[
            { href: "/actualites/galerie", label: "Galerie", text: "Les images de l'association." },
            { href: "/actualites/ambassadeurs", label: "Ambassadeurs", text: "Celles et ceux qui portent notre voix." },
            { href: "/actualites/faq", label: "FAQ", text: "Les réponses aux questions fréquentes." },
          ]}
        />
      </PageSection>
    </PageShell>
  );
}
