"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * FlashlightTextReveal — une inscription sur un mur sombre, révélée par un
 * faisceau de lumière circulaire. Le mur est une texture organique animée
 * (WebGL natif, limitée au bloc du titre) ; le texte reste du HTML
 * accessible et sélectionnable : une couche « éteinte » toujours lisible, et
 * une couche dorée, décorative, masquée par le faisceau.
 *
 * - Souris : la lumière suit le curseur (avec inertie).
 * - Sans curseur (tactile, ou curseur hors du bloc) : elle dérive lentement.
 * - prefers-reduced-motion : lumière fixe, aucune animation.
 * - Onglet masqué, bloc hors de l'écran ou éteint (--flr-off ≥ 1) : la boucle s'arrête.
 * - Sans WebGL : un dégradé CSS remplace le mur.
 */

export interface FlashlightTextRevealProps {
  /** Le texte ; chaque élément du tableau (ou chaque « \n ») est une ligne. */
  text: string | string[];
  /** Élément HTML du titre. */
  as?: "h1" | "h2" | "p";
  className?: string;
  lineClassName?: string;
  wordClassName?: string;
  /** Rayon du faisceau, en px. */
  radius?: number;
  /** Couleur de la lumière (hexadécimal). */
  lightColor?: string;
  /** Contenu placé sous le titre (sous-titre, boutons…). */
  children?: ReactNode;
}

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform vec2 uLight;
uniform float uRadius;
uniform float uTime;
uniform vec3 uGold;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 11.7; a *= 0.5; }
  return v;
}

