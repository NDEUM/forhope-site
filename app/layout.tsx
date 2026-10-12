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

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
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
