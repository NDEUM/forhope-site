"use client";

import { Bloom, EffectComposer, N8AO, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";

/**
 * Le « développement » de l'image, comme en photographie d'architecture :
 * occlusion ambiante (les angles et les pieds de mur s'assombrissent),
 * halo léger autour des sources de lumière, tonalité ACES et un vignettage
 * d'objectif à peine perceptible. Réservé aux appareils puissants.
 */
export function Effects() {
  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      <N8AO aoRadius={2.4} distanceFalloff={1.2} intensity={2.6} quality="medium" halfRes color="#05060f" />
      <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={0.45} radius={0.7} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.32} darkness={0.55} />
    </EffectComposer>
  );
}
