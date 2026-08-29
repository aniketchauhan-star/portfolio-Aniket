import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Geist, Geist_Mono } from "next/font/google";
import { profile } from "@/data/profile";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

/**
 * The origin the site is served from, or "" when it has not been set.
 *
 * Everything derived from it is omitted while it is empty: `new URL("")`
 * throws, and a canonical tag pointing at the wrong domain is worse for SEO
 * than no canonical tag at all.
 */
const siteUrl = profile.seo.siteUrl;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: {
    default: profile.seo.title,
    template: `%s — ${profile.name}`,
  },
  description: profile.seo.description,
  keywords: [...profile.seo.keywords],
  authors: [{ name: profile.name, url: profile.linkedin }],
  creator: profile.name,
  ...(siteUrl ? { alternates: { canonical: "/" } } : {}),
  openGraph: {
    type: "website",
    ...(siteUrl ? { url: siteUrl } : {}),
    siteName: profile.seo.title,
    title: profile.seo.title,
    description: profile.seo.description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: profile.seo.title,
    description: profile.seo.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "portfolio",
};

export const viewport: Viewport = {
  themeColor: "#030407",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/**
 * Structured data. Only facts that exist in `profile.ts` are emitted — no
 * employer, no education and no job title is asserted unless it has been
 * filled in there.
 */
function personJsonLd() {
  const sameAs = [
    profile.linkedin,
    profile.github,
    ...profile.extraLinks.map((l) => l.href),
  ].filter(Boolean);

  // The current position and school, taken from the same source as the page.
  const current = profile.experience[0];
  const school = profile.education[0];

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    ...(siteUrl ? { url: siteUrl } : {}),
    description: profile.intro,
    ...(profile.headline ? { jobTitle: profile.headline } : {}),
    ...(profile.locality || profile.country
      ? {
          address: {
            "@type": "PostalAddress",
            ...(profile.locality ? { addressLocality: profile.locality } : {}),
            ...(profile.country ? { addressCountry: profile.country } : {}),
          },
        }
      : {}),
    ...(current && !current.placeholder
      ? { worksFor: { "@type": "Organization", name: current.company } }
      : {}),
    ...(school && !school.placeholder
      ? {
          alumniOf: {
            "@type": "EducationalOrganization",
            name: school.institution,
          },
        }
      : {}),
    ...(profile.email ? { email: `mailto:${profile.email}` } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${geist.variable} ${geistMono.variable}`}
    >
      <body>
        <a
          href="#top"
          className="sr-only rounded-full px-4 py-2 focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300] focus:bg-[var(--color-panel)] focus:text-[var(--color-ink)]"
        >
          Skip to content
        </a>
        {children}
        <script
          type="application/ld+json"
          // Data comes from a local module, not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }}
        />
      </body>
    </html>
  );
}
