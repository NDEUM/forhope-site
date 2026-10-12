"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { activeSceneIndex, DEFAULT_STEP_START, END_FRAME_AT } from "@/content/scenes";
import { experience, setActiveScene } from "@/lib/experience-store";
import { clamp } from "@/lib/math";

gsap.registerPlugin(ScrollTrigger, SplitText);

/** Position de scroll (px) correspondant à une progression globale. */
export function scrollTopFor(progress: number) {
  const story = document.querySelector<HTMLElement>(".story");
  if (!story) return 0;
  const top = story.getBoundingClientRect().top + window.scrollY;
  const length = story.querySelectorAll<HTMLElement>(".scene");
  const span = Array.from(length).reduce((h, s) => h + s.offsetHeight, 0);
  return top + progress * (span - window.innerHeight);
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const seg = (p: number, a: number, b: number) => easeInOut(clamp((p - a) / (b - a), 0, 1));

/**
 * Chef d'orchestre du scroll (natif, sans blocage) :
 *  - progression globale de la visite → caméra ;
 *  - cartels encrés lettre à lettre (scrub) ;
 *  - rideau de lames puis dernière image « FOR [photo] HOPE ».
 */
export function ScrollDirector() {
  useEffect(() => {
    const root = document.documentElement;
    const story = document.querySelector<HTMLElement>(".story");
    if (!story) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sections = gsap.utils.toArray<HTMLElement>(".scene", story);
    const slats = gsap.utils.toArray<HTMLElement>(".slats span");
    const endframe = story.querySelector<HTMLElement>(".endframe");
    const photo = story.querySelector<HTMLElement>(".endframe__photo");
    let endState = "";

    const update = (progress: number) => {
      experience.progress = progress;
      root.style.setProperty("--progress", progress.toFixed(4));
      setActiveScene(activeSceneIndex(progress));

      // Rideau : couvre de gauche à droite, se retire de droite à gauche.
      const n = slats.length;
      slats.forEach((sl, i) => {
        const j = n - 1 - i;
        const cover = seg(progress, END_FRAME_AT - 0.03 + i * 0.0012, END_FRAME_AT - 0.012 + i * 0.0012);
        const clear = seg(progress, END_FRAME_AT + 0.004 + j * 0.0012, END_FRAME_AT + 0.02 + j * 0.0012);
        sl.style.transformOrigin = clear > 0 ? "top" : "bottom";
        sl.style.transform = `scaleY(${(cover - clear).toFixed(4)})`;
      });

      // Dernière image : la photo naît entre « For » et « Hope ».
      const state = progress >= END_FRAME_AT ? "on" : "";
      if (state !== endState) {
        endState = state;
        root.dataset.end = state;
        root.dataset.tone = state ? "light" : "";
      }
      if (photo) {
        const g = reduced ? (state ? 1 : 0) : seg(progress, END_FRAME_AT + 0.008, 0.992);
        photo.style.setProperty("--grow", g.toFixed(4));
        endframe?.style.setProperty("--after", seg(progress, 0.975, 0.997).toFixed(4));
      }
    };

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sections[0],
        endTrigger: sections[sections.length - 1],
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => update(self.progress),
        onRefresh: (self) => update(self.progress),
      });

      sections.forEach((section, i) => {
        const last = i === sections.length - 1;
        const stack = section.hasAttribute("data-stack");
        const steps = gsap.utils.toArray<HTMLElement>("[data-step]", section);
        if (!steps.length) return;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: last ? "bottom bottom" : "bottom top",
            scrub: reduced ? true : 1,
            toggleClass: { targets: section, className: "is-active" },
          },
        });

        const startAt = Number(steps[0].dataset.start ?? DEFAULT_STEP_START);
        const span = (0.94 - startAt) / steps.length;
        steps.forEach((step, k) => {
          const s0 = startAt + k * span;
          const fade = Math.min(0.1, span * 0.32);
          tl.fromTo(step, { opacity: 0 }, { opacity: 1, duration: fade * 0.35 }, s0);
          if (!reduced) {
            // Encrage : le texte est posé en gris, puis s'encre lettre à lettre.
            const chars: Element[] = [];
            step.querySelectorAll(".ink").forEach((el) => chars.push(...SplitText.create(el, { type: "words,chars", aria: "auto" }).chars));
            if (chars.length) {
              tl.fromTo(chars, { opacity: 0.14 }, { opacity: 1, duration: fade * 0.5, stagger: { amount: fade * 1.1 } }, s0 + fade * 0.15);
            }
            const rule = step.querySelector(".cartel__rule");
            if (rule) tl.fromTo(rule, { scaleY: 0 }, { scaleY: 1, duration: fade, ease: "expo.out" }, s0);
          }
          if (!stack && !(last && k === steps.length - 1)) {
            tl.to(step, { opacity: 0, duration: fade * 0.6 }, s0 + span - fade * 0.6);
          }
        });
        if (stack && !last) tl.to(steps, { opacity: 0, duration: 0.06 }, 0.92);
        tl.set({}, {}, 1);
      });
    }, story);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      ctx.revert();
      delete root.dataset.end;
      delete root.dataset.tone;
    };
  }, []);

  return null;
}
