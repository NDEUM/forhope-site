"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Mouvement des pages éditoriales (même langage que l'accueil, plus sobre) :
 *  - titre du bandeau révélé mot à mot ;
 *  - [data-reveal] : apparition groupée à l'entrée dans l'écran (ScrollTrigger.batch) ;
 *  - [data-parallax] : légère parallaxe des photos, liée au scroll.
 * Tout est désactivé en mouvement réduit (gsap.matchMedia) et nettoyé au changement de page.
 */
export function PageMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const scope = document.querySelector<HTMLElement>(".page");
    if (!scope) return;
    const mm = gsap.matchMedia(scope);

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const title = scope.querySelector(".page-hero .title");
      if (title) {
        const split = SplitText.create(title, { type: "words", aria: "auto" });
        gsap.from(split.words, {
          opacity: 0,
          yPercent: 50,
          filter: "blur(10px)",
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.06,
          delay: 0.15,
        });
      }
      gsap.from(".page-hero .eyebrow, .page-hero .lede", {
        opacity: 0,
        y: 16,
        duration: 1,
        ease: "expo.out",
        stagger: 0.12,
        delay: 0.35,
      });

      gsap.set("[data-reveal]", { opacity: 0, y: 28, filter: "blur(6px)" });
      ScrollTrigger.batch("[data-reveal]", {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "expo.out", stagger: 0.12, overwrite: true }),
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((media) => {
        const img = media.querySelector("img");
        if (!img) return;
        gsap.fromTo(
          img,
          { yPercent: -6, scale: 1.12 },
          { yPercent: 6, scale: 1.12, ease: "none", scrollTrigger: { trigger: media, start: "top bottom", end: "bottom top", scrub: true } },
        );
      });

      // Les images peuvent changer la hauteur de la page : on recalcule une fois chargées.
      const onLoad = () => ScrollTrigger.refresh();
      window.addEventListener("load", onLoad);
      return () => window.removeEventListener("load", onLoad);
    });

    return () => mm.revert();
  }, [pathname]);

  return null;
}
