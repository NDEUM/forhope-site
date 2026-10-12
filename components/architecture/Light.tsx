"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { beams, sideSlot, skylights, sunDirection } from "@/content/architecture";
import { brand, blend } from "@/lib/brand";
import { smoothstep } from "@/lib/math";
import { experience } from "@/lib/experience-store";
import type { QualityTier } from "@/lib/experience-store";

const SUN = new THREE.Vector3(...sunDirection).normalize();
const SUN_COLOR = blend(brand.white, brand.goldLight, 0.22);
const FOG_COLOR = blend(brand.midnight, brand.white, 0.045);

/**
 * Lumière naturelle simulée : un soleil rasant qui entre par les fentes
 * (ombres portées), un ciel bleu très doux, une brume légère.
 * La zone d'ombre suit la caméra pour rester nette où l'on regarde.
 */
export function Light({ tier }: { tier: QualityTier }) {
  const scene = useThree((s) => s.scene);
  const gl = useThree((s) => s.gl);
  const sun = useRef<THREE.DirectionalLight>(null);
  const fog = useMemo(() => new THREE.FogExp2(FOG_COLOR, 0.011), []);
  const tmp = useMemo(
    () => ({
      fwd: new THREE.Vector3(),
      focus: new THREE.Vector3(),
      night: new THREE.Color(brand.midnight).multiplyScalar(0.6),
      day: new THREE.Color(FOG_COLOR),
    }),
    [],
  );

  useEffect(() => {
    scene.fog = fog;
    scene.background = new THREE.Color(FOG_COLOR);
    return () => {
      scene.fog = null;
      scene.background = null;
    };
  }, [scene, fog]);

  useFrame(({ camera }) => {
    // Premier écran : presque noir, puis les yeux s'habituent au fil des premiers scrolls.
    const wake = experience.reducedMotion ? 1 : smoothstep(0.002, 0.04, experience.smooth);
    // Au chargement, la lumière s'ouvre d'elle-même (hero), puis le scroll achève l'éveil.
    const dawn = 0.2 + experience.intro * 0.32;
    gl.toneMappingExposure = dawn + (1.3 - dawn) * wake;
    // Au tout début, la brume est presque noire : on devine plus qu'on ne voit.
    fog.color.copy(tmp.night).lerp(tmp.day, wake);
    if (scene.background instanceof THREE.Color) scene.background.copy(fog.color);
    // Dehors et en altitude, la brume s'ouvre : on découvre le bâtiment entier.
    const outside = Math.max(smoothstep(-426, -444, camera.position.z), smoothstep(14, 60, camera.position.y));
    fog.density = 0.011 + (1 - wake) * 0.03 - outside * 0.0085;

    const light = sun.current;
    if (!light) return;
    // En altitude, le jour baisse : ce sont les photographies qui éclairent le bâtiment.
    const dusk = smoothstep(25, 120, camera.position.y);
    // Sans ombres (mobile), le soleil traverserait les toits : on le tempère.
    light.intensity = (tier === "high" ? 5.6 : 1.3) * (1 - dusk * 0.75);
    // De très haut, les ombres (carte étirée) s'effacent au lieu de pixelliser.
    light.shadow.intensity = 1 - smoothstep(40, 110, camera.position.y);
    camera.getWorldDirection(tmp.fwd);
    tmp.focus.copy(camera.position).addScaledVector(tmp.fwd, 18);
    tmp.focus.y = 0;
    light.target.position.copy(tmp.focus);
    light.position.copy(tmp.focus).addScaledVector(SUN, -90);
    light.target.updateMatrixWorld();
    if (light.castShadow) {
      const extent = 42 + Math.max(0, camera.position.y - 20) * 1.3;
      const cam = light.shadow.camera as THREE.OrthographicCamera;
      if (Math.abs(cam.right - extent) > 1) {
        cam.left = cam.bottom = -extent;
        cam.right = cam.top = extent;
        cam.updateProjectionMatrix();
      }
    }
  });

  return (
    <>
      {/* Ciel au-dessus, et en dessous la lumière renvoyée par le sol clair : les plafonds ne sont plus noirs. */}
      <hemisphereLight args={[blend(brand.white, brand.hopeBlue, 0.18), blend(brand.midnight, blend(brand.white, brand.goldLight, 0.2), 0.42), 1.05]} />
      {/* Lumière renvoyée par le sol et les murs (sans ombre) : donne du modelé aux volumes. */}
      <directionalLight color={blend(brand.white, brand.hopeBlue, 0.25)} intensity={0.8} position={[30, 12, -60]} />
      <directionalLight
        ref={sun}
        color={SUN_COLOR}
        intensity={5.6}
        castShadow={tier === "high"}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.05}
        shadow-camera-near={1}
        shadow-camera-far={220}
      />
      {/* Reflets doux pour le verre, le métal et le sol poli (générés localement). */}
      <Environment resolution={256} frames={1} environmentIntensity={0.7}>
        <Lightformer form="rect" intensity={2.2} color={brand.white} position={[0, 12, -6]} scale={[22, 2, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.2} color={brand.saloumBlue} position={[-14, 4, 0]} scale={[2, 10, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={0.8} color={brand.hopeBlue} position={[14, 4, 0]} scale={[2, 10, 1]} rotation-y={-Math.PI / 2} />
      </Environment>
    </>
  );
}

/** Fentes zénithales et fente verticale : des bandes de ciel lumineux. */
export function Skylights({ tier }: { tier: QualityTier }) {
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        // En qualité haute, le ciel est « surexposé » pour que le halo (bloom) le prenne.
        color: new THREE.Color(blend(brand.white, brand.saloumBlue, 0.15)).multiplyScalar(tier === "high" ? 2.4 : 0.8),
        toneMapped: false,
        side: THREE.DoubleSide,
        fog: false,
      }),
    [tier],
  );
  useEffect(() => () => material.dispose(), [material]);

  return (
    <>
      {skylights.map((s, i) => {
        const w = s.x[1] - s.x[0];
        const d = Math.abs(s.z[1] - s.z[0]);
        return (
          <mesh key={i} material={material} rotation-x={Math.PI / 2} position={[(s.x[0] + s.x[1]) / 2, s.y + 0.4, (s.z[0] + s.z[1]) / 2]}>
            <planeGeometry args={[w, d]} />
          </mesh>
        );
      })}
      <mesh material={material} rotation-y={Math.PI / 2} position={[sideSlot.x, (sideSlot.y[0] + sideSlot.y[1]) / 2, (sideSlot.z[0] + sideSlot.z[1]) / 2]}>
        <planeGeometry args={[Math.abs(sideSlot.z[1] - sideSlot.z[0]), sideSlot.y[1] - sideSlot.y[0]]} />
      </mesh>
    </>
  );
}

