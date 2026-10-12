import Link from "next/link";

/** Les sous-rubriques d'une page, présentées comme des portes vers la suite. */
export function PageLinks({ links }: { links: { href: string; label: string; text?: string }[] }) {
  return (
    <ul className="page-links" data-reveal>
      {links.map((l) => (
        <li key={l.href}>
          <Link href={l.href} className="page-links__item">
            <span className="page-links__label">{l.label}</span>
            {l.text && <span className="page-links__text">{l.text}</span>}
            <span className="page-links__arrow" aria-hidden="true">→</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
