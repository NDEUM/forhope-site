"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { ParticleSphere } from "@/components/ui/cosmos-3d-orbit-gallery";
import { homePhotos } from "@/content/home-photos";
import { journey } from "@/lib/journey-store";
import { useQualityTier } from "@/hooks/useQualityTier";

/** Photos servies en petite taille par l'optimiseur d'images (textures légères). */
const thumb = (src: string) => `/_next/image?url=${encodeURIComponent(src)}&w=384&q=75`;
const IMAGES = homePhotos.map((p) => thumb(p.src));

/**
 * Premier écran de l'accueil, avant le voyage : les photos de For Hope en
 * orbite dans une poussière dorée. Défilement natif : la molette et le
 * doigt font défiler la page (pas de zoom capturé) ; à la souris, on peut
 * faire tourner la scène en la faisant glisser.
 */
export function CosmosIntro() {
  const root = useRef<HTMLElement>(null);
  const tier = useQualityTier();
  const [active, setActive] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [finePointer, setFinePointer] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setFinePointer(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
    const el = root.current;
    if (!el) return;
    // Le rendu s'arrête hors de l'écran ; tant que cet écran couvre la vue,
    // la Terre du voyage (derrière) ne se calcule pas pour rien.
    const io = new IntersectionObserver(
      ([e]) => {
        setActive(e.isIntersecting);
        journey.introCovering = e.intersectionRatio > 0.98;
      },
      { threshold: [0, 0.98, 1] },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      journey.introCovering = false;
    };
  }, []);

  return (
    <section ref={root} className="cosmos" aria-labelledby="cosmos-title">
      <div className="cosmos__canvas" aria-hidden="true">
        <Canvas
          dpr={[1, tier === "high" ? 1.5 : 1.25]}
          frameloop={active ? "always" : "never"}
          camera={{ position: [-10, 1.5, 10], fov: 50 }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
          <Suspense fallback={null}>
            <ParticleSphere images={IMAGES} particleCount={tier === "high" ? 1500 : 700} spin={!reduced} />
          </Suspense>
          {finePointer && <OrbitControls enablePan={false} enableZoom={false} enableRotate rotateSpeed={0.5} />}
        </Canvas>
      </div>

      <div className="cosmos__copy">
        <p className="cosmos__eyebrow">For Hope Association</p>
        <h2 id="cosmos-title" className="cosmos__title">
          Ensemble, faisons grandir l&apos;espoir.
        </h2>
      </div>

      <div className="cosmos__scroll">
        <p className="journey__scroll-pill">
          <span className="journey__scroll-mouse" aria-hidden="true">
            <span />
          </span>
          Scroller
        </p>
        <span className="journey__scroll-chevrons" aria-hidden="true">
          <span />
          <span />
        </span>
      </div>
    </section>
  );
}