/** Faisceaux de lumière dans la brume (feuilles additives orientées comme le soleil). */
export function Beams() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(SUN_COLOR) }, uOpacity: { value: 0.07 } },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          varying float vDepth;
          void main() {
            vUv = uv;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vDepth = -mv.z;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          uniform float uOpacity;
          varying vec2 vUv;
          varying float vDepth;
          void main() {
            float across = pow(1.0 - abs(vUv.x * 2.0 - 1.0), 1.4);
            float along = smoothstep(0.0, 0.06, vUv.y) * smoothstep(1.0, 0.9, vUv.y) * mix(0.45, 1.0, vUv.y);
            float near = smoothstep(0.5, 4.0, vDepth);
            float a = across * along * near * uOpacity;
            gl_FragColor = vec4(uColor, a);
            #include <colorspace_fragment>
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    [],
  );
  const strong = useMemo(() => {
    const m = material.clone();
    m.uniforms.uOpacity.value = 0.13;
    return m;
  }, [material]);
  useEffect(() => () => {
    material.dispose();
    strong.dispose();
  }, [material, strong]);

  const sheets = useMemo(() => {
    const up = SUN.clone().negate();
    return beams.flatMap((b) => {
      const center = new THREE.Vector3(...b.top).addScaledVector(SUN, b.length / 2);
      const x = new THREE.Vector3(1, 0, 0).addScaledVector(up, -up.x).normalize();
      const z = new THREE.Vector3().crossVectors(x, up).normalize();
      const make = (axis: THREE.Vector3, width: number) => {
        const normal = new THREE.Vector3().crossVectors(axis, up).normalize();
        const m = new THREE.Matrix4().makeBasis(axis, up, normal);
        return { center, quaternion: new THREE.Quaternion().setFromRotationMatrix(m), width, length: b.length };
      };
      const strength = (b as { strength?: number }).strength ?? 1;
      return [make(x, b.width), make(z, b.depth)].map((s) => ({ ...s, strength }));
    });
  }, []);

  return (
    <>
      {sheets.map((s, i) => (
        <mesh key={i} material={s.strength > 1 ? strong : material} position={s.center} quaternion={s.quaternion} renderOrder={5}>
          <planeGeometry args={[s.width, s.length]} />
        </mesh>
      ))}
    </>
  );
}

