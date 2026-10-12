"use client";

import { useEffect } from "react";
import { journey } from "@/lib/journey-store";
import { damp, smoothstep, window4 } from "@/lib/math";

const FOLLOW = 3.2;

/**
 * Pilote de la sortie : mesure la progression de la section (scroll natif),
 * l'amortit, active la caméra de sortie tant que la section est à l'écran,
 * et anime les repères HTML sur le même temps que la caméra.
 */
export function OutroDirector() {
  useEffect(() => {
    const section = document.getElementById("sortie");
    const stage = section?.querySelector<HTMLElement>(".outro__stage");
    if (!section || !stage) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = Array.from(stage.querySelectorAll<HTMLElement>("[data-owindow]")).map((el) => ({
      el,
      w: el.dataset.owindow!.split(",").map(Number) as [number, number, number, number],
      last: -1,
    }));
    const altitude = stage.querySelector<HTMLElement>("[data-oaltitude]");
    let raf = 0;
    let last = performance.now();
    let smooth = 0;
    let lastAlt = -1;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const r = section.getBoundingClientRect();
      const vh = window.innerHeight;
      // Active dès que la section est entrée, y compris quand on est descendu
      // jusqu'au pied de page (transparent sur l'accueil) : la Terre reste visible.
      const active = r.top < vh;
      // 0 tant que la section n'occupe pas tout l'écran (le blanc des nuages prolonge
      // le blanc du site), 1 quand son bas atteint le bas de l'écran.
      const raw = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - vh)));
      if (!journey.outroActive && active) smooth = raw;
      journey.outroActive = active;
      if (!active) return;
      smooth = reduced ? raw : damp(smooth, raw, FOLLOW, dt);
      journey.outro = smooth;

      // voile de raccord : on sort du blanc des nuages
      stage.style.setProperty("--veil", (1 - smoothstep(0, 0.06, smooth)).toFixed(3));
      for (const it of items) {
        const o = window4(it.w[0], it.w[1], it.w[2], it.w[3], smooth);
        if (Math.abs(o - it.last) < 0.003) continue;
        it.last = o;
        it.el.style.opacity = o.toFixed(3);
        it.el.style.transform = `translate3d(0, ${((1 - o) * 14).toFixed(1)}px, 0)`;
        it.el.style.visibility = o < 0.002 ? "hidden" : "visible";
      }
      const km = journey.altitudeKm;
      if (altitude && km > 0 && Math.abs(km - lastAlt) > 0.5) {
        lastAlt = km;
        const step = km > 2000 ? 100 : km > 200 ? 10 : 1;
        altitude.textContent = (Math.round(km / step) * step).toLocaleString("fr-FR");
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      journey.outroActive = false;
    };
  }, []);

  return null;
}
