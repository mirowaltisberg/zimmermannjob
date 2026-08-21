import type { Metadata, Viewport } from "next";
import { JsonLd } from "@/components/json-ld";
import { HapticProvider } from "@/components/haptic-provider";
import { PrivacyAnalytics } from "@/components/privacy-analytics";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zimmermannjob.ch";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Zimmermann Jobs Schweiz | Stellen für Zimmermann-Fachkräfte",
    template: "%s | zimmermannjob.ch",
  },
  description:
    "Finde Stellen für Zimmerleute, Holzbau-Fachpersonen, Montage, AVOR und Projektleitung Holzbau in der Schweiz.",
  keywords: [
    "Zimmermannjobs",
    "Zimmermannjobs Schweiz",
    "Zimmermann Jobs",
    "Projektleiter Zimmermann",
    "Holzbau Montage",
    "AVOR Holzbau Jobs",
    "Holzbautechniker Jobs",
    "Stellen Holzbau Schweiz",
    "Zimmermann Job Schweiz",
    "Zimmermann Stellen Schweiz",
    "Zimmermann Stellenangebote",
    "Holzbaumonteur Jobs Schweiz",
    "Zimmermann Temporär",
    "Zimmermann Festanstellung",
    "Zimmermann Lohn Schweiz",
  ],
  openGraph: {
    title: "Zimmermann Jobs Schweiz | Stellenangebote",
    description:
      "Finde Stellenangebote für Zimmerleute, Holzbau-Fachpersonen, Montage, AVOR und Projektleitung Holzbau.",
    type: "website",
    url: "/",
    siteName: "zimmermannjob.ch",
    locale: "de_CH",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zimmermann Jobs Schweiz | Stellenangebote",
    description:
      "Finde Stellenangebote für Zimmerleute, Holzbau-Fachpersonen, Montage, AVOR und Projektleitung Holzbau.",
  },
  alternates: {
    canonical: "/",
    languages: {
      "de-CH": "/",
      "x-default": "/",
    },
  },
  verification: {
    google: "el7V2RsquLlGsWyjTfpIu0taGlVTafpyDuinuMxx_Tc",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "zimmermannjob.ch",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  description:
    "zimmermannjob.ch bündelt Stellenangebote mit klarem Bezug zum Zimmermanngewerk in der Schweiz.",
  areaServed: {
    "@type": "Country",
    name: "Switzerland",
    alternateName: "Schweiz",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: "German",
    url: `${SITE_URL}/kontakt`,
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "zimmermannjob.ch",
  url: SITE_URL,
  description:
    "Die spezialisierte Jobbörse für Zimmermann-Fachkräfte in der Schweiz.",
  inLanguage: "de-CH",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de-CH">
      <body lang="de-CH" className="antialiased font-sans">
        <a className="skip-link" href="#main-content">
          Zum Inhalt
        </a>
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        <HapticProvider>{children}</HapticProvider>
        <PrivacyAnalytics />
      </body>
    </html>
  );
}
