import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"
  const isProd = process.env.NODE_ENV === "production"

  if (!isProd) {
    return {
      rules: [{ userAgent: "*", disallow: ["/"] }],
    }
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/api/",
          "/*?*", // Disallow query-parameter URLs from crawling
          "/search", // Keep internal search out of index
          "/cart",
          "/checkout",
          "/account",
        ],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  }
}
