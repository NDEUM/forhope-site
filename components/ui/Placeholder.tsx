import type { ReactNode } from "react";

/** Marque visible d'un contenu provisoire, à remplacer avant mise en ligne. */
export function Placeholder({ children }: { children: ReactNode }) {
  return (
    <p className="placeholder">
      <span className="placeholder__dot" aria-hidden="true" />
      Contenu provisoire · {children}
    </p>
  );
}
