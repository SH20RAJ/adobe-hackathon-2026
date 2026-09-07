import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "OmniAudit-GEO — Enterprise Brand AI-Readiness & GEO Audit Marketplace",
    template: "%s | OmniAudit-GEO",
  },
  description:
    "Standard-compliant Agent Skill Marketplace (agentskills.io) auditing website AI Discoverability (ACPI) and On-site Visitor Engagement (CRS). Round 3 winner for Adobe University Hackathon 2026.",
  keywords: [
    "OmniAudit-GEO",
    "Generative Engine Optimization",
    "GEO Audit",
    "AEO",
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
    title: "OmniAudit-GEO — Enterprise Brand AI-Readiness Marketplace",
    description: "Standard-compliant Agent Skill Marketplace auditing website AI Discoverability and On-site Visitor Engagement.",
    url: "https://omniaudit-geo.shraj.workers.dev",
    siteName: "OmniAudit-GEO",
    images: [
      {
        url: "https://sh20raj.github.io/adobe-hackathon-2026/og-image.png",
        width: 1200,
        height: 630,
        alt: "OmniAudit-GEO - Brand AI Readiness Audit",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OmniAudit-GEO — Enterprise Brand AI-Readiness Marketplace",
    description: "Auditing website AI Discoverability (ACPI) and On-site Visitor Engagement (CRS).",
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
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary selection:text-primary-foreground">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
