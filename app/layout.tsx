// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const publicSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.VERCEL_PROJECT_PRODUCTION_URL ??
  process.env.VERCEL_URL;

export const metadata: Metadata = {
  ...(publicSiteUrl
    ? { metadataBase: new URL(publicSiteUrl.startsWith("http") ? publicSiteUrl : `https://${publicSiteUrl}`) }
    : { metadataBase: new URL("https://ssc-league.vercel.app") }),
  applicationName: "SSC2 League",
  title: {
    default: "SSC2 League | Programming & Data Science",
    template: "%s | SSC2 League",
  },
  description:
    "Learn programming and data science, complete course challenges, and track your progress in the SSC2 League.",
  keywords: [
    "SSC2 League",
    "programming",
    "Python",
    "data science",
    "student league",
  ],
  openGraph: {
    type: "website",
    siteName: "SSC2 League",
    title: "SSC2 League | Programming & Data Science",
    description:
      "Learn programming and data science, complete course challenges, and track your progress in the SSC2 League.",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "SSC2 League — Programming and Data Science" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SSC2 League | Programming & Data Science",
    description:
      "Learn programming and data science, complete course challenges, and track your progress in the SSC2 League.",
    images: [{ url: "/twitter-image", alt: "SSC2 League — Programming and Data Science" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
