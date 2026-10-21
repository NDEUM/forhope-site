"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ARRIVAL, INTRO } from "@/content/journey";
import { onReady } from "@/lib/experience-store";
import { journey } from "@/lib/journey-store";
import { damp, smoothstep, window4 } from "@/lib/math";

gsap.registerPlugin(ScrollTrigger);

/** Rattrapage du scroll : une caméra lourde, jamais saccadée. */
const FOLLOW = 3.6;

/**
 * Chef d'orchestre du voyage (scroll natif, rien n'est bloqué) :
 *  - ScrollTrigger mesure la progression sur la piste ;
 *  - une seule progression amortie (journey.smooth) pilote la caméra
 *    ET les repères typographiques : ils sont toujours synchrones ;
 *  - arrivée au Sénégal : lumière dorée → bleu nuit → photos qui se rassemblent.
 */
export function JourneyDirector() {
  useEffect(() => {
    const section = document.getElementById("voyage");
    const stage = section?.querySelector<HTMLElement>(".journey__stage");
    if (!section || !stage) return;
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const windows = Array.from(stage.querySelectorAll<HTMLElement>("[data-window]")).map((el) => ({
      el,
      w: el.dataset.window!.split(",").map(Number) as [number, number, number, number],
      last: -1,
    }));
    const chapters = Array.from(stage.querySelectorAll<HTMLElement>("[data-chapter]"));
    const altitude = stage.querySelector<HTMLElement>("[data-altitude]");
    const videos = Array.from(stage.querySelectorAll<HTMLElement>("[data-video]")).map((el) => ({
      video: el.querySelector("video")!,
      range: el.dataset.video!.split(",").map(Number) as [number, number],
    }));

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        journey.progress = self.progress;
      },
    });
    journey.progress = trigger.progress;
    // Développement : ?p=0.5 ouvre directement le voyage à cette progression (vérification visuelle).
    let jump = false;
    if (process.env.NODE_ENV !== "production") {
      Object.assign(window, { __journey: journey });
      const p = new URLSearchParams(location.search).get("p");
      if (p !== null) {
        const v = Number(p);
        // au-delà de 1 : en hauteurs d'écran après la fin du voyage
        const y = v <= 1 ? section.offsetTop + v * (section.offsetHeight - window.innerHeight) : section.offsetTop + section.offsetHeight - window.innerHeight + (v - 1) * window.innerHeight;
        window.scrollTo(0, y);
        jump = true;
      }
    }
    journey.smooth = journey.progress;

    // Ouverture (au temps, après le chargement) : la Terre au loin, les
    // étoiles, puis la caméra rejoint le premier plan. Le défilement
    // l'accélère ; elle est sautée si l'on arrive plus bas dans la page.
    let introStart = -1;
    if (reduced || jump || journey.progress > 0.01) journey.intro = 1;
    else journey.intro = 0;
    const stopIntro = onReady(() => {
      introStart = performance.now();
    });

    let raf = 0;
    let last = performance.now();
    let lastAlt = -1;
    let lastChapter = -1;
    let lastVars = "";

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (journey.intro < 1 && introStart >= 0) {
        const speed = window.scrollY > 20 ? 4 : 1;
        journey.intro = Math.min(1, journey.intro + (dt * speed) / INTRO.duration);
      }
      const target = journey.progress;
      journey.smooth = reduced || jump ? target : damp(journey.smooth, target, FOLLOW, dt);
      if (Math.abs(journey.smooth - target) < 0.00005) journey.smooth = target;
      const p = journey.smooth;

      // Repères et intro : fondu + légère montée.
      for (const item of windows) {
        const o = window4(item.w[0], item.w[1], item.w[2], item.w[3], p);
        if (Math.abs(o - item.last) < 0.003) continue;
        item.last = o;
        item.el.style.opacity = o.toFixed(3);
        item.el.style.transform = `translate3d(0, ${((1 - o) * 14).toFixed(1)}px, 0)`;
        item.el.style.visibility = o < 0.002 ? "hidden" : "visible";
      }

      // Arrivée au Sénégal (synchronisée sur la caméra) : une lumière dorée naît
      // sur le Sénégal, s'étend, puis se fond dans le bleu nuit de la section suivante.
      const bloom = window4(ARRIVAL.at, ARRIVAL.bloomPeak, ARRIVAL.fadeFrom, ARRIVAL.fadeTo, p);
      const bloomSize = smoothstep(ARRIVAL.at, ARRIVAL.fadeTo, p);
      const arrive = smoothstep(ARRIVAL.fadeFrom, ARRIVAL.fadeTo, p);
      // Titrage d'ouverture : il s'envole pendant les premiers instants de la descente.
      // linéaire : chaque ligne a sa propre fenêtre de bascule (voir --l en CSS)
      const titleOut = Math.min(1, Math.max(0, (p - 0.002) / 0.07));
      const fx = (journey.focusX * 100).toFixed(1);
      const fy = (journey.focusY * 100).toFixed(1);
      const vars = `${bloom.toFixed(3)}|${bloomSize.toFixed(3)}|${arrive.toFixed(3)}|${p.toFixed(4)}|${fx}|${fy}`;
      if (vars !== lastVars) {
        lastVars = vars;
        stage.style.setProperty("--bloom", bloom.toFixed(3));
        stage.style.setProperty("--bloom-size", bloomSize.toFixed(3));
        stage.style.setProperty("--fx", `${fx}%`);
        stage.style.setProperty("--fy", `${fy}%`);
        stage.style.setProperty("--arrive", arrive.toFixed(3));
        stage.style.setProperty("--title-out", titleOut.toFixed(4));
        root.style.setProperty("--progress", p.toFixed(4));
      }

      // Altitude (km), arrondie comme un instrument.
      const km = journey.altitudeKm;
      if (altitude && km > 0 && Math.abs(km - lastAlt) > 0.5) {
        lastAlt = km;
        const step = km > 2000 ? 100 : km > 200 ? 10 : 1;
        altitude.textContent = (Math.round(km / step) * step).toLocaleString("fr-FR");
      }

      let active = 0;
      chapters.forEach((c, i) => {
        if (p >= Number(c.dataset.chapter) - 0.001) active = i;
      });
      if (active !== lastChapter) {
        lastChapter = active;
        chapters.forEach((c, i) => c.classList.toggle("is-active", i === active));
      }

      // Vidéos : chargées à l'approche, lecture calée sur le scroll.
      for (const { video, range } of videos) {
        // Seule la version affichée (paysage ou portrait) se charge.
        if (video.offsetParent === null) continue;
        if (p > range[0] - 0.06 && video.preload !== "auto") video.preload = "auto";
        if (p >= range[0] && p <= range[1] && video.duration) {
          const t = ((p - range[0]) / (range[1] - range[0])) * video.duration;
          if (Math.abs(video.currentTime - t) > 0.04) video.currentTime = t;
        }
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      stopIntro();
      trigger.kill();
    };
  }, []);

  return null;
}
