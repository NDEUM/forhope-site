"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { CameraRig } from "@/components/camera/CameraRig";
import { Building, Floor, Glass } from "@/components/architecture/Building";
import { Beams, Light, SkyDome, Skylights, SlotSun } from "@/components/architecture/Light";
import { Installations } from "@/components/architecture/Installations";
import { MuseumSpots } from "@/components/architecture/MuseumSpots";
import { Inscriptions } from "@/components/architecture/Inscriptions";
import { Events } from "@/components/architecture/Events";
import { GlowField } from "@/components/scenes/GlowField";
import { Effects } from "@/components/experience/Effects";
import { experience } from "@/lib/experience-store";
import { useQualityTier } from "@/hooks/useQualityTier";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { brand, blend } from "@/lib/brand";

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Quelques poussières dans les faisceaux : la brume « tient » la lumière. */
function Dust({ count }: { count: number }) {
  return (
    <GlowField
      count={count}
      seed={9}
      core={0.4}
      fogFade={0.9}
      drift={0.25}
      color={blend(brand.white, brand.goldLight, 0.3)}
      init={(i, rand, o) => {
        // moitié dans le Seuil, moitié sous le puits de lumière de la grande salle
        if (i % 2 === 0) o.pos.set(-6 + rand() * 18, 0.5 + rand() * 14, -4 - rand() * 44);
        else o.pos.set(-8 + rand() * 16, 0.5 + rand() * 26, -290 - rand() * 18);
        o.scale = 0.025 + rand() * 0.045;
      }}
      opacity={() => 0.55}
    />
  );
}

/** Le bâtiment For Hope, décoratif : tout le contenu est dans le HTML. */
export default function ExperienceCanvas() {
  const tier = useQualityTier();
  const reducedMotion = useReducedMotion();
  const [supported] = useState(hasWebGL);
  const [dpr, setDpr] = useState<[number, number]>(tier === "high" ? [1, 1.6] : [1, 1.3]);
  // Post-production coupée si la machine peine (PerformanceMonitor).
  const [effects, setEffects] = useState(true);

  useEffect(() => {
    experience.tier = tier;
    setDpr(tier === "high" ? [1, 1.6] : [1, 1.3]);
  }, [tier]);

  useEffect(() => {
    experience.reducedMotion = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    const id = window.setTimeout(() => window.dispatchEvent(new Event("resize")), 80);
    return () => {
      window.clearTimeout(id);
      document.documentElement.classList.remove("webgl");
    };
  }, []);

  if (!supported) return null;

  return (
    <Canvas
      dpr={dpr}
      shadows={tier === "high"}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        alpha: false,
        stencil: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.3,
      }}
      camera={{ fov: 36, near: 0.2, far: 2500, position: [0.6, 1.9, 7] }}
      onCreated={({ gl, scene, camera }) => {
        gl.setClearColor(brand.midnight);
        // Inspection en développement uniquement.
        if (process.env.NODE_ENV !== "production") Object.assign(window, { __three: { gl, scene, camera } });
        document.documentElement.classList.add("webgl");
      }}
    >
      <PerformanceMonitor
        onDecline={() => {
          setDpr([1, 1]);
          setEffects(false);
        }}
      />
      <CameraRig />
      <Light tier={tier} />
      {tier === "high" && <SlotSun />}
      <SkyDome />
      <Building tier={tier} />
      <Floor tier={tier} />
      <Glass />
      <Skylights tier={tier} />
      <Beams />
      <Installations tier={tier} />
      {tier === "high" && <MuseumSpots />}
      <Inscriptions />
      <Events />
      {tier === "high" && <Dust count={220} />}
      {tier === "high" && effects && <Effects />}
    </Canvas>
  );
}
