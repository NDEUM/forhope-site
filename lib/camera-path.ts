import * as THREE from "three";
import { scenes, stepCenter, toGlobal } from "@/content/scenes";

/**
 * Le chemin de la caméra : deux courbes (position, point visé) passant par
 * tous les plans de la visite. Entre deux plans, une interpolation d'Hermite
 * dont la pente vaut (1 - dwell) : la caméra décélère là où il faut regarder.
 */
export function createCameraPath() {
  const keys = scenes.flatMap((scene, i) => scene.shots.map((s) => ({ ...s, t: toGlobal(i, s.at) })));
  const posCurve = new THREE.CatmullRomCurve3(
    keys.map((k) => new THREE.Vector3(...k.pos)),
    false,
    "centripetal",
  );
  const targetCurve = new THREE.CatmullRomCurve3(
    keys.map((k) => new THREE.Vector3(...k.target)),
    false,
    "centripetal",
  );
  const last = keys.length - 1;

  const hermite = (u: number, m0: number, m1: number) => {
    const u2 = u * u;
    const u3 = u2 * u;
    return (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) + (u3 - u2) * m1;
  };

  function sample(progress: number, outPos: THREE.Vector3, outTarget: THREE.Vector3) {
    let i = 0;
    while (i < last && keys[i + 1].t <= progress) i++;
    let s: number;
    let fov: number;
    if (progress <= keys[0].t) {
      s = 0;
      fov = keys[0].fov;
    } else if (i >= last) {
      s = 1;
      fov = keys[last].fov;
    } else {
      const a = keys[i];
      const b = keys[i + 1];
      const h = hermite((progress - a.t) / (b.t - a.t), 1 - a.dwell, 1 - b.dwell);
      s = (i + h) / last;
      fov = a.fov + (b.fov - a.fov) * h;
    }
    posCurve.getPoint(s, outPos);
    targetCurve.getPoint(s, outTarget);
    return fov;
  }

  return { sample };
}

/** Points de repos (mouvement réduit) : chaque cartel, l'entrée et la fin. */
export const restPoints = [0, ...scenes.flatMap((s, i) => s.steps.map((_, k) => toGlobal(i, stepCenter(s, k)))), 1];
