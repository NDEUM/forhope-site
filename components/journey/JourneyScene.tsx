"use client";

import dynamic from "next/dynamic";

const JourneyCanvas = dynamic(() => import("@/components/journey/JourneyCanvas"), { ssr: false, loading: () => null });

/** Couche WebGL fixe derrière le voyage (décorative). */
export function JourneyScene() {
  return (
    <div className="journey__canvas" aria-hidden="true">
      <JourneyCanvas />
    </div>
  );
}
