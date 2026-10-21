"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

/**
 * Cosmos 3D orbit gallery (21st.dev), adapté au site :
 *  - les particules sont un seul InstancedMesh (un appel de dessin au lieu
 *    de 1 500 maillages) ;
 *  - les photos sont recadrées (« cover ») au lieu d'être étirées ;
 *  - teintes dorées de la charte (Golden'Hope) ;
 *  - rotation coupée si l'utilisateur préfère réduire les animations.
 */

interface ParticleSphereProps {
  images: string[];
  /** Nombre de particules (moins sur mobile). */
  particleCount?: number;
  /** Rotation automatique. */
  spin?: boolean;
}

const PARTICLE_SIZE_MIN = 0.005;
const PARTICLE_SIZE_MAX = 0.01;
const SPHERE_RADIUS = 9;
const POSITION_RANDOMNESS = 4;
const ROTATION_SPEED_Y = 0.0005;
const IMAGE_SIZE = 1.5;

/** Golden'Hope (charte) : du doré profond au doré clair. */
const GOLDS = ["#DEAC59", "#E8BF6E", "#FDE79F"].map((c) => new THREE.Color(c));

export function ParticleSphere({ images, particleCount = 1500, spin = true }: ParticleSphereProps) {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  const textures = useTexture(images);

  // recadrage « cover » : chaque photo remplit son carré sans déformation
  useEffect(() => {
    for (const t of textures) {
      const img = t.image as { width: number; height: number } | undefined;
      if (!img?.width) continue;
      const a = img.width / img.height;
      t.colorSpace = THREE.SRGBColorSpace;
      if (a > 1) {
        t.repeat.set(1 / a, 1);
        t.offset.set((1 - 1 / a) / 2, 0);
      } else {
        t.repeat.set(1, a);
        t.offset.set(0, (1 - a) / 2);
      }
      t.needsUpdate = true;
    }
  }, [textures]);

  // particules sur une sphère (spirale de Fibonacci), avec une variation organique
  useEffect(() => {
    const mesh = particlesRef.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const pos = new THREE.Vector3();
    const scl = new THREE.Vector3();
    const col = new THREE.Color();
    for (let i = 0; i < particleCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;
      const r = SPHERE_RADIUS + (Math.random() - 0.5) * POSITION_RANDOMNESS;
      pos.set(r * Math.cos(theta) * Math.sin(phi), r * Math.cos(phi), r * Math.sin(theta) * Math.sin(phi));
      const s = Math.random() * (PARTICLE_SIZE_MAX - PARTICLE_SIZE_MIN) + PARTICLE_SIZE_MIN;
      scl.setScalar(s);
      m.compose(pos, q, scl);
      mesh.setMatrixAt(i, m);
      col.copy(GOLDS[i % 3]).lerp(GOLDS[(i + 1) % 3], Math.random());
      mesh.setColorAt(i, col);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [particleCount]);

  // les photos en anneau, face vers l'extérieur
  const orbiting = useMemo(() => {
    const n = images.length;
    return images.map((_, i) => {
      const angle = (i / n) * Math.PI * 2;
      const position = new THREE.Vector3(SPHERE_RADIUS * Math.cos(angle), 0, SPHERE_RADIUS * Math.sin(angle));
      const matrix = new THREE.Matrix4().lookAt(position, position.clone().multiplyScalar(2), new THREE.Vector3(0, 1, 0));
      const euler = new THREE.Euler().setFromRotationMatrix(matrix);
      return { position, rotation: euler };
    });
  }, [images]);

  useFrame(() => {
    if (spin && groupRef.current) groupRef.current.rotation.y += ROTATION_SPEED_Y;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={particlesRef} args={[undefined, undefined, particleCount]} frustumCulled={false}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {orbiting.map((o, i) => (
        <mesh key={i} position={o.position} rotation={o.rotation}>
          <planeGeometry args={[IMAGE_SIZE, IMAGE_SIZE]} />
          <meshBasicMaterial map={textures[i % textures.length]} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
