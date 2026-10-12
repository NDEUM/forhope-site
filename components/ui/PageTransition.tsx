"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";

/**
 * Transition entre les pages : trois bandes aux couleurs de la charte
 * (Midnight, Deep Blue, Saloum Blue) montent comme un rideau, le logo
 * apparaît, la nouvelle page se charge derrière, puis le rideau repart
 * vers le haut. Liens internes uniquement ; jamais en mouvement réduit.
 */
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const layer = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const covered = useRef(false);

  // Clic sur un lien interne (phase de capture) : on couvre, puis on navigue.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      // même page (ancre ou lien identique) : navigation normale
      if (url.pathname === location.pathname) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const el = layer.current;
      if (!el || busy.current) return;
      // Avant le gestionnaire de <Link> : c'est la transition qui déclenche la navigation.
      e.preventDefault();
      e.stopPropagation();
      busy.current = true;
      const bands = el.querySelectorAll(".pt-band");
      const logo = el.querySelector(".pt-logo");
      gsap.set(el, { visibility: "visible" });
      gsap
        .timeline({
          onComplete: () => {
            covered.current = true;
            router.push(url.pathname + url.search + url.hash);
            // Sécurité : si la page ne change pas (erreur, même adresse), on découvre quand même.
            window.setTimeout(() => {
              if (!covered.current) return;
              covered.current = false;
              gsap.to(bands, { yPercent: -100, duration: 0.6, ease: "expo.inOut", onComplete: () => gsap.set(el, { visibility: "hidden" }) });
              gsap.set(logo, { autoAlpha: 0 });
              busy.current = false;
            }, 5000);
          },
        })
        .fromTo(bands, { yPercent: 100 }, { yPercent: 0, duration: 0.75, ease: "expo.inOut", stagger: 0.08 })
        .fromTo(logo, { autoAlpha: 0, y: 20, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: "expo.out" }, "-=0.25");
    };
    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, [router]);

  // Nouvelle page affichée : le rideau se retire vers le haut.
  useEffect(() => {
    const el = layer.current;
    if (!el || !covered.current) return;
    covered.current = false;
    window.scrollTo(0, 0);
    const bands = Array.from(el.querySelectorAll(".pt-band")).reverse();
    gsap
      .timeline({
        delay: 0.15,
        onComplete: () => {
          gsap.set(el, { visibility: "hidden" });
          busy.current = false;
        },
      })
      .to(el.querySelector(".pt-logo"), { autoAlpha: 0, y: -16, duration: 0.35, ease: "power2.in" })
      .to(bands, { yPercent: -100, duration: 0.8, ease: "expo.inOut", stagger: 0.08 }, "-=0.1");
  }, [pathname]);

  return (
    <div ref={layer} className="pt" aria-hidden="true">
      <span className="pt-band pt-band--1" />
      <span className="pt-band pt-band--2" />
      <span className="pt-band pt-band--3" />
      <Image className="pt-logo" src="/brand/forhope-logo-blanc.png" alt="" width={1276} height={373} sizes="220px" />
    </div>
  );
}
