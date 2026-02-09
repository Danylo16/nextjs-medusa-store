import type { MetadataRoute } from "next"

const site = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // TODO: Replace these with real fetches: products, categories, blog posts.
  // Keep sitemap clean: only canonical, indexable URLs.
  const urls: MetadataRoute.Sitemap = [
    { url: `${site}/ua`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${site}/ua/catalog`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${site}/ua/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ]

  return urls
}
