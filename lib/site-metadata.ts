import type { Metadata } from "next";

const siteName = "SSC2 League";

export function createPageMetadata(title: string, description: string): Metadata {
  const fullTitle = `${title} | ${siteName}`;

  return {
    title,
    description,
    openGraph: { title: fullTitle, description },
    twitter: { title: fullTitle, description },
  };
}
