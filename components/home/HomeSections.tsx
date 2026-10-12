import Image from "next/image";
import Link from "next/link";
import { actions } from "@/content/actions";
import { campaigns } from "@/content/campaigns";
import { photos, type PhotoKey } from "@/content/media";
import { site } from "@/content/site";
import { ambassadors, godparents, initials } from "@/content/people";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { HomeMotion } from "@/components/home/HomeMotion";
import { LetterCarousel } from "@/components/home/LetterCarousel";

/** Projet à la une. `progress` (0–1) n'est affiché que s'il est documenté. */
const featured: { tag: string; title: string; text: string; photo: PhotoKey; href: string; progress?: number } = {
  tag: "Projet à la une",
  title: "Être présents auprès des enfants",
  text: "Des bénévoles For Hope aux côtés des tout-petits, simplement, pour partager un moment et redonner un sourire.",
  photo: "benevoleEnfants",
  href: "/nos-projets",
};

/** Sur l'accueil, chaque domaine d'action garde une image différente. */
const actionPhoto: Record<string, PhotoKey> = {
  agir: "benevolePouponniere",
  accompagner: "benevoleEnfants",
  soutenir: "enfantsForce",
  rassembler: "enfantsGroupe",
};

const moments: PhotoKey[] = ["sourirePortrait", "benevolesEquipe", "enfantsComplices", "enfantSourire", "benevolePouponniere", "enfantsForce", "enfantsGroupe", "benevoleEnfants"];

/** Réseaux présents sur les roll-ups officiels (adresses exactes à fournir dans content/site.ts). */
const socialIcons: Record<string, React.ReactNode> = {
  Instagram: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
    </svg>
  ),
  Facebook: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.6 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.9v3h2.6V21h3.1z" fill="currentColor" />
    </svg>
  ),
  LinkedIn: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.5 9h3v11h-3zM6 3.8a1.8 1.8 0 110 3.6 1.8 1.8 0 010-3.6zM10 9h2.9v1.5h.1c.4-.8 1.4-1.7 3-1.7 3.1 0 3.7 2 3.7 4.7V20h-3v-5.8c0-1.4 0-3.1-1.9-3.1s-2.2 1.5-2.2 3V20h-3z" fill="currentColor" />
    </svg>
  ),
};

/** La vague des roll-ups For Hope : deux lignes bleues qui se dessinent au scroll. */
function Wave({ flip = false }: { flip?: boolean }) {
  return (
    <svg className={`fh-wave${flip ? " fh-wave--flip" : ""}`} viewBox="0 0 1440 160" preserveAspectRatio="none" aria-hidden="true">
      <path className="fh-wave__fill" d="M0 160 L0 120 C 380 150, 820 40, 1440 10 L1440 160 Z" />
      <path className="fh-wave__line fh-wave__line--deep" d="M0 118 C 380 148, 820 38, 1440 8" />
      <path className="fh-wave__line fh-wave__line--light" d="M0 132 C 420 160, 860 62, 1440 34" />
    </svg>
  );
}

function SectionTitle({ sup, title, id, children }: { sup: string; title: string; id: string; children?: React.ReactNode }) {
  return (
    <div className="fh-head">
      <p className="fh-sup" data-fade>
        {sup}
      </p>
      <h2 id={id} className="fh-title" data-split>
        {title}
      </h2>
      {children}
    </div>
  );
}

function CarouselNav({ label }: { label: string }) {
  return (
    <div className="fh-nav">
      <button type="button" className="fh-nav__btn" data-prev aria-label={`${label} : précédent`}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>
      <button type="button" className="fh-nav__btn" data-next aria-label={`${label} : suivant`}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>
    </div>
  );
}

/**
 * La suite de la homepage, après l'arrivée du voyage (inchangé).
 * Structure inspirée de seedcharity.com — projet à la une, carrousels de
 * projets et de publications, ambassadeurs, réseaux — dans la charte
 * For Hope, sur fond clair, avec des transitions marquées.
 */
