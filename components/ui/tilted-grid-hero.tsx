"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export interface TiltedGridItem {
  src: string;
  alt: string;
  /** Point de cadrage (object-position), ex. "50% 30%". */
  focus?: string;
}

interface Row {
  items: TiltedGridItem[];
  /** Sens de défilement : 1 vers la gauche, -1 vers la droite. */
  direction: 1 | -1;
}

/**
 * TiltedGridHero — adaptation pour For Hope (Next.js App Router, CSS du projet,
 * sans Tailwind ni dépendance ajoutée) du principe du composant 21st.dev :
 * des rangées d'images qui défilent en continu sur une surface incurvée en 3D
 * (cylindre vu de l'intérieur), avec un fondu sur les côtés.
 *
 * - Les cartes sont placées à chaque frame par transform (GPU), sans reflow.
 * - ResizeObserver recalcule tailles et courbure ; IntersectionObserver met
 *   l'animation en pause hors écran ; onglet masqué = pause.
 * - prefers-reduced-motion : composition incurvée fixe, sans défilement.
 */
export function TiltedGridHero({
  rows,
  speed = 34,
  curve = 0.62,
  className,
}: {
  rows: Row[];
  /** Vitesse (px/s). */
  speed?: number;
  /** Courbure : angle maximal (radians) atteint au bord de l'écran. */
  curve?: number;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rowEls = Array.from(el.querySelectorAll<HTMLElement>("[data-tgh-row]"));
    const state = rowEls.map((row) => ({
      row,
      cards: Array.from(row.querySelectorAll<HTMLElement>("[data-tgh-card]")),
      dir: Number(row.dataset.dir) as 1 | -1,
      offset: 0,
    }));
    let width = 0;
    let cardW = 0;
    let gap = 0;
    let radius = 1;
    let visible = false;
    let raf = 0;
    let last = performance.now();
    let slow = 1;
    let target = 1;

    const measure = () => {
      width = el.clientWidth;
      const first = state[0]?.cards[0];
      cardW = first ? first.offsetWidth : 300;
      gap = Math.max(12, cardW * 0.07);
      // Rayon tel que le bord de l'écran corresponde à l'angle maximal choisi.
      radius = width / 2 / Math.max(0.2, curve);
    };

    const place = () => {
      for (const s of state) {
        const step = cardW + gap;
        const total = step * s.cards.length;
        s.cards.forEach((card, i) => {
          // Position le long de la bande (boucle), centrée sur l'écran.
          let x = (i * step - s.offset * s.dir) % total;
          if (x < 0) x += total;
          x -= total / 2 - step / 2;
          // Enroulement sur le cylindre : x devient un angle.
          const theta = x / radius;
          const px = Math.sin(theta) * radius;
          const pz = (1 - Math.cos(theta)) * radius * 0.55;
          const hidden = Math.abs(theta) > 1.45;
          card.style.transform = `translate3d(${px.toFixed(1)}px, 0, ${pz.toFixed(1)}px) rotateY(${(-theta * 0.9).toFixed(4)}rad)`;
          card.style.visibility = hidden ? "hidden" : "visible";
          // Les bords s'assombrissent légèrement (profondeur), le centre reste net.
          card.style.setProperty("--edge", Math.min(1, Math.abs(theta) / curve).toFixed(3));
        });
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      slow += (target - slow) * Math.min(1, dt * 4);
      for (const s of state) s.offset += speed * slow * dt;
      place();
    };

    const start = () => {
      if (raf || reduced) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const ro = new ResizeObserver(() => {
      measure();
      place();
    });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !document.hidden) start();
      else stop();
    });
    io.observe(el);
    const onVisibility = () => (document.hidden ? stop() : visible && start());
    document.addEventListener("visibilitychange", onVisibility);
    // Au survol, le défilement ralentit pour laisser regarder une photo.
    const onEnter = () => (target = 0.25);
    const onLeave = () => (target = 1);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);

    // Décalage initial différent par rangée : les photos ne s'alignent pas.
    state.forEach((s, i) => (s.offset = i * 170));
    measure();
    place();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [speed, curve]);

  return (
    <div ref={root} className={["tgh", className].filter(Boolean).join(" ")}>
      <div className="tgh__stage">
        {rows.map((row, r) => (
          <div key={r} className="tgh__row" data-tgh-row data-dir={row.direction}>
            {row.items.map((item, i) => (
              <figure key={`${item.src}-${i}`} className="tgh__card" data-tgh-card>
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 700px) 62vw, (max-width: 1200px) 34vw, 440px"
                  style={{ objectPosition: item.focus ?? "50% 35%" }}
                  draggable={false}
                  // Toutes les cartes passent à l'écran : chargées d'avance (priorité basse)
                  // pour qu'aucune photo n'apparaisse brutalement pendant le défilement.
                  loading="eager"
                  fetchPriority="low"
                />
              </figure>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
