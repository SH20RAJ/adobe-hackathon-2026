import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const viewport: Viewport = {
  themeColor: "#141414",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Adobe OmniAudit — Enterprise Brand AI-Readiness & GEO Studio",
    template: "%s | Adobe OmniAudit",
  },
  description:
    "Standard-compliant Agent Skill Marketplace (agentskills.io) built on Adobe Spectrum 2 design principles. Auditing website AI Discoverability (ACPI) and On-site Visitor Engagement (CRS) for Adobe University Hackathon 2026.",
  keywords: [
    "Adobe OmniAudit",
    "OmniAudit-GEO",
    "Generative Engine Optimization",
    "GEO Audit",
    "AEO",
    "Adobe Spectrum 2",
    "AI Discoverability",
    "Adobe Hackathon 2026",
    "agentskills.io",
    "Claude Code",
    "Perplexity SEO",
    "Schema.org JSON-LD",
  ],
  authors: [
    { name: "Shaswat Raj", url: "https://github.com/sh20raj" },
    { name: "Prithvi", url: "https://github.com/chikolavosaki-sys" },
  ],
  openGraph: {
    title: "Adobe OmniAudit — Enterprise Brand AI-Readiness & GEO Studio",
    description: "Standard-compliant Agent Skill Marketplace built with Adobe Spectrum 2 auditing website AI Discoverability and On-site Visitor Engagement.",
    url: "https://omniaudit-geo.shraj.workers.dev",
    siteName: "Adobe OmniAudit",
    images: [
      {
        url: "https://sh20raj.github.io/adobe-hackathon-2026/og-image.png",
        width: 1200,
        height: 630,
        alt: "Adobe OmniAudit - Brand AI Readiness Studio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adobe OmniAudit — Enterprise Brand AI-Readiness & GEO Studio",
    description: "Auditing website AI Discoverability (ACPI) and On-site Visitor Engagement (CRS) with Adobe Spectrum 2.",
    creator: "@sh20raj",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Source+Code+Pro:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-[#EB1000] selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
