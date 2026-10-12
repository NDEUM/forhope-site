import Image from "next/image";
import { OUTRO_LENGTH_VH, outroCaptions } from "@/content/journey";
import { site } from "@/content/site";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { OutroDirector } from "@/components/journey/OutroDirector";

/**
 * La sortie, en bas de l'accueil : le miroir du voyage d'ouverture. La
 * caméra traverse les nuages vers le haut, quitte le Sénégal, l'Afrique et
 * la Terre s'éloigne dans l'espace, juste avant le pied de page. La planète
 * est la même scène WebGL que l'ouverture (rendue derrière, en fixe).
 */
export function Outro() {
  return (
    <section id="sortie" className="outro" style={{ ["--len" as string]: `${OUTRO_LENGTH_VH}svh` }} aria-label="Retour vers l'espace">
      <div className="outro__stage">
        <div className="outro__veil" aria-hidden="true" />
        <ol className="journey__captions">
          {outroCaptions.map((c) => (
            <li key={c.id} className={`journey__caption journey__caption--${c.id}`} data-owindow={`${c.from},${c.from + 0.04},${c.to - 0.04},${c.to}`}>
              <span className="journey__caption-title">{c.title}</span>
              {c.meta && <span className="journey__caption-meta">{c.meta}</span>}
            </li>
          ))}
        </ol>
        <p className="outro__altitude" aria-hidden="true" data-owindow="0.04,0.1,0.86,0.92">
          <span>Altitude</span> <strong data-oaltitude>—</strong> km
        </p>
        <div className="outro__end" data-owindow="0.88,0.96,2,3">
          <Image className="outro__logo" src="/brand/forhope-logo-blanc.png" alt="For Hope Association" width={1276} height={373} sizes="180px" />
          <p className="outro__line">Merci d&apos;avoir fait le voyage avec nous.</p>
          <div className="outro__ctas">
            <ButtonLink href={site.donateHref} variant="solid" magnetic arrow>
              Nous soutenir
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline" magnetic>
              Nous contacter
            </ButtonLink>
          </div>
        </div>
      </div>
      <OutroDirector />
    </section>
  );
}
