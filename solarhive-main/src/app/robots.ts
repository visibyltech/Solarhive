import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = "https://solarhive.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/account", "/api"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
