"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { MeshReflectorMaterial } from "@react-three/drei";
import { concrete, freePanels, glassPanels, interiorFloor } from "@/content/architecture";
import { boxFromExtents, boxFromRotated, mergeBoxes } from "@/lib/architecture-geometry";
import { createConcreteTexture, createFloorTexture, FLOOR_TILE } from "@/components/architecture/concreteTexture";
import { brand, blend } from "@/lib/brand";
import type { QualityTier } from "@/lib/experience-store";

/** Tous les volumes de béton : une seule géométrie, un seul draw call. */
export function Building({ tier }: { tier: QualityTier }) {
  const { mesh, texture } = useMemo(() => {
    const geometry = mergeBoxes([...concrete.map(boxFromExtents), ...freePanels.map(boxFromRotated)]);
    const map = createConcreteTexture(tier === "high" ? 1024 : 512);
    // La même texture sert de relief (bump) : pores, joints et trous de
    // serrage accrochent la lumière rasante comme du vrai béton.
    const material = new THREE.MeshStandardMaterial({
      map,
      color: "#b9bac0",
      roughness: 0.92,
      bumpMap: map,
      bumpScale: tier === "high" ? 2.2 : 1.2,
      metalness: 0,
    });
    const m = new THREE.Mesh(geometry, material);
    m.castShadow = tier === "high";
    m.receiveShadow = tier === "high";
    return { mesh: m, texture: map };
  }, [tier]);

  useEffect(
    () => () => {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
      texture.dispose();
    },
    [mesh, texture],
  );

  return <primitive object={mesh} />;
}

/** Sol intérieur : béton poli qui reflète les photos et la lumière. */
export function Floor({ tier }: { tier: QualityTier }) {
  const w = interiorFloor.x[1] - interiorFloor.x[0];
  const d = interiorFloor.z[0] - interiorFloor.z[1];
  const cx = (interiorFloor.x[0] + interiorFloor.x[1]) / 2;
  const cz = (interiorFloor.z[0] + interiorFloor.z[1]) / 2;
  const color = blend(brand.midnight, brand.white, 0.5);
  const map = useMemo(() => {
    const t = createFloorTexture(tier === "high" ? 1024 : 512);
    t.repeat.set(w / FLOOR_TILE, d / FLOOR_TILE);
    return t;
  }, [tier, w, d]);
  useEffect(() => () => map.dispose(), [map]);

  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position={[cx, 0.001, cz]} receiveShadow={tier === "high"}>
        <planeGeometry args={[w, d]} />
        {tier === "high" ? (
          <MeshReflectorMaterial
            resolution={1024}
            mirror={0.4}
            mixBlur={1.4}
            mixStrength={0.9}
            blur={[400, 120]}
            depthScale={0.6}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.2}
            map={map}
            bumpMap={map}
            bumpScale={0.4}
            color={color}
            roughness={0.7}
            metalness={0.1}
          />
        ) : (
          <meshStandardMaterial map={map} color={color} roughness={0.55} metalness={0.25} />
        )}
      </mesh>
      {/* Le paysage extérieur, plus mat. */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, -300]} receiveShadow={tier === "high"}>
        <planeGeometry args={[1600, 1600]} />
        <meshStandardMaterial color={blend(brand.midnight, brand.white, 0.05)} roughness={0.96} />
      </mesh>
    </>
  );
}

/** Surfaces de verre : légères, presque invisibles, qui captent un reflet. */
export function Glass() {
  return (
    <>
      {glassPanels.map((g, i) => (
        <group key={i} position={g.center} rotation-y={g.rotY}>
          <mesh renderOrder={4}>
            <planeGeometry args={g.size} />
            <meshPhysicalMaterial
              color={blend(brand.saloumBlue, brand.white, 0.6)}
              transparent
              opacity={0.1}
              roughness={0.05}
              metalness={0.2}
              envMapIntensity={2.2}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          {/* fins profilés métalliques haut et bas */}
          <mesh position={[0, g.size[1] / 2, 0]}>
            <boxGeometry args={[g.size[0], 0.06, 0.08]} />
            <meshStandardMaterial color="#2a2c38" metalness={0.8} roughness={0.35} />
          </mesh>
          <mesh position={[0, -g.size[1] / 2, 0]}>
            <boxGeometry args={[g.size[0], 0.06, 0.08]} />
            <meshStandardMaterial color="#2a2c38" metalness={0.8} roughness={0.35} />
          </mesh>
        </group>
      ))}
    </>
  );
}
