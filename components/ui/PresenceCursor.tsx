"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE = "a, button, [role='button'], input, textarea, select, label";

/**
 * Le curseur devient une présence : un point de lumière, et un halo qui le
 * suit avec retard (interpolation par frame, pas de transition CSS).
 * Uniquement avec une souris, jamais en mouvement réduit.
 */
export function PresenceCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const halo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced || !dot.current || !halo.current) return;

    const root = document.documentElement;
    root.classList.add("has-presence-cursor");
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { ...mouse };
    let visible = false;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!visible) {
        visible = true;
        ring.x = mouse.x;
        ring.y = mouse.y;
        root.classList.add("cursor-visible");
      }
      const target = e.target as Element | null;
      root.classList.toggle("cursor-hover", !!target?.closest?.(INTERACTIVE));
    };
    const onLeave = () => {
      visible = false;
      root.classList.remove("cursor-visible");
    };
    const onDown = () => root.classList.add("cursor-press");
    const onUp = () => root.classList.remove("cursor-press");

    const tick = () => {
      ring.x += (mouse.x - ring.x) * 0.16;
      ring.y += (mouse.y - ring.y) * 0.16;
      dot.current!.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
      halo.current!.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      root.classList.remove("has-presence-cursor", "cursor-visible", "cursor-hover", "cursor-press");
    };
  }, []);

  return (
    <>
      <div ref={halo} className="presence-cursor presence-cursor--halo" aria-hidden="true">
        <span />
      </div>
      <div ref={dot} className="presence-cursor presence-cursor--dot" aria-hidden="true">
        <span />
      </div>
    </>
  );
}
