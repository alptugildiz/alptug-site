import type { Metadata, Viewport } from "next";
import { Doto, Geist, Geist_Mono, Pixelify_Sans, Unbounded } from "next/font/google";
import { bootInitScript } from "@/lib/boot";
import SmoothScroll from "@/components/fx/SmoothScroll";
import { experience, profile, skills } from "@/content/resume";
import "./globals.css";

const unbounded = Unbounded({ variable: "--font-unbounded", subsets: ["latin"], weight: ["400", "700", "900"] });
const pixelify = Pixelify_Sans({ variable: "--font-pixelify", subsets: ["latin"], weight: ["400", "500"] });
const doto = Doto({ variable: "--font-doto", subsets: ["latin"], weight: ["700", "900"] });
const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const title = `${profile.name} — ${profile.role}`;
const description = `${profile.role} in Istanbul building fast, crafted web interfaces with React, Next.js and TypeScript.`;

export const metadata: Metadata = {
  metadataBase: new URL(profile.site),
  title: { default: title, template: `%s — ${profile.name}` },
  description,
  keywords: ["Frontend Engineer", "React", "Next.js", "TypeScript", "Istanbul", profile.name],
  authors: [{ name: profile.name, url: profile.site }],
  alternates: { canonical: "/" },
  openGraph: { type: "profile", url: profile.site, title, description, siteName: profile.name, locale: "en_US" },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  themeColor: "#1b1b1b",
  colorScheme: "dark",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  url: profile.site,
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Istanbul", addressCountry: "TR" },
  worksFor: { "@type": "Organization", name: experience[0].company },
  alumniOf: { "@type": "CollegeOrUniversity", name: "Beykent University" },
  knowsAbout: Object.values(skills).flat(),
  sameAs: [profile.github, profile.linkedin],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${unbounded.variable} ${pixelify.variable} ${doto.variable} ${geist.variable} ${geistMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootInitScript }} />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
        <SmoothScroll>{children}</SmoothScroll>
        <div className="scanlines" aria-hidden />
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
