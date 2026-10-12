"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { QualityTier } from "@/lib/experience-store";

/**
 * Niveau de qualité : « low » pour mobile / tactile / petites machines.
 * Le niveau peut encore baisser à l'exécution (PerformanceMonitor).
 */
export function useQualityTier(): QualityTier {
  const small = useMediaQuery("(max-width: 767px)");
  const coarse = useMediaQuery("(pointer: coarse)");
  if (small || coarse) return "low";
  if (typeof navigator !== "undefined") {
    const cores = navigator.hardwareConcurrency ?? 8;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    if (cores <= 4 || memory <= 4) return "low";
  }
  return "high";
}
