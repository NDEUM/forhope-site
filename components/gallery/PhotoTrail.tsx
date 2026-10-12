"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { photos } from "@/content/media";

const ALL = Object.values(photos);
/** Réserve d'images réutilisées en boucle (2 jeux = traînée plus dense). */
const POOL = [...ALL, ...ALL];

/**
 * Traînée d'images sous la souris (technique du skill « Site Immersif ») :
 * chaque déplacement du curseur dépose la photo suivante à sa position ;
 * elle surgit, reste un instant, puis s'efface. Au clavier, les flèches
 * déplacent un curseur virtuel et déposent les photos de la même façon ;
 * au toucher, glisser le doigt fait de même.
 */
export function PhotoTrail({
  eyebrow = "For Hope en images",
  title = "Galerie",
  titleAs: Title = "h1",
  lede,
  className,
  titleId,
}: {
  eyebrow?: string;
  title?: string;
  titleAs?: "h1" | "h2";
  lede?: string;
  className?: string;
  titleId?: string;
}) {
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const imgs = Array.from(el.querySelectorAll<HTMLElement>(".trail__img"));
    let idx = 0;
    let z = 10;
    let acc = 0;
    let lastX: number | null = null;
    let lastY: number | null = null;
    const hint = el.querySelector<HTMLElement>(".trail__hint");

    const spawn = (x: number, y: number) => {
      const img = imgs[idx % imgs.length];
      idx++;
      const rot = ((idx * 47) % 17) - 8;
      img.style.zIndex = String(++z);
      img.getAnimations().forEach((a) => a.cancel());
      const at = (s: number) => `translate(${x.toFixed(0)}px, ${y.toFixed(0)}px) translate(-50%, -50%) rotate(${rot}deg) scale(${s})`;
      img.animate(
        [
          { opacity: 0, transform: at(0.5) },
          { opacity: 1, transform: at(1), offset: 0.14 },
          { opacity: 1, transform: at(1), offset: 0.72 },
          { opacity: 0, transform: at(0.94) },
        ],
        { duration: 3600, easing: "cubic-bezier(0.19, 1, 0.22, 1)", fill: "forwards" },
      );
      if (hint) hint.classList.add("is-hidden");
    };

    // Souris et doigt : une photo tous les ~60 px parcourus.
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (lastX === null || lastY === null) {
        lastX = x;
        lastY = y;
        return;
      }
      acc += Math.hypot(x - lastX, y - lastY);
      lastX = x;
      lastY = y;
      if (acc < (e.pointerType === "mouse" ? 60 : 40)) return;
      acc = 0;
      spawn(x, y);
    };
    const onLeave = () => {
      lastX = lastY = null;
    };

    // Clavier : flèches = déplacer, Entrée/Espace = déposer une photo.
    let kx = el.clientWidth / 2;
    let ky = el.clientHeight / 2;
    const onKey = (e: KeyboardEvent) => {
      const step = 70;
      const keys: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      if (keys[e.key]) {
        e.preventDefault();
        kx = Math.min(el.clientWidth - 60, Math.max(60, kx + keys[e.key][0]));
        ky = Math.min(el.clientHeight - 60, Math.max(60, ky + keys[e.key][1]));
        spawn(kx, ky);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        spawn(60 + Math.random() * (el.clientWidth - 120), 60 + Math.random() * (el.clientHeight - 120));
      }
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      ref={stage}
      className={["trail", className].filter(Boolean).join(" ")}
      tabIndex={0}
      role="application"
      aria-label="Galerie interactive : déplacez la souris, glissez le doigt ou utilisez les flèches du clavier pour faire apparaître les photos de l'association"
    >
      <div className="trail__copy">
        <p className="trail__eyebrow">{eyebrow}</p>
        <Title id={titleId} className="trail__title">{title}</Title>
        {lede && <p className="trail__lede">{lede}</p>}
        <p className="trail__hint">
          <span className="trail__hint-mouse">Déplacez la souris</span>
          <span className="trail__hint-touch">Glissez le doigt</span> pour faire apparaître nos photos
        </p>
      </div>
      <div className="trail__layer" aria-hidden="true">
        {POOL.map((p, i) => (
          <div key={i} className={`trail__img${i % 3 === 1 ? " trail__img--tall" : ""}`}>
            <Image src={p.src} alt="" fill sizes="280px" loading="eager" fetchPriority="low" draggable={false} />
          </div>
        ))}
      </div>
    </div>
  );
}
