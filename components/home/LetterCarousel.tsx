"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { photos, type PhotoKey } from "@/content/media";
import { site } from "@/content/site";
import { ButtonLink } from "@/components/ui/ButtonLink";

gsap.registerPlugin(ScrollTrigger);

const SLIDES: PhotoKey[] = ["enfantsGroupe", "benevolesEquipe", "sourirePortrait", "benevoleEnfants", "enfantsComplices", "benevolePouponniere", "enfantSourire", "enfantsForce"];
const DELAY = 3.2;

/** Image optimisée par Next (WebP/AVIF, 1600 px) pour l'élément SVG <image>. */
const optimized = (src: string) => `/_next/image?url=${encodeURIComponent(src)}&w=1920&q=75`;

/**
 * Carrousel de photos de l'association vu à travers les lettres « FOR HOPE »
 * (référence : maquette « Voices United »). Les photos se succèdent dans
 * les lettres avec un léger travelling ; au scroll, le mot se pose depuis
 * un plan très serré. Boutons, points et compteur restent accessibles.
 */
export function LetterCarousel() {
  const root = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [paused, setPaused] = useState(false);
  const indexRef = useRef(0);

  const show = useCallback((next: number) => {
    const el = root.current;
    if (!el) return;
    const n = (next + SLIDES.length) % SLIDES.length;
    const images = el.querySelectorAll<SVGImageElement>(".lc-slide");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    images.forEach((img, i) => {
      if (i === n) {
        gsap.set(img, { zIndex: 1 });
        gsap.fromTo(img, { opacity: 0, scale: 1.12, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: reduced ? 0 : 1.4, ease: "expo.out", overwrite: true });
      } else if (i === indexRef.current) {
        gsap.to(img, { opacity: 0, duration: reduced ? 0 : 1.1, ease: "power2.inOut", overwrite: true });
      }
    });
    indexRef.current = n;
    setIndex(n);
  }, []);

  // Chargement différé : les photos ne sont demandées qu'à l'approche de la section.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLoaded(true);
          io.disconnect();
        }
      },
      { rootMargin: "800px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Défilement automatique (jamais en mouvement réduit, en pause au survol ou au focus).
  useEffect(() => {
    if (!loaded || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => show(indexRef.current + 1), DELAY * 1000);
    return () => window.clearInterval(id);
  }, [loaded, paused, show]);

  // Entrée : le mot arrive depuis un plan très serré, puis se pose.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        el.querySelector(".lc-word"),
        { scale: 2.6, yPercent: 8 },
        { scale: 1, yPercent: 0, ease: "none", scrollTrigger: { trigger: el, start: "top 95%", end: "top 15%", scrub: 0.8 } },
      );
      gsap.from(el.querySelectorAll(".lc-ui > *"), {
        y: 30,
        autoAlpha: 0,
        duration: 1,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: "top 35%", toggleActions: "play none none none" },
      });
    });
    return () => mm.revert();
  }, []);

  const current = photos[SLIDES[index]];

  return (
    <section
      ref={root}
      className="lc"
      aria-roledescription="carrousel"
      aria-label="Photos de l'association"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="lc-stage">
        <svg className="lc-word" viewBox="0 0 1000 560" role="img" aria-label={`For Hope — ${current.alt}`}>
          <defs>
            <clipPath id="lc-letters">
              <text x="500" y="262" textAnchor="middle" className="lc-letters">
                FOR
              </text>
              <text x="500" y="540" textAnchor="middle" className="lc-letters">
                HOPE
              </text>
            </clipPath>
          </defs>
          {/* fond des lettres tant que les photos chargent */}
          <rect width="1000" height="560" className="lc-placeholder" clipPath="url(#lc-letters)" />
          <g clipPath="url(#lc-letters)">
            {SLIDES.map((k, i) => (
              <image
                key={k}
                className="lc-slide"
                href={loaded || i === 0 ? optimized(photos[k].src) : undefined}
                width="1000"
                height="560"
                preserveAspectRatio="xMidYMid slice"
                style={{ opacity: i === 0 ? 1 : 0 }}
              />
            ))}
          </g>
        </svg>
      </div>

      <div className="lc-ui">
        <p className="lc-caption" aria-live="polite">
          <span className="lc-count">
            {String(index + 1).padStart(2, "0")} <span>/ {String(SLIDES.length).padStart(2, "0")}</span>
          </span>
          {current.alt}
        </p>
        <div className="lc-controls">
          <button type="button" className="fh-nav__btn" onClick={() => show(index - 1)} aria-label="Photo précédente">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
          <div className="lc-dots" role="tablist" aria-label="Choisir une photo">
            {SLIDES.map((k, i) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Photo ${i + 1}`}
                className={`lc-dot${i === index ? " is-active" : ""}`}
                onClick={() => show(i)}
              >
                <span style={{ animationDuration: `${DELAY}s`, animationPlayState: paused ? "paused" : "running" }} />
              </button>
            ))}
          </div>
          <button type="button" className="fh-nav__btn" onClick={() => show(index + 1)} aria-label="Photo suivante">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
        </div>
        <div className="lc-ctas">
          <ButtonLink href={site.donateHref} variant="solid" magnetic>
            Faire un don
          </ButtonLink>
          <ButtonLink href="/agir#benevole" variant="outline" magnetic>
            Devenir bénévole
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
