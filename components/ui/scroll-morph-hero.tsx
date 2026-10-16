"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * ScrollMorphHero — une collection de photos qui se transforme au fil du
 * défilement : dispersée, puis alignée, puis en cercle, puis posée en arc.
 *
 * Défilement 100 % natif : la section est haute, le plan reste collant
 * (sticky) et la progression se lit dans sa position. Aucune capture de la
 * molette ni des gestes tactiles, aucun scroll-jacking.
 *
 * - Survol (souris uniquement) : la carte se retourne et montre sa légende.
 * - prefers-reduced-motion : composition statique, sans animation.
 * - La boucle ne tourne que lorsque la section est à l'écran.
 */

export interface MorphPhoto {
  src: string;
  alt: string;
}

export interface ScrollMorphHeroProps {
  photos: MorphPhoto[];
  /** Nombre de cartes sur petit écran. */
  mobileCount?: number;
  /** Texte d'invitation au début de la séquence. */
  hint?: string;
  /** Titre central (pendant le cercle). */
  title: string;
  titleId?: string;
  /** Contenu révélé quand l'arc est formé (sur-titre, texte, liens…). */
  children?: React.ReactNode;
  /** Logo affiché au dos des cartes. */
  backLogo?: string;
  className?: string;
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Interpolation d'angle (degrés) par le plus court chemin. */
const lerpAngle = (a: number, b: number, t: number) => a + ((((b - a) % 360) + 540) % 360 - 180) * t;

/** Pseudo-aléatoire déterministe : même dispersion à chaque visite. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function ScrollMorphHero({ photos, mobileCount = 12, hint, title, titleId, children, backLogo, className = "" }: ScrollMorphHeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!root || !track || !stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("smh--static");
      return;
    }

    const cards = Array.from(stage.querySelectorAll<HTMLElement>("[data-smh-card]"));
    const rand = seeded(7);
    const scatter = cards.map(() => ({ x: rand() * 2 - 1, y: rand() * 2 - 1, r: (rand() * 2 - 1) * 28, s: 0.7 + rand() * 0.35 }));

    let W = 0;
    let H = 0;
    let mobile = false;
    let count = cards.length;
    const measure = () => {
      W = stage.clientWidth;
      H = stage.clientHeight;
      mobile = W < 720;
      count = mobile ? Math.min(mobileCount, cards.length) : cards.length;
      cards.forEach((c, i) => (c.style.display = i < count ? "" : "none"));
      const cw = mobile ? Math.min(W * 0.2, 96) : Math.min(Math.max(W * 0.075, 82), 138);
      stage.style.setProperty("--smh-w", `${cw.toFixed(0)}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);

    // parallaxe douce de l'arc au mouvement de la souris (ordinateur)
    let mx = 0;
    let smx = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") mx = (e.clientX / window.innerWidth) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let target = 0;
    let p = 0;
    let raf = 0;
    let visible = false;
    let last = -1;

    const read = () => {
      const r = track.getBoundingClientRect();
      const span = Math.max(1, r.height - window.innerHeight);
      target = clamp01(-r.top / span);
    };

    const layout = () => {
      const cw = parseFloat(stage.style.getPropertyValue("--smh-w")) || 100;
      const n = count;
      // phases
      const tLine = easeInOut(smooth(0.0, 0.2, p));
      const tCircle = easeInOut(smooth(0.22, 0.42, p));
      const tArc = easeInOut(smooth(0.56, 0.8, p));
      const spin = smooth(0.3, 0.62, p) * 50; // le cercle tourne lentement
      const sweep = (smooth(0.8, 1, p) - 0.5) * (mobile ? 18 : 26) + smx * 6; // l'arc glisse

      const gap = Math.min(cw * 0.62, (W * 0.92) / n);
      const R = Math.min(W, H) * (mobile ? 0.34 : 0.3);
      const Rarc = mobile ? Math.max(W * 1.15, H * 0.62) : Math.max(W * 0.62, H * 1.05);
      const arcSpan = mobile ? 64 : 96;
      const apex = H * (mobile ? 0.14 : 0.1);
      const cy = apex + Rarc;

      for (let i = 0; i < n; i++) {
        const c = cards[i];
        const sc = scatter[i];
        // 1. dispersion
        const x0 = sc.x * W * 0.44;
        const y0 = sc.y * H * 0.4;
        // 2. ligne
        const x1 = (i - (n - 1) / 2) * gap;
        const y1 = 0;
        // 3. cercle
        const a = (i / n) * 360 - 90 + spin;
        const ar = (a * Math.PI) / 180;
        const x2 = R * Math.cos(ar);
        const y2 = R * Math.sin(ar);
        // 4. arc
        const th = -90 - arcSpan / 2 + (i / Math.max(1, n - 1)) * arcSpan + sweep;
        const tr = (th * Math.PI) / 180;
        const x3 = Rarc * Math.cos(tr);
        const y3 = cy + Rarc * Math.sin(tr);

        let x = lerp(x0, x1, tLine);
        let y = lerp(y0, y1, tLine);
        let rot = lerp(sc.r, 0, tLine);
        let s = lerp(sc.s, 0.92, tLine);
        x = lerp(x, x2, tCircle);
        y = lerp(y, y2, tCircle);
        rot = lerpAngle(rot, a + 90, tCircle);
        s = lerp(s, 0.88, tCircle);
        x = lerp(x, x3, tArc);
        y = lerp(y, y3, tArc);
        rot = lerpAngle(rot, th + 90, tArc);
        s = lerp(s, 1, tArc);

        // présentes dès l'arrivée, plus nettes en avançant
        const o = 0.35 + 0.65 * smooth(0, 0.08, p);
        c.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${s.toFixed(3)})`;
        c.style.opacity = o.toFixed(3);
        c.style.zIndex = String(tArc > 0.5 ? 10 + Math.round(20 - Math.abs(i - (n - 1) / 2)) : i);
      }

      root.style.setProperty("--smh-hint", (1 - smooth(0.02, 0.12, p)).toFixed(3));
      root.style.setProperty("--smh-title", (smooth(0.26, 0.4, p) * (1 - smooth(0.6, 0.72, p))).toFixed(3));
      root.style.setProperty("--smh-copy", smooth(0.74, 0.88, p).toFixed(3));
    };

    const frame = () => {
      raf = 0;
      read();
      p += (target - p) * 0.12;
      smx += (mx - smx) * 0.05;
      if (Math.abs(target - p) < 0.0004) p = target;
      if (Math.abs(p - last) > 0.00005 || Math.abs(mx - smx) > 0.002) {
        last = p;
        layout();
      }
      if (visible) raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(root);

    read();
    p = target;
    layout();
    root.classList.add("smh--ready");

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [mobileCount, photos.length]);

  return (
    <section ref={rootRef} className={`smh ${className}`} aria-labelledby={titleId}>
      {/* fondus d'entrée et de sortie, hors de la partie animée */}
      <div className="smh-fade smh-fade--in" aria-hidden="true" />
      <div ref={trackRef} className="smh-track">
      <div ref={stageRef} className="smh-stage">
        {hint ? (
          <p className="smh-hint" aria-hidden="true">
            {hint}
            <span className="smh-hint__line" />
          </p>
        ) : null}
        <h2 id={titleId} className="smh-title">
          {title}
        </h2>

        <ul className="smh-cards">
          {photos.map((ph, i) => (
            <li key={ph.src} className="smh-card" data-smh-card style={{ ["--i" as string]: i }}>
              <div className="smh-card__inner">
                <div className="smh-card__face smh-card__front">
                  <Image src={ph.src} alt={ph.alt} fill sizes="160px" draggable={false} />
                </div>
                <div className="smh-card__face smh-card__back" aria-hidden="true">
                  {backLogo ? <Image className="smh-card__logo" src={backLogo} alt="" width={120} height={35} /> : null}
                  <p>{ph.alt}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {children ? <div className="smh-copy">{children}</div> : null}
      </div>
      </div>
      <div className="smh-fade smh-fade--out" aria-hidden="true" />
    </section>
  );
}
