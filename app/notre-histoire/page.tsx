import type { Metadata } from "next";
import Image from "next/image";
import { PageSection, PageShell } from "@/components/ui/PageShell";
import { photos } from "@/content/media";
import { PageLinks } from "@/components/ui/PageLinks";

export const metadata: Metadata = {
  title: "Notre histoire",
  description: "For Hope Association : notre histoire, nos missions, nos domaines d'action et notre identité.",
};

export default function StoryPage() {
  const photo = photos.benevolesEquipe;
  return (
    <PageShell
      number="01"
      eyebrow="Notre histoire"
      title="Une association tournée vers les autres."
      intro="For Hope rassemble des bénévoles engagés pour redonner un sourire aux enfants."
      photo="benevolesEquipe"
    >
      <PageSection title="Qui sommes-nous ?">
        <p>
          For Hope est une association à but non lucratif créée en <strong>avril 2021</strong>, qui a pour ambition d&apos;aider les
          personnes dans le besoin à court, moyen et long terme.
        </p>
        <p>
          Portée par une poignée de fondateurs et un ambassadeur, <strong>Idrissa Gana Gueye</strong>, qui a toujours œuvré pour les
          personnes démunies, l&apos;association multiplie ses champs d&apos;action : alimentation, éducation, santé, développement durable
          et environnement.
        </p>
        <p>
          For Hope intervient en France et en Afrique dans un premier temps, avant de se développer dans le monde entier avec le soutien de
          ses partenaires, bénévoles et donateurs.
        </p>
        <p className="pj-source">Source : Rapport d&apos;activités For Hope 2025.</p>
      </PageSection>
      <PageSection title="Pour aller plus loin">
        <PageLinks
          links={[
            { href: "/notre-histoire/nos-missions", label: "Nos missions", text: "Ce qui nous engage auprès des enfants." },
            { href: "/notre-histoire/domaines-d-action", label: "Domaines d'action", text: "Agir, accompagner, soutenir, rassembler." },
          ]}
        />
      </PageSection>
      <figure className="page-figure" data-reveal data-parallax>
        <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="(max-width: 900px) 100vw, 900px" />
      </figure>
      <PageSection title="Ce que dit notre identité">
        <p>
          <strong>Une identité forte.</strong> Le globe terrestre, dans le « o » de « For », symbolise les
          différentes causes dans le monde et le rayonnement des actions, ainsi que la diversité de celles et
          ceux qui font l'association.
        </p>
        <p>
          <strong>Une identité humaine.</strong> Des courbes et une typographie singulière qui évoquent la
          stabilité, le dynamisme, et surtout la douceur, la bienveillance et le sens de l'action.
        </p>
        <p>
          <strong>Une identité colorée.</strong> Des bleus qui portent des valeurs de paix, d'entraide,
          d'espoir et de stabilité, en dégradé du « For » vers le « Hope », projeté vers l'avenir.
        </p>
        <p>
          <strong>L'infini.</strong> Une démarche tournée vers les autres et les personnes dans le besoin,
          portée par le dévouement sans limites des membres et des bénévoles.
        </p>
      </PageSection>
    </PageShell>
  );
}
