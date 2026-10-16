import type { Metadata, Viewport } from "next";
import { Montserrat, Source_Sans_3 } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SkipLink } from "@/components/skip-link";

import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

const siteDescription =
  "Describe what you need in your own words and get matched to verified education, essential-needs, and disability and health support programmes. Share details only with your consent and track every request to delivery.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  applicationName: "AccessPath AI",
  title: {
    default:
      "AccessPath AI – Find verified education, essential-needs and disability support",
    template: "%s | AccessPath AI",
  },
  description: siteDescription,
  keywords: [
    "support programmes",
    "disability support",
    "education support",
    "essential needs",
    "NGO referrals",
    "caseworker",
    "consent-based referrals",
  ],
  openGraph: {
    type: "website",
    siteName: "AccessPath AI",
    title: "AccessPath AI – Verified support programmes, matched to your needs",
    description: siteDescription,
    images: [
      {
        url: "/images/hero-programmes.jpg",
        width: 1152,
        height: 864,
        alt: "Three support scenes joined by one path: a tutor helping a schoolgirl with books, a volunteer handing a family a grocery basket, and a health worker supporting an older woman with a cane.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AccessPath AI – Verified support programmes, matched to your needs",
    description: siteDescription,
    images: ["/images/hero-programmes.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b7a6e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SkipLink />
        <SiteHeader />
        <div id="main-content" className="flex flex-1 flex-col" tabIndex={-1}>
          {children}
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}
