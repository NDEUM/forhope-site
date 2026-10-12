import * as THREE from "three";

/**
 * Matériau « lumière douce » pour InstancedMesh de quads orientés caméra
 * (billboards calculés dans le vertex shader). Un seul draw call par champ :
 * étoiles, poussières, brumes, lumières humaines, constellation.
 */
export function createGlowMaterial({
  color = "#ffffff",
  core = 0.18,
  fogFade = 0.85,
  additive = true,
}: { color?: string; core?: number; fogFade?: number; additive?: boolean } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      {
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: 1 },
        uCore: { value: core },
        uFogFade: { value: fogFade },
      },
    ]),
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vTint;
      #include <fog_pars_vertex>
      void main() {
        vUv = uv;
        #ifdef USE_INSTANCING_COLOR
          vTint = instanceColor;
        #else
          vTint = vec3(1.0);
        #endif
        vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float s = length(instanceMatrix[0].xyz);
        mvPosition.xy += position.xy * s;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uCore;
      uniform float uFogFade;
      varying vec2 vUv;
      varying vec3 vTint;
      #include <fog_pars_fragment>
      void main() {
        float d = length(vUv - 0.5) * 2.0;
        float halo = pow(clamp(1.0 - d, 0.0, 1.0), 2.4);
        float core = uCore > 0.0 ? 1.0 - smoothstep(0.0, uCore, d) : 0.0;
        float a = (halo * 0.55 + core) * uOpacity;
        #ifdef USE_FOG
          #ifdef FOG_EXP2
            float fogF = 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
          #else
            float fogF = smoothstep(fogNear, fogFar, vFogDepth);
          #endif
          a *= 1.0 - fogF * uFogFade;
        #endif
        if (a < 0.002) discard;
        gl_FragColor = vec4(uColor * vTint, a);
        #include <colorspace_fragment>
      }
    `,
    fog: true,
    transparent: true,
    depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
}

export const quadGeometry = () => new THREE.PlaneGeometry(1, 1);
