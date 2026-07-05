import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { Providers } from "@/components/providers";
import { AppBackground } from "@/components/layout/AppBackground";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "FINVERSE AI — India's Responsible AI Wealth Operating System",
    template: "%s | FINVERSE AI",
  },
  description:
    "AI-powered portfolio analytics, scenario simulation, and explainable intelligence — built for the Indian market with full SEBI, RBI, and DPDP compliance.",
  keywords: [
    "wealth management",
    "AI",
    "fintech",
    "India",
    "portfolio",
    "SEBI",
    "RBI",
    "responsible AI",
    "Monte Carlo",
    "digital twin",
  ],
  authors: [{ name: "FINVERSE AI" }],
  icons: {
    icon: [
      { url: "/brand/favicon.ico", sizes: "any" },
      { url: "/brand/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/brand/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { url: "/brand/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/brand/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "FINVERSE AI",
    title: "FINVERSE AI — Intelligent Wealth Management",
    description:
      "AI-powered portfolio analytics, scenario simulation, and explainable intelligence for the Indian market.",
    images: [
      {
        url: "/brand/logo.png",
        width: 512,
        height: 512,
        alt: "FINVERSE AI Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FINVERSE AI — Intelligent Wealth Management",
    description:
      "AI-powered portfolio analytics, scenario simulation, and explainable intelligence for the Indian market.",
    images: ["/brand/logo.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0a1a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router, not Pages Router */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <noscript>You need to enable JavaScript to run FINVERSE AI.</noscript>
        <AppBackground />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
