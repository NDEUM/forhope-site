"use client";

import { useCallback, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { JourneyCamera } from "@/components/journey/JourneyCamera";
import { CloudPass } from "@/components/journey/CloudPass";
import { Earth } from "@/components/journey/earth/Earth";
import { Atmosphere, Clouds, SkyDome, SpaceBackdrop, Stars } from "@/components/journey/earth/Sky";
import { LightPath } from "@/components/journey/earth/LightPath";
import { journey } from "@/lib/journey-store";
import { smoothstep } from "@/lib/math";
import { useQualityTier } from "@/hooks/useQualityTier";
import { brand, blend } from "@/lib/brand";

/** Le noir de l'espace : Midnight assombri (charte). */
const SPACE = new THREE.Color(brand.midnight).multiplyScalar(0.32);

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Le fond passe du noir de l'espace au bleu de l'air pendant la descente. */
function Background() {
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    scene.background = SPACE.clone();
    return () => {
      scene.background = null;
    };
  }, [scene]);
  const air = new THREE.Color(blend(brand.hopeBlue, brand.white, 0.35));
  useFrame(({ camera }) => {
    const alt = camera.position.length() - 1;
    const k = 1 - smoothstep(0.012, 0.09, alt);
    if (scene.background instanceof THREE.Color) scene.background.copy(SPACE).lerp(air, k);
  });
  return null;
}

/** Le rendu s'arrête entre la fin du voyage et la sortie (bas du site). */
function Pause() {
  const set = useThree((s) => s.set);
  useEffect(() => {
    let raf = 0;
    const check = () => {
      const journeyDone = journey.progress >= 0.999 && journey.smooth >= 0.995;
      set({ frameloop: journeyDone && !journey.outroActive ? "never" : "always" });
      raf = window.setTimeout(check, 250) as unknown as number;
    };
    check();
    return () => window.clearTimeout(raf);
  }, [set]);
  return null;
}

/** La planète, l'atmosphère, les nuages et la caméra drone. Décoratif. */
export default function JourneyCanvas() {
  const tier = useQualityTier();
  const [supported] = useState(hasWebGL);
  const [dpr, setDpr] = useState<[number, number]>(tier === "high" ? [1, 1.75] : [1, 1.4]);

  useEffect(() => {
    setDpr(tier === "high" ? [1, 1.75] : [1, 1.4]);
  }, [tier]);

  const onReady = useCallback(() => document.documentElement.classList.add("webgl"), []);
  useEffect(() => () => document.documentElement.classList.remove("webgl"), []);

  useEffect(() => {
    if (!supported) document.documentElement.classList.add("no-webgl");
  }, [supported]);

  if (!supported) return null;

  return (
    <Canvas
      dpr={dpr}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
      camera={{ fov: 32, near: 0.01, far: 200, position: [0, 0, 4.3] }}
      onCreated={({ gl, scene, camera, advance }) => {
        if (process.env.NODE_ENV !== "production") Object.assign(window, { __three: { gl, scene, camera, advance } });
      }}
    >
      <PerformanceMonitor onDecline={() => setDpr([1, 1])} />
      <Background />
      <JourneyCamera />
      <SpaceBackdrop />
      <Stars count={tier === "high" ? 3400 : 1600} />
      <SkyDome />
      <Earth tier={tier} onReady={onReady} />
      <Clouds />
      <LightPath />
      <Atmosphere />
      <CloudPass />
      <Pause />
    </Canvas>
  );
}
