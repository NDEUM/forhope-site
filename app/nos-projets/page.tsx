import type { Metadata } from "next";
import Image from "next/image";
import { PageSection, PageShell } from "@/components/ui/PageShell";
import { PageLinks } from "@/components/ui/PageLinks";
import { galas, keyFigures, projects, statusLabel, type Project } from "@/content/projects";

export const metadata: Metadata = {
  title: "Nos projets",
  description: "Les projets de For Hope Association : santé, éducation, accès à l'eau, énergie solaire, environnement, au Sénégal et en Afrique.",
};

function ProjectCard({ p }: { p: Project }) {
  return (
    <article className="pj" data-reveal>
      {p.photo && (
        <div className="pj__media">
          <Image src={p.photo.src} alt={p.photo.alt} fill sizes="(max-width: 900px) 100vw, 50vw" />
        </div>
      )}
      <div className="pj__body">
        <p className="pj__meta">
          <span className="pj__status">{statusLabel[p.status]}</span>
          <span>{p.domain}</span>
        </p>
        <h3 className="pj__title">{p.title}</h3>
        {(p.place || p.date) && <p className="pj__where">{[p.place, p.date].filter(Boolean).join(" · ")}</p>}
        <p className="pj__text">{p.summary}</p>
        {p.points && (
          <ul className="pj__points">
            {p.points.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        )}
        {p.figures && (
          <dl className="pj__figures">
            {p.figures.map((f) => (
              <div key={f.label}>
                <dt>{f.value}</dt>
                <dd>{f.label}</dd>
              </div>
            ))}
          </dl>
        )}
        {p.partners && <p className="pj__partners">{p.partners}</p>}
      </div>
    </article>
  );
}

export default function ProjectsPage() {
  const done = projects.filter((p) => p.status === "acheve");
  const ongoing = projects.filter((p) => p.status === "programme");
  const next = projects.filter((p) => p.status === "a-venir");
  return (
    <PageShell
      number="02"
      eyebrow="Nos projets"
      title="Des projets concrets, au Sénégal et en Afrique."
      intro="Santé, éducation, accès à l'eau, énergie solaire, environnement : depuis avril 2021, For Hope agit avec ses bénévoles, ses partenaires et ses donateurs."
      photo="benevolesEquipe"
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

      <PageSection title="Projets achevés">
        <div className="pj-grid">
          {done.map((p) => (
            <ProjectCard key={p.id} p={p} />
          ))}
        </div>
      </PageSection>

      <PageSection title="Nos programmes">
        <div className="pj-grid">
          {ongoing.map((p) => (
            <ProjectCard key={p.id} p={p} />
          ))}
        </div>
      </PageSection>

      <PageSection title="Grands événements">
        <ul className="pj-galas">
          {galas.map((g) => (
            <li key={g.title + g.date} className="pj-gala" data-reveal>
              {g.photo ? (
                <div className="pj-gala__media">
                  <Image src={g.photo.src} alt={g.photo.alt} fill sizes="(max-width: 900px) 100vw, 33vw" />
                </div>
              ) : (
                <div className="pj-gala__media pj-gala__media--empty" aria-hidden="true" />
              )}
              <p className="pj-gala__title">{g.title}</p>
              <p className="pj-gala__meta">
                {g.place} · {g.date}
              </p>
            </li>
          ))}
        </ul>
      </PageSection>

      <PageSection title="Projets à venir">
        <div className="pj-grid pj-grid--compact">
          {next.map((p) => (
            <ProjectCard key={p.id} p={p} />
          ))}
        </div>
      </PageSection>

      <PageSection title="Pour aller plus loin">
        <PageLinks
          links={[
            { href: "/nos-projets/impact", label: "Impact", text: "Nos indicateurs, année après année." },
            { href: "/nos-projets/temoignages", label: "Témoignages", text: "Le mot du Président et de notre ambassadeur." },
          ]}
        />
      </PageSection>
    </PageShell>
  );
}
