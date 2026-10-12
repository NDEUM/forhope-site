"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navigation } from "@/content/site";

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={`site-header ${isHome ? "site-header--immersive" : "site-header--solid"} ${open ? "is-open" : ""}`}>
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>
      {isHome && (
        <a className="skip-link" href="#association">
          Passer le voyage
        </a>
      )}
      <div className="site-header__bar">
        <Link href="/" className="site-header__logo" aria-label="For Hope — accueil">
          <Image className="logo--on-dark" src="/brand/forhope-logo-blanc.png" alt="" width={1276} height={373} priority sizes="140px" />
          <Image className="logo--on-light" src="/brand/forhope-logo-bleu.png" alt="" width={1275} height={373} sizes="140px" />
        </Link>
        <button
          type="button"
          className="site-header__toggle"
          aria-expanded={open}
          aria-controls="menu-principal"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="visually-hidden">{open ? "Fermer le menu" : "Ouvrir le menu"}</span>
          <span className="site-header__toggle-lines" aria-hidden="true" />
        </button>
        <nav id="menu-principal" className="site-nav" aria-label="Navigation principale">
          <ul>
            {navigation.map((item) => {
              const inSection = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href} className={item.children ? "site-nav__item site-nav__item--parent" : "site-nav__item"}>
                  <Link
                    href={item.href}
                    className={`site-nav__link ${item.emphasis ? "site-nav__link--cta" : ""}`}
                    aria-current={pathname === item.href ? "page" : inSection ? "true" : undefined}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <ul className="site-nav__sub" aria-label={item.label}>
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link href={child.href} className="site-nav__sublink" aria-current={pathname === child.href ? "page" : undefined}>
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      {isHome && (
        <div className="journey-progress" aria-hidden="true">
          <span />
        </div>
      )}
    </header>
  );
}