/** Ciel extérieur : nuit bleue, horizon à peine plus clair. */
export function SkyDome() {
  const mesh = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTop: { value: new THREE.Color(brand.midnight) },
        uHorizon: { value: new THREE.Color(blend(brand.midnight, brand.deepBlue, 0.55)) },
        uGlow: { value: new THREE.Color(brand.saloumBlue) },
        uFog: { value: new THREE.Color(FOG_COLOR) },
      },
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uTop;
        uniform vec3 uHorizon;
        uniform vec3 uGlow;
        uniform vec3 uFog;
        varying vec3 vDir;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        void main() {
          vec3 d = normalize(vDir);
          // Ciel de crépuscule : il naît de la brume à l'horizon (aucune ligne
          // dure avec le sol), garde une lueur bleue juste au-dessus, puis
          // s'assombrit vers le zénith.
          float y = max(d.y, 0.0);
          vec3 col = mix(uFog, uHorizon, smoothstep(0.0, 0.12, y));
          col = mix(col, uTop, smoothstep(0.08, 0.7, y));
          col += uGlow * 0.07 * exp(-y * 9.0) * smoothstep(0.0, 0.04, y);
          gl_FragColor = vec4(col, 1.0);
          #include <colorspace_fragment>
          gl_FragColor.rgb += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    });
    const m = new THREE.Mesh(new THREE.SphereGeometry(1400, 32, 16), mat);
    m.renderOrder = -10;
    m.frustumCulled = false;
    return m;
  }, []);

  useEffect(
    () => () => {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    },
    [mesh],
  );

  useFrame(({ camera, scene }) => {
    mesh.position.copy(camera.position);
    // L'horizon prend la couleur exacte de la brume du moment.
    if (scene.fog) (mesh.material as THREE.ShaderMaterial).uniforms.uFog.value.copy(scene.fog.color);
  });
  return <primitive object={mesh} />;
}

/**
 * Hero : le soleil passe par la fente verticale du Seuil. Le mur fait
 * écran (ombre portée), si bien que seule une lame de lumière traverse la
 * pièce et se pose au sol. Elle s'ouvre au chargement (experience.intro).
 */
export function SlotSun() {
  const light = useRef<THREE.SpotLight>(null);
  const cz = (sideSlot.z[0] + sideSlot.z[1]) / 2;
  useEffect(() => {
    const l = light.current;
    if (!l) return;
    // Le rayon passe dans la fente, frôle le monolithe et se pose au premier plan.
    l.target.position.set(-5, 0, cz + 12);
    l.target.updateMatrixWorld();
  }, [cz]);
  useFrame(({ camera }) => {
    const l = light.current;
    if (!l) return;
    // Uniquement autour du Seuil : au-delà, la lumière s'éteint (et ne coûte rien).
    const near = 1 - smoothstep(-45, -80, camera.position.z);
    l.intensity = 2600 * experience.intro * near;
    l.visible = near > 0.001;
  });
  return (
    <spotLight
      ref={light}
      position={[sideSlot.x - 3.6, 10, cz - 7]}
      color={SUN_COLOR}
      angle={0.42}
      penumbra={0.25}
      decay={2}
      distance={0}
      intensity={0}
      castShadow
      shadow-mapSize={[1024, 1024]}
      shadow-bias={-0.0006}
      shadow-normalBias={0.04}
      shadow-camera-near={1}
      shadow-camera-far={70}
    />
  );
}
