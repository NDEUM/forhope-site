import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";

/**
 * Footer global For Hope — adaptation de « footer-section » (21st.dev) au
 * projet : CSS de la charte (pas de Tailwind/shadcn), contenu réel de
 * l'association, sans bascule de thème (le site a une direction artistique
 * unique), sans newsletter simulée (aucun service d'inscription configuré).
 */

const navigationLinks = [
  { href: "/", label: "Accueil" },
  { href: "/notre-histoire", label: "À propos" },
  { href: "/notre-histoire/domaines-d-action", label: "Nos actions" },
  { href: "/evenements", label: "Événements" },
  { href: "/agir", label: "Agir avec nous" },
  { href: "/contact", label: "Contact" },
];

const icons: Record<string, React.ReactNode> = {
  Instagram: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
    </svg>
  ),
  Facebook: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.6 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.9v3h2.6V21h3.1z" fill="currentColor" />
    </svg>
  ),
  LinkedIn: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.5 9h3v11h-3zM6 3.8a1.8 1.8 0 110 3.6 1.8 1.8 0 010-3.6zM10 9h2.9v1.5h.1c.4-.8 1.4-1.7 3-1.7 3.1 0 3.7 2 3.7 4.7V20h-3v-5.8c0-1.4 0-3.1-1.9-3.1s-2.2 1.5-2.2 3V20h-3z" fill="currentColor" />
    </svg>
  ),
};

/** Seuls les comptes dont l'adresse officielle est renseignée (content/site.ts) sont affichés. */
const officialSocials = site.socials.filter((s) => s.href && s.href !== "#");

export function FooterSection() {
  const year = new Date().getFullYear();
  const domain = site.url.replace(/^https?:\/\//, "");

  return (
    <footer className="ft" aria-labelledby="ft-title">
      <div className="ft__glow" aria-hidden="true" />
      <div className={`ft__inner${officialSocials.length ? "" : " ft__inner--3"}`}>
        {/* 1 — L'association */}
        <div className="ft__col ft__col--intro">
          <p className="ft__eyebrow">For Hope Association</p>
          <h2 id="ft-title" className="ft__title">
            De la nuit à l&apos;espoir
          </h2>
          <p className="ft__text">
            Ensemble, faisons grandir l&apos;espoir et construisons un avenir meilleur pour les communautés que nous accompagnons.
          </p>
          <div className="ft__ctas">
            <Link href="/agir" className="ft__cta ft__cta--solid">
              Rejoindre l&apos;association
            </Link>
            <Link href="/contact" className="ft__cta">
              Nous écrire
            </Link>
          </div>
        </div>

        {/* 2 — Navigation */}
        <nav className="ft__col" aria-labelledby="ft-nav">
          <h3 id="ft-nav" className="ft__heading">
            Navigation
          </h3>
          <ul className="ft__list">
            {navigationLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="ft__link">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 3 — Contact : uniquement les coordonnées officielles disponibles */}
        <div className="ft__col">
          <h3 className="ft__heading">Contact</h3>
          <ul className="ft__list">
            <li>
              <span className="ft__label">E-mail</span>
              <a href={`mailto:${site.email}`} className="ft__link">
                {site.email}
              </a>
            </li>
            <li>
              <span className="ft__label">Téléphone</span>
              <a href={site.phone.href} className="ft__link">
                {site.phone.display}
              </a>
            </li>
            <li>
              <span className="ft__label">Site officiel</span>
              <a href={site.url} className="ft__link">
                {domain}
              </a>
            </li>
          </ul>
        </div>

        {/* 4 — Suivre For Hope (affiché dès qu'une adresse officielle est renseignée) */}
        {officialSocials.length > 0 && (
          <div className="ft__col">
            <h3 className="ft__heading">Suivre For Hope</h3>
            <ul className="ft__socials">
              {officialSocials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} className="ft__social" target="_blank" rel="noopener noreferrer" aria-label={`${s.label} (nouvel onglet)`} title={s.label}>
                    {icons[s.label]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Bas de page */}
      <div className="ft__bottom">
        <Link href="/" className="ft__logo" aria-label="For Hope — accueil">
          <Image src="/brand/forhope-logo-blanc.png" alt="" width={1276} height={373} sizes="120px" />
        </Link>
        <p className="ft__legal">
          © {year} {site.fullName}
        </p>
        <Link href="/mentions-legales" className="ft__link ft__link--small">
          Mentions légales
        </Link>
      </div>
    </footer>
  );
}
