"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { isReady, markReady } from "@/lib/experience-store";

/** Durée minimale d'affichage (évite un flash) et plafond (ne bloque jamais). */
const MIN_MS = 900;
const MAX_MS = 7000;

/**
 * Écran de chargement honnête : la ligne avance selon ce qui est réellement
 * prêt (polices, monde 3D, vidéo d'ouverture), puis le voile se lève.
 */
export function Preloader() {
  const [leaving, setLeaving] = useState(false);
  // Retour sur l'accueil pendant la même visite : pas de second chargement.
  const [gone, setGone] = useState(() => typeof window !== "undefined" && isReady());
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isReady()) return;
    const start = performance.now();
    const steps = { fonts: false, world: false, video: false };
    let finished = false;

    const render = () => {
      const done = Object.values(steps).filter(Boolean).length / 3;
      if (bar.current) bar.current.style.transform = `scaleX(${0.08 + done * 0.92})`;
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      if (bar.current) bar.current.style.transform = "scaleX(1)";
      const wait = Math.max(0, MIN_MS - (performance.now() - start));
      window.setTimeout(() => {
        setLeaving(true);
        markReady();
        window.setTimeout(() => setGone(true), 1100);
      }, wait);
    };

    const check = () => {
      render();
      if (steps.fonts && steps.world && steps.video) finish();
    };

    document.fonts.ready.then(() => {
      steps.fonts = true;
      check();
    });

    // Le monde 3D signale sa création par la classe « webgl » (ou son absence en repli).
    const worldTimer = window.setInterval(() => {
      if (document.documentElement.classList.contains("webgl") || performance.now() - start > 6000) {
        steps.world = true;
        window.clearInterval(worldTimer);
        check();
      }
    }, 100);

    const video = document.querySelector<HTMLVideoElement>(".intro-video video");
    if (!video || video.readyState >= 3) steps.video = true;
    const onVideo = () => {
      steps.video = true;
      check();
    };
    video?.addEventListener("canplaythrough", onVideo, { once: true });
    video?.addEventListener("error", onVideo, { once: true });

    const cap = window.setTimeout(finish, MAX_MS);
    check();

    return () => {
      window.clearInterval(worldTimer);
      window.clearTimeout(cap);
      video?.removeEventListener("canplaythrough", onVideo);
      video?.removeEventListener("error", onVideo);
    };
  }, []);

  if (gone) return null;

  return (
    <div className={`preloader ${leaving ? "is-leaving" : ""}`} role="status" aria-live="polite">
      <div className="preloader__inner">
        <Image src="/brand/forhope-logo-blanc.png" alt="" width={1276} height={373} priority className="preloader__logo" />
        <span className="preloader__track" aria-hidden="true">
          <span ref={bar} className="preloader__bar" />
        </span>
        <span className="visually-hidden">{leaving ? "Chargé" : "Chargement de l'expérience For Hope"}</span>
      </div>
    </div>
  );
}
