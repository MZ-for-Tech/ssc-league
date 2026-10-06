import type { Metadata } from "next";

const siteName = "SSC2 League";
const socialImage = "/opengraph-image";
const twitterImage = "/twitter-image";
const socialImageAlt = "SSC2 League — Programming and Data Science";

export function createPageMetadata(title: string, description: string): Metadata {
  const fullTitle = `${title} | ${siteName}`;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      siteName,
      title: fullTitle,
      description,
      images: [{ url: socialImage, width: 1200, height: 630, alt: socialImageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [{ url: twitterImage, alt: socialImageAlt }],
    },
  };
}
