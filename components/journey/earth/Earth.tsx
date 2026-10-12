"use client";

import { useEffect, useMemo, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { regions } from "@/content/journey";
import { smoothstep } from "@/lib/math";
import { paintRegion, type GeoData } from "@/components/journey/earth/regionTexture";
import type { QualityTier } from "@/lib/experience-store";

/** Direction du soleil (monde) : l'Afrique en plein jour, la nuit sur les Amériques. */
export const SUN_DIRECTION = new THREE.Vector3(0.92, 0.2, -0.34).normalize();

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uDay;
  uniform sampler2D uNight;
  uniform sampler2D uTopo;
  uniform sampler2D uWater;
  uniform sampler2D uRegion0;
  uniform sampler2D uRegion1;
  uniform sampler2D uRegion2;
  uniform vec4 uBounds0; // ouest, est, sud, nord
  uniform vec4 uBounds1;
  uniform vec4 uBounds2;
  uniform float uMix0;
  uniform float uMix1;
  uniform float uMix2;
  uniform vec3 uSun;
  uniform vec3 uHaze;
  uniform float uHazeAmount;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;

  // Relief : perturbation de la normale par les dérivées écran de la hauteur.
  vec3 perturb(vec3 p, vec3 n, float h) {
    vec3 sx = dFdx(p);
    vec3 sy = dFdy(p);
    vec3 r1 = cross(sy, n);
    vec3 r2 = cross(n, sx);
    float det = dot(sx, r1);
    vec2 dh = vec2(dFdx(h), dFdy(h));
    vec3 grad = sign(det) * (dh.x * r1 + dh.y * r2);
    return normalize(abs(det) * n - grad);
  }

  vec4 region(sampler2D map, vec4 b, float lon, float lat, out float w) {
    vec2 ru = vec2((lon - b.x) / (b.y - b.x), (lat - b.z) / (b.w - b.z));
    float edge = min(min(ru.x, 1.0 - ru.x), min(ru.y, 1.0 - ru.y));
    w = smoothstep(0.0, 0.08, edge);
    return texture2D(map, clamp(ru, 0.0, 1.0));
  }

  void main() {
    float lon = vUv.x * 360.0 - 180.0;
    float lat = vUv.y * 180.0 - 90.0;

    vec3 day = texture2D(uDay, vUv).rgb;
    float w0, w1;
    vec3 r0 = region(uRegion0, uBounds0, lon, lat, w0).rgb;
    vec3 r1 = region(uRegion1, uBounds1, lon, lat, w1).rgb;
    float w2;
    vec3 r2 = region(uRegion2, uBounds2, lon, lat, w2).rgb;
    day = mix(day, r0, w0 * uMix0);
    day = mix(day, r1, w1 * uMix1);
    day = mix(day, r2, w2 * uMix2);

    float water = texture2D(uWater, vUv).r;
    float h = texture2D(uTopo, vUv).r * (1.0 - water);
    vec3 n = normalize(vWorldNormal);
    vec3 nb = perturb(vWorldPos, n, h * 0.012);

    vec3 V = normalize(cameraPosition - vWorldPos);
    float ndl = dot(nb, uSun);
    float daylight = smoothstep(-0.12, 0.28, dot(n, uSun));

    // Lumière du soleil + un peu de ciel diffus.
    vec3 lit = day * (max(ndl, 0.0) * 1.35 + 0.035);

    // Reflet du soleil sur les océans.
    vec3 H = normalize(uSun + V);
    float nh = max(dot(n, H), 0.0);
    // reflet argenté : un cœur discret et un large voile, comme vu depuis l'orbite
    float spec = (pow(nh, 900.0) * 0.28 + pow(nh, 60.0) * 0.07) * water * daylight;
    lit += vec3(0.85, 0.9, 1.0) * spec;

    // Lumières des villes dans la nuit.
    vec3 night = texture2D(uNight, vUv).rgb;
    lit += night * vec3(1.0, 0.82, 0.55) * (1.0 - daylight) * 1.4;

    // Diffusion atmosphérique sur les bords du disque.
    float rim = pow(1.0 - max(dot(n, V), 0.0), 3.0);
    lit = mix(lit, vec3(0.24, 0.55, 0.95) * (0.25 + daylight), rim * 0.55 * (0.3 + daylight));

    // Perspective aérienne à basse altitude : la distance se voile.
    float dist = length(cameraPosition - vWorldPos);
    float haze = (1.0 - exp(-dist * 3.0)) * uHazeAmount * 0.6;
    lit = mix(lit, uHaze * (0.35 + daylight * 0.65), haze);

    gl_FragColor = vec4(lit, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function loadTexture(src: string, srgb: boolean, anisotropy: number) {
  return loadImage(src).then((img) => {
    const t = new THREE.Texture(img);
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.anisotropy = anisotropy;
    t.needsUpdate = true;
    return t;
  });
}

const blank = () => {
  const t = new THREE.DataTexture(new Uint8Array([10, 20, 50, 255]), 1, 1);
  t.needsUpdate = true;
  return t;
};

export function Earth({ tier, onReady }: { tier: QualityTier; onReady?: () => void }) {
  const gl = useThree((s) => s.gl);
  const [ready, setReady] = useState(false);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uDay: { value: blank() },
          uNight: { value: blank() },
          uTopo: { value: blank() },
          uWater: { value: blank() },
          uRegion0: { value: blank() },
          uRegion1: { value: blank() },
          uRegion2: { value: blank() },
          uBounds0: { value: new THREE.Vector4(regions[0].west, regions[0].east, regions[0].south, regions[0].north) },
          uBounds1: { value: new THREE.Vector4(regions[1].west, regions[1].east, regions[1].south, regions[1].north) },
          uBounds2: { value: new THREE.Vector4(regions[2].west, regions[2].east, regions[2].south, regions[2].north) },
          uMix0: { value: 0 },
          uMix1: { value: 0 },
          uMix2: { value: 0 },
          uSun: { value: SUN_DIRECTION.clone() },
          uHaze: { value: new THREE.Color(0.62, 0.74, 0.88) },
          uHazeAmount: { value: 0 },
        },
      }),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    const aniso = Math.min(8, gl.capabilities.getMaxAnisotropy());
    // Chargement progressif : 2K d'abord (premier écran rapide), 4K ensuite sur ordinateur.
    const k = "2k";
    const created: THREE.Texture[] = [];
    (async () => {
      // 1. La planète d'abord (premier écran).
      const [day, night, topo, water] = await Promise.all([
        loadTexture(`/media/earth/day-${k}.jpg`, true, aniso),
        loadTexture(`/media/earth/night-${k}.jpg`, true, aniso),
        loadTexture("/media/earth/topology-2k.jpg", false, aniso),
        loadTexture("/media/earth/water-1600.jpg", false, aniso),
      ]);
      if (cancelled) return [day, night, topo, water].forEach((t) => t.dispose());
      created.push(day, night, topo, water);
      const u = material.uniforms;
      u.uDay.value = day;
      u.uNight.value = night;
      u.uTopo.value = topo;
      u.uWater.value = water;
      setReady(true);
      onReady?.();

      // 2. Version 4K de la planète (ordinateurs), sans bloquer le premier écran.
      if (tier === "high") {
        const [day4, night4] = await Promise.all([
          loadTexture("/media/earth/day-4k.jpg", true, aniso),
          loadTexture("/media/earth/night-4k.jpg", true, aniso),
        ]);
        if (cancelled) return [day4, night4].forEach((t) => t.dispose());
        created.push(day4, night4);
        u.uDay.value = day4;
        u.uNight.value = night4;
      }

      // 3. Les cartes régionales ensuite (utiles seulement à la descente).
      const files = [...new Set(regions.map((r) => r.geo))];
      const geos = new Map<string, GeoData>(await Promise.all(files.map(async (f) => [f, (await fetch(f).then((r) => r.json())) as GeoData] as const)));
      const dayImg = (u.uDay.value as THREE.Texture).image as HTMLImageElement;
      const size = tier === "high" ? 2048 : 1024;
      const textures = regions.map((r) => paintRegion(r, dayImg, geos.get(r.geo)!, size, r.highlight));
      if (cancelled) return textures.forEach((t) => t.dispose());
      textures.forEach((t) => (t.anisotropy = aniso));
      created.push(...textures);
      u.uRegion0.value = textures[0];
      u.uRegion1.value = textures[1];
      u.uRegion2.value = textures[2];
    })().catch(() => {
      // Sans textures, la planète reste une sphère sombre : le récit HTML suffit.
      setReady(true);
      onReady?.();
    });
    return () => {
      cancelled = true;
      created.forEach((t) => t.dispose());
    };
  }, [gl, material, tier, onReady]);

  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ camera }) => {
    const alt = camera.position.length() - 1;
    const u = material.uniforms;
    u.uMix0.value = 1 - smoothstep(regions[0].fadeTo, regions[0].fadeFrom, alt);
    u.uMix1.value = 1 - smoothstep(regions[1].fadeTo, regions[1].fadeFrom, alt);
    u.uMix2.value = 1 - smoothstep(regions[2].fadeTo, regions[2].fadeFrom, alt);
    u.uHazeAmount.value = 1 - smoothstep(0.01, 0.06, alt);
  });

  const segments = tier === "high" ? 256 : 128;
  return (
    <mesh material={material} visible={ready}>
      <sphereGeometry args={[1, segments, segments / 2]} />
    </mesh>
  );
}
