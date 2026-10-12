"use client";

import dynamic from "next/dynamic";

const ExperienceCanvas = dynamic(() => import("@/components/experience/ExperienceCanvas"), {
  ssr: false,
  loading: () => null,
});

/**
 * Couche visuelle fixe derrière le récit. Le dégradé CSS (piloté par
 * --sky-top / --sky-bottom) sert de fond pendant le chargement et de
 * repli sans WebGL.
 */
export function Experience() {
  return (
    <div className="experience" aria-hidden="true">
      <div className="experience__fallback" />
      <ExperienceCanvas />
    </div>
  );
}
