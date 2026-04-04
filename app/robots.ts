import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/assessment/*/results"],
      },
    ],
    sitemap: "https://ecm.dev/sitemap.xml",
  };
}