export function HomeSections() {
  const f = photos[featured.photo];
  return (
    <div className="fh" id="contenu">
      {/* Bascule de la nuit au jour : la vague des roll-ups monte sur la photo. */}
      <div className="fh-transition">
        <Wave />
      </div>

      {/* Carrousel de photos à travers les lettres « FOR HOPE ». */}
      <LetterCarousel />

      {/* Manifeste : les mots s'encrent au fil du scroll. */}
      <section id="association" className="fh-section fh-manifesto" aria-labelledby="manifesto-title">
        <p className="fh-sup" data-fade>
          For Hope Association
        </p>
        <h2 id="manifesto-title" className="fh-manifesto__text" data-ink>
          For Hope rassemble des bénévoles engagés pour redonner un sourire aux enfants. Le globe de notre logo symbolise les
          causes dans le monde et le rayonnement de nos actions.
        </h2>
        <div className="fh-ctas" data-fade>
          <ButtonLink href="/agir" variant="solid" magnetic arrow>
            Je veux aider
          </ButtonLink>
          <ButtonLink href="/notre-histoire" variant="outline" magnetic>
            Notre histoire
          </ButtonLink>
        </div>
      </section>

      {/* Projet à la une : carte partagée image / texte. */}
      <section className="fh-section fh-featured" aria-labelledby="featured-title">
        <article className="fh-featured__card" data-rise>
          <div className="fh-featured__media" data-reveal-img>
            <Image src={f.src} alt={f.alt} fill sizes="(max-width: 900px) 100vw, 55vw" />
            {featured.progress !== undefined && (
              <span className="fh-ring" style={{ ["--p" as string]: featured.progress }}>
                {Math.round(featured.progress * 100)}%
              </span>
            )}
          </div>
          <div className="fh-featured__body">
            <p className="fh-sup">{featured.tag}</p>
            <h2 id="featured-title" className="fh-featured__title" data-split>
              {featured.title}
            </h2>
            <p className="fh-featured__text">{featured.text}</p>
            <div className="fh-featured__actions">
              <ButtonLink href={site.donateHref} variant="solid" magnetic>
                Faire un don
              </ButtonLink>
              <Link className="fh-link" href={featured.href}>
                Voir le projet
              </Link>
            </div>
          </div>
        </article>
        <p className="fh-center" data-fade>
          <Link className="fh-link fh-link--strong" href="/nos-projets">
            Voir nos projets
          </Link>
        </p>
      </section>

      {/* Bandeau typographique qui accélère avec le scroll. */}
      <div className="fh-marquee" aria-hidden="true">
        <div className="fh-marquee__track" data-marquee>
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i}>
              Redonnons un sourire aux enfants <em>·</em> For Hope <em>·</em>{" "}
            </span>
          ))}
        </div>
      </div>

      {/* Action — nos domaines, en carrousel glissable. */}
      <section id="actions" className="fh-section fh-split" aria-labelledby="actions-title" data-carousel>
        <div className="fh-split__intro">
          <SectionTitle sup="Action" title="Nos domaines d'action" id="actions-title">
            <p className="fh-text" data-fade>
              Sur le terrain comme en coulisses, nos bénévoles agissent toute l&apos;année auprès des enfants.
            </p>
          </SectionTitle>
          <div className="fh-split__controls" data-fade>
            <ButtonLink href="/notre-histoire/domaines-d-action" variant="solid" magnetic>
              Voir nos actions
            </ButtonLink>
            <CarouselNav label="Domaines d'action" />
          </div>
        </div>
        <div className="fh-viewport" data-viewport>
          <ul className="fh-track" data-track>
            {actions.map((a) => {
              const p = photos[actionPhoto[a.id] ?? a.photo ?? "benevolesEquipe"];
              return (
                <li key={a.id} className="fh-card" data-card>
                  <div className="fh-card__media">
                    <Image src={p.src} alt={p.alt} fill sizes="(max-width: 700px) 80vw, 360px" draggable={false} />
                  </div>
                  <p className="fh-card__tag">Domaine d&apos;action</p>
                  <div className="fh-card__body">
                    <h3 className="fh-card__title">{a.title}</h3>
                    <p className="fh-card__text">{a.summary}</p>
                    <div className="fh-card__actions">
                      <ButtonLink href={site.donateHref} variant="solid">
                        Faire un don
                      </ButtonLink>
                      <Link className="fh-link" href="/notre-histoire/domaines-d-action">
                        Découvrir
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Publications — nos moments en images. */}
      <section className="fh-section fh-moments" aria-labelledby="moments-title" data-carousel data-sweep>
        <div className="fh-viewport fh-viewport--left" data-viewport>
          <ul className="fh-track" data-track>
            {moments.map((k) => (
              <li key={k} className="fh-moment" data-card>
                <Image src={photos[k].src} alt={photos[k].alt} fill sizes="(max-width: 700px) 60vw, 240px" draggable={false} />
                <span className="fh-moment__caption">{photos[k].alt}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="fh-moments__intro">
          <SectionTitle sup="Publications" title="Nos moments" id="moments-title">
            <p className="fh-text" data-fade>
              Découvrez nos messages d&apos;espoir.
            </p>
          </SectionTitle>
          <div className="fh-split__controls" data-fade>
            <CarouselNav label="Nos moments" />
            <ButtonLink href="/actualites/galerie" variant="solid" magnetic>
              Voir la galerie
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Rassembler — les campagnes. */}
      <section id="evenements" className="fh-section fh-events" aria-labelledby="events-title">
        <SectionTitle sup="Rassembler" title="Nos événements" id="events-title" />
        <ul className="fh-events__grid">
          {campaigns.map((c) => (
            <li key={c.id} className="fh-event" style={{ ["--accent" as string]: c.accent }} data-rise data-tilt>
              <div className="fh-event__logo">
                <Image src={c.logo} alt="" fill sizes="240px" />
              </div>
              <h3 className="fh-event__title">{c.title}</h3>
              <p className="fh-event__text">{c.subtitle}</p>
              <p className="fh-event__date">Dates à venir</p>
            </li>
          ))}
        </ul>
        <p className="fh-center" data-fade>
          <Link className="fh-link fh-link--strong" href="/evenements">
            Voir tous les événements
          </Link>
        </p>
      </section>

      {/* Agir — grand plan photo qui s'ouvre. */}
      <section id="agir" className="fh-act" data-tone-dark aria-labelledby="act-title">
        <div className="fh-act__media" data-zoom>
          <Image src={photos.enfantsForce.src} alt="" fill sizes="100vw" />
        </div>
        <div className="fh-act__copy">
          <p className="fh-sup fh-sup--light" data-fade>
            Agir
          </p>
          <h2 id="act-title" className="fh-act__title" data-split>
            Seul on va plus vite, ensemble on va plus loin.
          </h2>
          <div className="fh-ctas" data-fade>
            <ButtonLink href={site.donateHref} variant="solid" magnetic arrow>
              Nous soutenir
            </ButtonLink>
            <ButtonLink href="/agir#benevole" variant="outline" magnetic>
              Devenir bénévole
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Qui sont-ils ? */}
      <section className="fh-section fh-ambassadors" aria-labelledby="amb-title">
        <SectionTitle sup="Qui sont-ils ?" title="Nos ambassadeurs et parrains" id="amb-title" />
        <ul className="fh-people">
          {[...ambassadors, ...godparents].map((p) => (
            <li key={p.name} className="fh-person" data-rise>
              <span className="fh-person__avatar" aria-hidden="true">
                {initials(p.name)}
              </span>
              <span className="fh-person__name">{p.name}</span>
              <span className="fh-person__role">{p.role}</span>
            </li>
          ))}
        </ul>
        <p className="fh-center" data-fade>
          <Link className="fh-link fh-link--strong" href="/actualites/ambassadeurs">
            Voir nos ambassadeurs
          </Link>
        </p>
      </section>

      {/* Réseaux sociaux */}
      <section id="contact" className="fh-section fh-social" aria-labelledby="social-title" data-sweep>
        <h2 id="social-title" className="fh-title fh-title--center" data-split>
          Nos réseaux sociaux
        </h2>
        <p className="fh-text fh-text--center" data-fade>
          Suivez-nous pour rester informé.
        </p>
        <ul className="fh-social__list">
          {site.socials.map((s) => (
            <li key={s.label} data-rise>
              <a href={s.href} className="fh-social__item" target="_blank" rel="noopener noreferrer">
                <span className="fh-social__icon">{socialIcons[s.label]}</span>
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="fh-center" data-fade>
          <ButtonLink href="/contact" variant="solid" magnetic arrow>
            Nous contacter
          </ButtonLink>
        </div>
      </section>
      <Wave flip />
      <HomeMotion />
    </div>
  );
}
