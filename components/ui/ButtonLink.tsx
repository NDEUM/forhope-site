"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Bouton-lien de la charte. `magnetic` : le bouton dérive de quelques pixels
 * vers la souris (souris uniquement, jamais en mouvement réduit). Le retour au
 * repos est la seule phase qui s'anime, comme un objet physique.
 */
export function ButtonLink({
  href,
  variant = "solid",
  magnetic = false,
  shine = false,
  arrow = false,
  children,
}: {
  href: string;
  variant?: "solid" | "outline";
  magnetic?: boolean;
  /** Reflet continu : réservé à UN seul bouton principal par écran. */
  shine?: boolean;
  arrow?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!magnetic || !el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const strength = 0.22;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transition = "transform 60ms ease-out";
      el.style.transform = `translate(${(dx * strength).toFixed(1)}px, ${(dy * strength).toFixed(1)}px)`;
    };
    const onLeave = () => {
      el.style.transition = "transform 420ms cubic-bezier(0.16, 1, 0.3, 1)";
      el.style.transform = "";
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [magnetic]);

  return (
    <Link ref={ref} href={href} className={`button button--${variant}${shine ? " button--shine" : ""}`}>
      <span className="button__label">{children}</span>
      {arrow && (
        <svg className="button__arrow" width="14" height="10" viewBox="0 0 14 10" aria-hidden="true">
          <path d="M1 5h12M9 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      )}
    </Link>
  );
}