void main() {
  vec2 px = gl_FragCoord.xy;
  vec2 uv = px / uRes.y;
  // texture minérale : un fbm déformé par un autre, qui respire lentement
  vec2 q = vec2(fbm(uv * 2.2 + uTime * 0.012), fbm(uv * 2.2 - uTime * 0.009 + 4.0));
  float n = fbm(uv * 3.4 + q * 1.6);
  // relief : gradient de la texture, éclairé depuis la lampe
  float e = 1.5 / uRes.y;
  float nx = fbm((uv + vec2(e, 0.0)) * 3.4 + q * 1.6) - n;
  float ny = fbm((uv + vec2(0.0, e)) * 3.4 + q * 1.6) - n;
  vec3 nrm = normalize(vec3(-nx * 90.0, -ny * 90.0, 1.0));

  vec2 d = px - uLight;
  float dist = length(d);
  float beam = exp(-pow(dist / uRadius, 2.0) * 1.6);
  float halo = exp(-dist / (uRadius * 2.6)) * 0.35;
  vec3 ldir = normalize(vec3(-d / uRadius, 1.4));
  float shade = clamp(dot(nrm, ldir), 0.0, 1.0);

  // mur transparent : la scène (la Terre, l'espace) reste visible derrière ;
  // seule la lumière révèle la texture, comme un voile doré
  // la lumière rase le mur : le relief n'apparaît que dans le faisceau
  vec3 lit = uGold * (0.04 + shade * 0.24) * (0.55 + n * 0.7);
  // reflets dorés ponctuels, discrets
  float glint = pow(shade, 18.0) * smoothstep(0.55, 0.75, n) * 0.3;
  vec3 col = lit * beam + uGold * (halo * 0.05 + glint * beam);

  // bords fondus (ellipse) : le mur se dissout dans le noir alentour
  vec2 c = (px / uRes - 0.5) * 2.0;
  float a = 1.0 - smoothstep(0.35, 1.0, length(c));
  // alpha issu de la lumière elle-même : aucun assombrissement hors du faisceau
  vec3 c2 = col * a;
  gl_FragColor = vec4(c2, clamp(max(c2.r, max(c2.g, c2.b)) * 0.6, 0.0, 1.0));
}
`;

function hexToRgb(hex: string): [number, number, number] {
  const v = parseInt(hex.replace("#", ""), 16);
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

export function FlashlightTextReveal({
  text,
  as: Tag = "h1",
  className = "",
  lineClassName = "",
  wordClassName = "",
  radius = 190,
  lightColor = "#E8BF6E",
  children,
}: FlashlightTextRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const lines = Array.isArray(text) ? text : text.split("\n");
  const total = lines.join(" ").split(" ").length;

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    // --- WebGL (avec repli CSS) ---
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: false, alpha: true });
    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    const loc: Record<string, WebGLUniformLocation | null> = {};
    root.classList.remove("flr--nogl");
    if (gl && !gl.isContextLost()) {
      program = gl.createProgram()!;
      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.deleteProgram(program);
        program = null;
      }
    }
    if (gl && program) {
      gl.useProgram(program);
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const aPos = gl.getAttribLocation(program, "aPos");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
      for (const k of ["uRes", "uLight", "uRadius", "uTime", "uGold"]) loc[k] = gl.getUniformLocation(program, k);
      gl.uniform3fv(loc.uGold, hexToRgb(lightColor));
    } else {
      root.classList.add("flr--nogl");
    }

    // --- taille ---
    let w = 0;
    let h = 0;
    let beam = radius;
    let ox = 0; // décalage du canvas par rapport au bloc (il déborde pour fondre ses bords)
    let oy = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const rr = root.getBoundingClientRect();
      w = r.width;
      h = r.height;
      ox = r.left - rr.left;
      oy = r.top - rr.top;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      if (gl && program) gl.viewport(0, 0, canvas.width, canvas.height);
      // sur un bloc étroit (mobile), le faisceau rétrécit pour garder l'effet de révélation
      beam = Math.min(radius, Math.max(70, rr.width * 0.38));
      root.style.setProperty("--fr", `${beam.toFixed(0)}px`);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(root);

    // --- position de la lumière (coordonnées du bloc, px) ---
    let lx = root.clientWidth * 0.3;
    let ly = root.clientHeight * 0.45;
    let tx = lx;
    let ty = ly;
    let pointerAt = -1e9; // dernier mouvement de souris sur le bloc

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = root.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      // la lumière ne suit la souris que près du titre
      if (x > -beam && x < r.width + beam && y > -beam && y < r.height + beam) {
        tx = x;
        ty = y;
        pointerAt = performance.now();
      }
    };
    if (finePointer && !reduced) window.addEventListener("pointermove", onMove, { passive: true });

    const apply = (t: number) => {
      root.style.setProperty("--fx", `${lx.toFixed(1)}px`);
      root.style.setProperty("--fy", `${ly.toFixed(1)}px`);
      if (!gl || !program) return;
      gl.uniform2f(loc.uRes, canvas.width, canvas.height);
      // y inversé (WebGL) + passage en pixels du canvas
      gl.uniform2f(loc.uLight, (lx - ox) * dpr, canvas.height - (ly - oy) * dpr);
      gl.uniform1f(loc.uRadius, beam * dpr);
      gl.uniform1f(loc.uTime, t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    // --- boucle ---
    let raf = 0;
    let visible = true; // bloc à l'écran
    const start = performance.now();
    const frame = (now: number) => {
      raf = 0;
      const t = (now - start) / 1000;
      if (now - pointerAt > 2200) {
        // dérive lente, organique (courbe de Lissajous)
        tx = root.clientWidth * (0.5 + 0.42 * Math.sin(t * 0.23));
        ty = root.clientHeight * (0.5 + 0.38 * Math.sin(t * 0.31 + 1.2));
      }
      const k = now - pointerAt < 2200 ? 0.18 : 0.035;
      lx += (tx - lx) * k;
      ly += (ty - ly) * k;
      apply(t);
      schedule();
    };
    const schedule = () => {
      if (!raf && visible && !document.hidden && !reduced) raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    // Le bloc peut rester dans un plan collant mais être effacé : le parent le
    // signale avec la propriété CSS --flr-off (≥ 1 = éteint).
    let onScreen = true;
    const isOff = () => (parseFloat(getComputedStyle(root).getPropertyValue("--flr-off")) || 0) >= 1;
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      visible = onScreen && !isOff();
      if (visible) schedule();
      else stop();
    });
    io.observe(root);

    const onScroll = () => {
      const now = onScreen && !isOff();
      if (now !== visible) {
        visible = now;
        if (visible) schedule();
        else stop();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const onVis = () => (document.hidden ? stop() : schedule());
    document.addEventListener("visibilitychange", onVis);

    apply(0);
    schedule();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      if (gl) {
        if (buffer) gl.deleteBuffer(buffer);
        if (program) gl.deleteProgram(program);
        // pas de loseContext() : le canvas est réutilisé si l'effet est relancé (StrictMode)
      }
    };
  }, [radius, lightColor]);

  const renderLines = (lit: boolean) =>
    lines.map((line, l) => (
      <span key={l} className={lineClassName} style={{ ["--l" as string]: l } as CSSProperties}>
        {line.split(" ").map((word, j) => {
          const i = lines.slice(0, l).reduce((n, x) => n + x.split(" ").length, 0) + j;
          return (
            <span key={j} className={wordClassName} style={{ ["--i" as string]: i, ["--n" as string]: total } as CSSProperties}>
              <span>{word}</span>
              {/* espace réelle entre les mots pour la copie et les lecteurs d'écran */}
              {!lit && j < line.split(" ").length - 1 ? <span className="flr__sp"> </span> : null}
            </span>
          );
        })}
        {!lit && l < lines.length - 1 ? <span className="flr__sp"> </span> : null}
      </span>
    ));

  return (
    <div ref={rootRef} className={`flr ${className}`} style={{ ["--fr" as string]: `${radius}px` } as CSSProperties}>
      <canvas ref={canvasRef} className="flr__wall" aria-hidden="true" />
      <Tag className="flr__text">
        {renderLines(false)}
      </Tag>
      <div className="flr__text flr__text--lit" aria-hidden="true">
        {renderLines(true)}
      </div>
      {children}
    </div>
  );
}
