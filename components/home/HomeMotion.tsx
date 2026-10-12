"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(ScrollTrigger, SplitText, Draggable, InertiaPlugin, DrawSVGPlugin);

/**
 * Mise en mouvement de la suite de la homepage (scroll natif, rien n'est épinglé) :
 *  - en-tête clair/sombre selon la section qu'il survole ;
 *  - vague des roll-ups dessinée au scroll (nuit → jour) ;
 *  - manifeste encré mot à mot ; titres révélés ligne par ligne ;
 *  - images qui s'ouvrent, cartes qui montent, grand plan qui se resserre ;
 *  - carrousels glissables avec inertie et aimantation ;
 *  - bandeau typographique piloté par la vitesse du scroll ;
 *  - cartes d'événements inclinées au survol.
 */
export function HomeMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const fh = document.querySelector<HTMLElement>(".fh");
    if (!fh) return;
    const cleanups: (() => void)[] = [];

    // En-tête : sombre sur fond clair, clair sur les grands plans photo.
    const darkZones = Array.from(fh.querySelectorAll<HTMLElement>("[data-tone-dark]"));
    const tone = () => {
      const probe = 60;
      const r = fh.getBoundingClientRect();
      let light = r.top < probe && r.bottom > probe;
      for (const z of darkZones) {
        const zr = z.getBoundingClientRect();
        if (zr.top < probe && zr.bottom > probe) light = false;
      }
      if (light) root.dataset.tone = "light";
      else if (root.dataset.tone === "light") delete root.dataset.tone;
    };
    window.addEventListener("scroll", tone, { passive: true });
    tone();
    cleanups.push(() => {
      window.removeEventListener("scroll", tone);
      delete root.dataset.tone;
    });

    const mm = gsap.matchMedia();
    mm.add(
      { motion: "(prefers-reduced-motion: no-preference)", fine: "(pointer: fine)" },
      (ctx) => {
        const { motion, fine } = ctx.conditions as { motion: boolean; fine: boolean };

        // Carrousels : utiles même sans animation (boutons + glisser).
        fh.querySelectorAll<HTMLElement>("[data-carousel]").forEach((section) => {
          const viewport = section.querySelector<HTMLElement>("[data-viewport]")!;
          const track = section.querySelector<HTMLElement>("[data-track]")!;
          const cards = Array.from(track.querySelectorAll<HTMLElement>("[data-card]"));
          const snaps = () => {
            const max = Math.max(0, track.scrollWidth - viewport.clientWidth);
            return cards.map((c) => -Math.min(c.offsetLeft - cards[0].offsetLeft, max));
          };
          const [drag] = Draggable.create(track, {
            type: "x",
            inertia: true,
            bounds: viewport,
            edgeResistance: 0.85,
            allowNativeTouchScrolling: true,
            dragClickables: false,
            cursor: "grab",
            activeCursor: "grabbing",
            snap: { x: (v: number) => gsap.utils.snap(snaps(), v) },
          });
          const go = (dir: 1 | -1) => {
            const s = snaps();
            const x = gsap.getProperty(track, "x") as number;
            let i = s.findIndex((v) => v <= x + 1);
            i = gsap.utils.clamp(0, s.length - 1, (i < 0 ? 0 : i) + dir);
            gsap.to(track, { x: s[i], duration: motion ? 0.9 : 0, ease: "expo.out", onUpdate: () => drag.update() });
          };
          const prev = section.querySelector<HTMLButtonElement>("[data-prev]");
          const next = section.querySelector<HTMLButtonElement>("[data-next]");
          const onPrev = () => go(-1);
          const onNext = () => go(1);
          prev?.addEventListener("click", onPrev);
          next?.addEventListener("click", onNext);
          const onResize = () => drag.applyBounds(viewport);
          window.addEventListener("resize", onResize);
          cleanups.push(() => {
            drag.kill();
            prev?.removeEventListener("click", onPrev);
            next?.removeEventListener("click", onNext);
            window.removeEventListener("resize", onResize);
          });

          if (motion) {
            gsap.from(cards, {
              x: 140,
              autoAlpha: 0,
              rotate: 2,
              duration: 1.3,
              ease: "expo.out",
              stagger: 0.09,
              scrollTrigger: { trigger: section, start: "top 75%", toggleActions: "play none none none" },
            });
          }
        });

        if (!motion) return;

        // Nuit → jour : la vague monte et ses deux lignes se dessinent.
        const wave = fh.querySelector(".fh-transition .fh-wave");
        if (wave) {
          const tl = gsap.timeline({ scrollTrigger: { trigger: ".fh-transition", start: "top bottom", end: "bottom 40%", scrub: 0.6 } });
          tl.fromTo(wave.querySelectorAll(".fh-wave__line"), { drawSVG: "0%" }, { drawSVG: "100%", ease: "none", stagger: 0.1 }, 0).fromTo(
            wave.querySelector(".fh-wave__fill"),
            { yPercent: 60 },
            { yPercent: 0, ease: "none" },
            0,
          );
        }
        const endWave = fh.querySelector(".fh-wave--flip");
        if (endWave)
          gsap.fromTo(endWave.querySelectorAll(".fh-wave__line"), { drawSVG: "0%" }, { drawSVG: "100%", ease: "none", scrollTrigger: { trigger: endWave, start: "top bottom", end: "bottom 70%", scrub: 0.6 } });

        // Manifeste : chaque mot passe de l'ombre à l'encre.
        fh.querySelectorAll<HTMLElement>("[data-ink]").forEach((el) => {
          const split = SplitText.create(el, { type: "words", aria: "auto" });
          gsap.fromTo(split.words, { opacity: 0.12 }, { opacity: 1, ease: "none", stagger: 0.05, scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: 0.5 } });
          cleanups.push(() => split.revert());
        });

        // Titres : lignes masquées qui montent.
        fh.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
          const split = SplitText.create(el, { type: "lines", mask: "lines", aria: "auto" });
          gsap.from(split.lines, { yPercent: 115, duration: 1.2, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" } });
          cleanups.push(() => split.revert());
        });

        // Textes secondaires et cartes.
        gsap.set("[data-fade]", { autoAlpha: 0, y: 24 });
        ScrollTrigger.batch("[data-fade]", {
          start: "top 90%",
          once: true,
          onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.08, overwrite: true }),
        });
        // Cartes : elles basculent en 3D et se redressent en vague.
        gsap.set("[data-rise]", { autoAlpha: 0, y: 70, rotationX: -38, transformPerspective: 1100, transformOrigin: "50% 0%" });
        ScrollTrigger.batch("[data-rise]", {
          start: "top 88%",
          once: true,
          onEnter: (els) =>
            gsap.to(els, { autoAlpha: 1, y: 0, rotationX: 0, duration: 1.4, ease: "expo.out", stagger: { each: 0.12, from: "start" }, overwrite: true }),
        });

        // Entrée de section : une ligne Saloum Blue se trace puis se retire (le rendu final est inchangé).
        fh.querySelectorAll<HTMLElement>(".fh-section, .lc").forEach((section) => {
          gsap
            .timeline({ scrollTrigger: { trigger: section, start: "top 85%", toggleActions: "play none none none" } })
            .fromTo(section, { "--line-in": 0 }, { "--line-in": 1, duration: 0.9, ease: "expo.inOut" })
            .to(section, { "--line-out": 1, duration: 0.9, ease: "expo.inOut" }, "+=0.15");
        });

        // Fonds bleu pâle : ils glissent depuis la gauche à l'entrée.
        fh.querySelectorAll<HTMLElement>("[data-sweep]").forEach((section) => {
          gsap.fromTo(section, { "--sweep": 0 }, { "--sweep": 1, ease: "expo.inOut", duration: 1.4, scrollTrigger: { trigger: section, start: "top 80%", toggleActions: "play none none none" } });
        });

        // Inertie : un défilement rapide fait légèrement pencher photos et cartes.
        const skewTargets = gsap.utils.toArray<HTMLElement>(".fh-card__media, .fh-moment, .fh-featured__card, .fh-event");
        const skewTo = skewTargets.map((t) => gsap.quickTo(t, "skewY", { duration: 0.5, ease: "power3.out" }));
        const skewST = ScrollTrigger.create({
          trigger: fh,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const k = gsap.utils.clamp(-4, 4, self.getVelocity() / -400);
            skewTo.forEach((fn) => fn(k));
          },
        });
        let settle = 0;
        const onIdle = () => {
          window.clearTimeout(settle);
          settle = window.setTimeout(() => skewTo.forEach((fn) => fn(0)), 120);
        };
        window.addEventListener("scroll", onIdle, { passive: true });
        cleanups.push(() => {
          skewST.kill();
          window.removeEventListener("scroll", onIdle);
          window.clearTimeout(settle);
        });

        // Images : rideau qui s'ouvre, la photo se pose.
        fh.querySelectorAll<HTMLElement>("[data-reveal-img]").forEach((el) => {
          const img = el.querySelector("img");
          const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none none" } });
          tl.fromTo(el, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut" });
          if (img) tl.fromTo(img, { scale: 1.35 }, { scale: 1, duration: 1.8, ease: "expo.out" }, 0.2);
        });

        // Grand plan « Agir » : la fenêtre s'élargit jusqu'au plein cadre.
        fh.querySelectorAll<HTMLElement>("[data-zoom]").forEach((el) => {
          gsap.fromTo(
            el,
            { clipPath: "inset(14% 10% 14% 10% round 28px)" },
            { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top 90%", end: "top 10%", scrub: 0.6 } },
          );
          const img = el.querySelector("img");
          if (img) gsap.fromTo(img, { scale: 1.3 }, { scale: 1, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
        });

        // Bandeau : défilement continu, accéléré et inversé par le scroll.
        fh.querySelectorAll<HTMLElement>("[data-marquee]").forEach((el) => {
          const loop = gsap.to(el, { xPercent: -50, duration: 28, ease: "none", repeat: -1 });
          const st = ScrollTrigger.create({
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            onUpdate: (self) => {
              const v = self.getVelocity() / 300;
              gsap.to(loop, { timeScale: gsap.utils.clamp(-6, 6, (self.direction || 1) * (1 + Math.abs(v))), duration: 0.3, overwrite: true });
              gsap.to(loop, { timeScale: self.direction || 1, duration: 1.4, delay: 0.3, ease: "power2.out" });
            },
          });
          cleanups.push(() => {
            loop.kill();
            st.kill();
          });
        });

        // Cartes d'événements : inclinaison 3D légère sous la souris.
        if (fine) {
          fh.querySelectorAll<HTMLElement>("[data-tilt]").forEach((card) => {
            const rx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" });
            const ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" });
            const onMove = (e: PointerEvent) => {
              const r = card.getBoundingClientRect();
              ry(((e.clientX - r.left) / r.width - 0.5) * 12);
              rx(-((e.clientY - r.top) / r.height - 0.5) * 12);
            };
            const onLeave = () => {
              rx(0);
              ry(0);
            };
            gsap.set(card, { transformPerspective: 900 });
            card.addEventListener("pointermove", onMove);
            card.addEventListener("pointerleave", onLeave);
            cleanups.push(() => {
              card.removeEventListener("pointermove", onMove);
              card.removeEventListener("pointerleave", onLeave);
            });
          });
        }
      },
    );

    return () => {
      cleanups.forEach((c) => c());
      mm.revert();
    };
  }, []);

  return null;
}
