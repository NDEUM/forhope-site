"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { experience, onReady } from "@/lib/experience-store";
import { scrollTopFor } from "@/components/story/ScrollDirector";

/**
 * Premier écran : quand le chargement se lève, la lumière s'ouvre dans le
 * béton (experience.intro, lu par la caméra et l'exposition) et la souris
 * fait respirer le cadre. Le bouton « Commencer la visite » descend
 * doucement jusqu'au premier espace.
 */
export function HeroDirector() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let tween: gsap.core.Tween | undefined;
    const stop = onReady(() => {
      if (reduced) {
        experience.intro = 1;
        return;
      }
      tween = gsap.to(experience, { intro: 1, duration: 3.6, ease: "power2.inOut", delay: 0.2 });
    });

    const fine = window.matchMedia("(pointer: fine)").matches;
    const onMove = (e: PointerEvent) => {
      experience.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      experience.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (fine && !reduced) window.addEventListener("pointermove", onMove, { passive: true });

    const start = document.querySelector<HTMLAnchorElement>("[data-hero-start]");
    const onStart = (e: MouseEvent) => {
      e.preventDefault();
      window.scrollTo({ top: scrollTopFor(0.05), behavior: reduced ? "auto" : "smooth" });
    };
    start?.addEventListener("click", onStart);

    // Une fois le hero effacé, ses boutons invisibles ne doivent plus capter de clic.
    const root = document.documentElement;
    const onScroll = () => root.classList.toggle("hero-gone", window.scrollY > window.innerHeight * 0.4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      stop();
      tween?.kill();
      window.removeEventListener("pointermove", onMove);
      start?.removeEventListener("click", onStart);
      window.removeEventListener("scroll", onScroll);
      root.classList.remove("hero-gone");
    };
  }, []);

  return null;
}
