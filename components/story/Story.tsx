import Image from "next/image";
import { scenes, type Step } from "@/content/scenes";
import { photos } from "@/content/media";
import { site } from "@/content/site";
import { ScrollDirector } from "@/components/story/ScrollDirector";
import { HeroDirector } from "@/components/story/HeroDirector";
import { Placeholder } from "@/components/ui/Placeholder";
import { ButtonLink } from "@/components/ui/ButtonLink";

const SLATS = 12;

/**
 * La visite, en HTML accessible : chaque espace du bâtiment est une
 * <section> (piste de scroll) avec ses cartels — courts, discrets, comme
 * les textes muraux d'un musée. Lisible sans 3D ni JavaScript.
 */
export function Story() {
  const end = photos.sourirePortrait;
  return (
    <>
      <main id="contenu" className="story">
        {/* Hero : posé sur la première image du bâtiment, il s'efface au premier scroll. */}
        <header className="hero" aria-labelledby="hero-title">
          <div className="hero__copy">
            <p className="hero__eyebrow">
              <span className="hero__rule" aria-hidden="true" />
              {site.fullName}
            </p>
            <h1 id="hero-title" className="hero__title">
              <span className="hero__line">
                <span>Redonnons un sourire</span>
              </span>
              <span className="hero__line">
                <span>aux enfants.</span>
              </span>
            </h1>
            <p className="hero__lede">
              Une visite en cinq espaces, à travers les rencontres, les actions et les événements de l&apos;association.
            </p>
            <div className="hero__ctas">
              <a href="#espace-rencontre" className="hero__start" data-hero-start>
                <span>Commencer la visite</span>
                <span className="hero__start-line" aria-hidden="true" />
              </a>
              <ButtonLink href="/agir" variant="outline" magnetic>
                Agir
              </ButtonLink>
            </div>
          </div>
          <p className="hero__index" aria-hidden="true">
            <span>00</span> / 05
          </p>
        </header>
        {scenes.map((scene, i) => (
          <section
            key={scene.id}
            id={`espace-${scene.id}`}
            className={`scene scene--${scene.id}`}
            data-scene={i}
            data-stack={scene.stack ? "" : undefined}
            style={{ ["--h" as string]: scene.length }}
            aria-label={`${scene.number} — ${scene.label} (${scene.theme})`}
          >
            <div className="scene-copy">
              {scene.steps.map((step, k) => (
                <StepContent key={k} step={step} start={k === 0 && scene.stepStart !== undefined ? scene.stepStart : undefined} />
              ))}
            </div>
          </section>
        ))}

        {/* Dernière image du film : fond clair, une photographie, le nom. */}
        <section className="endframe" id="appel" aria-labelledby="endframe-title">
          <div className="endframe__inner">
            <Image className="endframe__logo" src="/brand/forhope-logo-bleu.png" alt="For Hope Association" width={1275} height={373} sizes="140px" />
            <h2 id="endframe-title" className="endframe__name">
              <span className="endframe__word">For</span>
              <span className="endframe__photo">
                <Image src={end.src} alt={end.alt} fill sizes="(max-width: 768px) 70vw, 40vw" />
              </span>
              <span className="endframe__word">Hope</span>
            </h2>
            <p className="endframe__line">Chaque rencontre construit un lieu. Construisons-le ensemble.</p>
            <div className="endframe__ctas">
              <ButtonLink href="/agir" variant="solid" magnetic arrow>
                Agir
              </ButtonLink>
              <ButtonLink href={site.donateHref} variant="outline" magnetic>
                Nous soutenir
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>

      {/* Voile des passages entre espaces (piloté par la caméra). */}
      <div className="veil" aria-hidden="true" />
      {/* Rideau de lames : la coupe de montage entre le bâtiment et la dernière image. */}
      <div className="slats" aria-hidden="true">
        {Array.from({ length: SLATS }, (_, i) => (
          <span key={i} />
        ))}
      </div>
      <ScrollDirector />
      <HeroDirector />
    </>
  );
}

function StepContent({ step, start }: { step: Step; start?: number }) {
  const data = { "data-step": "", "data-start": start !== undefined ? String(start) : undefined };

  if (step.kind === "lines") {
    return (
      <div className={`step step--lines`} {...data}>
        {step.number && (
          <p className="cartel__head">
            <span className="cartel__num">{step.number}</span>
            <span className="cartel__title">{step.title}</span>
          </p>
        )}
        {step.lines?.map((line) => (
          <p key={line} className="story-line ink">
            {line}
          </p>
        ))}
        {step.placeholder && <Placeholder>{step.placeholder}</Placeholder>}
      </div>
    );
  }

  return (
    <div className={`step step--${step.kind} cartel`} {...data}>
      <span className="cartel__rule" aria-hidden="true" />
      <p className="cartel__head">
        <span className="cartel__num">{step.number}</span>
        <span className="cartel__title">{step.title}</span>
      </p>
      <p className="cartel__text ink">{step.text}</p>
      {step.kind === "aerial" && (
        <Image className="cartel__logo" src="/brand/forhope-logo-blanc.png" alt="" width={1276} height={373} sizes="110px" />
      )}
    </div>
  );
}
