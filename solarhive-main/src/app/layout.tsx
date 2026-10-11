import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Providers from "./components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const siteUrl = "https://solarhive.vercel.app";
const title = "Solar Hive — Affordable Solar. Flexible Payments.";
const description =
  "Solar packages, inverters, batteries, charge controllers, panels, and accessories — with Buy Now Pay Later and Save to Buy options.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "Solar Hive",
    images: [{ url: "/solarhive/products/residential-rooftop-scenic.jpg", width: 1920, height: 1280 }],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/solarhive/products/residential-rooftop-scenic.jpg"],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Solar Hive",
  url: siteUrl,
  logo: `${siteUrl}/solarhive/logo.jpg`,
  telephone: "+2348027250668",
  areaServed: "NG",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable}`}>
      <body suppressHydrationWarning>
        {/* Required by the Klump SDK, which caches this container on load to mount its checkout iframe into. */}
        <div id="klump__checkout" className="hidden" />
        <Script src="https://js.useklump.com/klump.js" strategy="afterInteractive" />
        <Script id="organization-jsonld" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(organizationJsonLd)}
        </Script>
        <Providers>
          <Navbar/>

          {children}

          <Footer/>
        </Providers>
        </body>
    </html>
  );
}
