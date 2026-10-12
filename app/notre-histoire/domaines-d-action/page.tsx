import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/ui/PageShell";
import { DOMAINS } from "@/content/domains";

export const metadata: Metadata = {
  title: "Domaines d'action",
  description: "Les domaines d'intervention de For Hope : éducation, santé, environnement, alimentation, développement durable.",
};

/** Une réalisation documentée par domaine (photos du Rapport d'activités 2025). */
const examples = [
  { photo: "/media/projets/bibliotheque-numerique.jpg", alt: "Bibliothèque numérique de Cambérène", example: "Bibliothèque numérique de Cambérène, 500 bourses d'études" },
  { photo: "/media/projets/espace-jeunes.jpg", alt: "Espace des jeunes de l'hôpital Fann", example: "Espace des jeunes PVVIH à Dakar, maternité de Gate Gallo, maison des parents à Sangalkam" },
  { photo: "/media/projets/ecolo-culture.jpg", alt: "Élèves du programme ECOLO", example: "Programme ECOLO d'éducation environnementale avec Senvie" },
  { photo: "/media/photos/benevole-pouponniere.jpg", alt: "Un bénévole For Hope dans une pouponnière", example: "Parrainage des pouponnières et orphelinats du Sénégal" },
  { photo: "/media/projets/puits-solaire.jpg", alt: "Puits solaire construit au Sénégal", example: "15 puits dans 15 villages, électrification solaire de Nguélou" },
];

export default function DomainsPage() {
  return (
    <PageShell
      number="01.2"
      eyebrow="Domaines d'action"
      title="Agir, concrètement."
      intro="Cinq domaines d'intervention, en France et en Afrique, dans le respect des Objectifs de développement durable de l'ONU."
      photo="benevoleEnfants"
    >
      <ol className="action-list">
        {DOMAINS.map((d, i) => {
          const ex = examples[i];
          return (
            <li key={d.title} className="action-row" data-reveal>
              <div className="action-row__media" data-parallax>
                <Image src={ex.photo} alt={ex.alt} width={1200} height={800} sizes="(max-width: 900px) 100vw, 50vw" />
              </div>
              <div className="action-row__text">
                <p className="eyebrow">{String(i + 1).padStart(2, "0")}</p>
                <h2>{d.title}</h2>
                <p>{d.text}</p>
                <p className="pj-source">Exemples : {ex.example}.</p>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="pj-source">
        Source : Rapport d&apos;activités For Hope 2025. <Link href="/nos-projets">Voir tous nos projets</Link>
      </p>
    </PageShell>
  );
}
