import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/navigation/SiteFooter";
import { PresenceCursor } from "@/components/ui/PresenceCursor";
import { PageTransition } from "@/components/ui/PageTransition";
import { site } from "@/content/site";
import { brand } from "@/lib/brand";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
  variable: "--font-roboto",
});

/**
 * Adresse publique du site, base des URL absolues (dont l'image de partage).
 * Sur Vercel : l'adresse de production du projet (le domaine officiel sert
 * encore l'ancien site ; il deviendra cette adresse une fois relié à Vercel).
 */
const publicUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : site.url;

export const metadata: Metadata = {
  metadataBase: new URL(publicUrl),
  title: {
    default: `${site.name} Association`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: site.fullName,
    title: `${site.name} Association`,
    description: site.description,
  },
  // Image de partage : app/opengraph-image.jpg et app/twitter-image.jpg (l'ouverture du site).
  twitter: {
    card: "summary_large_image",
    title: `${site.name} Association`,
    description: site.description,
  },
  icons: { icon: "/brand/forhope-avatar.png", apple: "/brand/forhope-avatar.png" },
};

export const viewport: Viewport = {
  themeColor: brand.midnight,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={roboto.variable} suppressHydrationWarning>
      <head>
        {/* Active la mise en page immersive avant le premier rendu (évite un flash). */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
        <PresenceCursor />
        <PageTransition />
      </body>
    </html>
  );
}
