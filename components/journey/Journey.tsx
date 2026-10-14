import Image from "next/image";
import { captions, JOURNEY_LENGTH_VH, shots } from "@/content/journey";
import { photos } from "@/content/media";
import { JourneyScene } from "@/components/journey/JourneyScene";
import { JourneyDirector } from "@/components/journey/JourneyDirector";
import { VideoLayer } from "@/components/journey/VideoLayer";
import { FlashlightTextReveal } from "@/components/ui/flashlight-text-reveal";
import { brand } from "@/lib/brand";

/** Les étapes affichées dans l'index de chapitres (à gauche). */
const chapters = [
  { label: "France", at: 0 },
  { label: "Afrique", at: 0.2 },
  { label: "Sénégal", at: 0.4 },
  { label: "For Hope", at: 0.94 },
];

/**
 * Le voyage : une piste de scroll (native) dont la progression pilote la
 * caméra drone. Les repères typographiques, l'altitude et l'arrivée sur la
 * première photographie vivent dans un plan collant (sticky) au-dessus du
 * canvas. Tout le texte est du HTML accessible.
 */
const LINES = ["Seul on va plus vite,", "ensemble on va plus", "loin."];

export function Journey() {
  // La photo du roll-up officiel « Redonnons un sourire aux enfants ».
  const arrival = photos.sourirePortrait;
  return (
    <section id="voyage" className="journey" style={{ ["--len" as string]: `${JOURNEY_LENGTH_VH}svh` }} aria-label="Le voyage vers For Hope">
      <JourneyScene />
      <div className="journey__stage">
        <div className="journey__fallback" aria-hidden="true" />

        {/* Titrage d'ouverture, dans le noir à gauche de la Terre : une inscription sur un mur sombre, révélée par un faisceau doré ; au défilement, les lignes basculent une à une comme les volets d'un tableau mécanique. */}
        <FlashlightTextReveal
          as="p"
          text={LINES}
          className="journey__title"
          lineClassName="journey__title-line"
          wordClassName="journey__title-letter"
          lightColor={brand.goldMid}
        />

        <div className="journey__intro" data-window="-1,-0.5,0.035,0.07">
          <p className="journey__eyebrow">For Hope Association</p>
          <p className="journey__cue">
            <span>Scroller</span>
            <span className="journey__cue-line" aria-hidden="true" />
          </p>
        </div>

        <ol className="journey__captions">
          {captions.map((c) => (
            <li key={c.id} className={`journey__caption journey__caption--${c.id}`} data-window={`${c.from},${c.from + 0.035},${c.to - 0.035},${c.to}`}>
              <span className="journey__caption-title">{c.title}</span>
              {c.meta && <span className="journey__caption-meta">{c.meta}</span>}
            </li>
          ))}
        </ol>

        <div className="journey__hud" aria-hidden="true">
          <ol className="journey__chapters">
            {chapters.map((c) => (
              <li key={c.label} data-chapter={c.at}>
                {c.label}
              </li>
            ))}
          </ol>
          <p className="journey__altitude">
            <span>Altitude</span> <strong data-altitude>{Math.round(shots[0].camera.alt * 6371).toLocaleString("fr-FR")}</strong> km
          </p>
        </div>

        <VideoLayer />
        <div className="journey__whiteout" aria-hidden="true" />

        {/* Arrivée : la première image du monde réel. */}
        <div className="journey__arrival">
          <div className="journey__photo">
            <Image src={arrival.src} alt={arrival.alt} fill sizes="100vw" />
          </div>
          <div className="journey__arrival-copy">
            <Image className="journey__logo" src="/brand/forhope-logo-blanc.png" alt="For Hope Association" width={1276} height={373} sizes="200px" />
            <h1 className="journey__headline">Redonnons un sourire aux enfants.</h1>
          </div>
        </div>
      </div>
      <JourneyDirector />
    </section>
  );
}
