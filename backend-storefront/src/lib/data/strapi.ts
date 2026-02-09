// src/lib/data/strapi.ts

type StrapiListResponse = {
  data: any[]
  meta?: any
}

export type StrapiMedia = {
  id?: number
  url: string
  alternativeText?: string | null
  caption?: string | null
  width?: number | null
  height?: number | null
  mime?: string | null
  formats?: any
}

export type StrapiPost = {
  id: number
  documentId?: string
  title: string
  slug: string
  excerpt?: string | null
  content?: any
  sections?: any[]
  cover?: any
  createdAt: string
  updatedAt: string
  publishedAt?: string | null
}

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL?.replace(/\/$/, "") || "http://localhost:1337"

const STRAPI_TOKEN = process.env.STRAPI_TOKEN || process.env.NEXT_PUBLIC_STRAPI_TOKEN

function absoluteStrapiUrl(maybeRelative: string) {
  if (!maybeRelative) return ""
  if (maybeRelative.startsWith("http://") || maybeRelative.startsWith("https://")) {
    return maybeRelative
  }
  return `${STRAPI_URL}${maybeRelative.startsWith("/") ? "" : "/"}${maybeRelative}`
}

function unwrapEntry<T extends Record<string, any>>(entry: any): T {
  // Strapi v4: { id, attributes: {...} }
  if (entry?.attributes && typeof entry.attributes === "object") {
    return { id: entry.id, ...entry.attributes } as T
  }
  // Strapi v5 often returns flattened objects.
  return entry as T
}

function unwrapMedia(media: any): StrapiMedia | null {
  if (!media) return null

  // Strapi v4 media: { data: { id, attributes: {...} } }
  if (media?.data !== undefined) {
    const d = media.data
    if (!d) return null
    const m = unwrapEntry<any>(d)
    if (!m?.url) return null
    return { ...m, url: absoluteStrapiUrl(m.url) }
  }

  // Strapi v5/flat media: { url, ... }
  if (media?.url) {
    return { ...media, url: absoluteStrapiUrl(media.url) }
  }

  return null
}

async function strapiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init?.headers as any),
  }

  // Only needed if your API is private.
  if (STRAPI_TOKEN) {
    headers.Authorization = `Bearer ${STRAPI_TOKEN}`
  }

  const url = `${STRAPI_URL}${path}`

  const res = await fetch(url, {
    ...init,
    cache: "no-store",
    headers,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Strapi request failed ${res.status}: ${text}`)
  }

  return res.json() as Promise<T>
}

/**
 * IMPORTANT:
 * Strapi v5 can throw "Invalid key related at cover.related" when using wildcard populate for media.
 * So we NEVER use "*" for media fields. We explicitly select media fields.
 */
const MEDIA_FIELDS = ["url", "alternativeText", "caption", "width", "height", "mime", "formats"] as const


function addMediaFields(qs: URLSearchParams, baseKey: string) {
  //  : baseKey examples:
  // "populate[cover]"
  // "populate[sections][on][blocks.image][populate][image]"
  // "populate[sections][on][blocks.slider][populate][slides][populate][image]"
  MEDIA_FIELDS.forEach((f, i) => {
    qs.set(`${baseKey}[fields][${i}]`, f)
  })
}

function buildPopulateQS(mode: "list" | "single") {
  const qs = new URLSearchParams()

  // Cover media: do NOT set populate[cover]=true if you also set nested fields.
  addMediaFields(qs, "populate[cover]")

  if (mode === "list") {
    return qs
  }

  // Dynamic zone itself
  qs.set("populate[sections]", "true")

  // Make sure non-media blocks are returned reliably
  qs.set("populate[sections][on][blocks.rich-text]", "true")
  qs.set("populate[sections][on][blocks.video]", "true")

  // blocks.image -> image media (fields-only populate, no extra "=true" to avoid conflicts)
  addMediaFields(qs, "populate[sections][on][blocks.image][populate][image]")

  // blocks.slider -> slides[].image media (fields-only populate, no extra "=true" to avoid conflicts)
  addMediaFields(
    qs,
    "populate[sections][on][blocks.slider][populate][slides][populate][image]"
  )

  // blocks.faq -> items[] (repeatable component)
  qs.set("populate[sections][on][blocks.faq][populate][items]", "true")

  return qs
}


export async function listPosts(): Promise<StrapiPost[]> {
  const qs = buildPopulateQS("list")

  qs.set("sort[0]", "publishedAt:desc")
  qs.set("filters[publishedAt][$notNull]", "true")

  const data = await strapiFetch<StrapiListResponse>(`/api/posts?${qs.toString()}`)

  return (data.data || []).map((row: any) => {
    const p = unwrapEntry<StrapiPost>(row)
    return {
      ...p,
      cover: unwrapMedia(p.cover),
    }
  })
}

export async function getPostBySlug(slug: string): Promise<StrapiPost | null> {
  const qs = buildPopulateQS("single")

  qs.set("filters[slug][$eq]", slug)
  qs.set("filters[publishedAt][$notNull]", "true")
  qs.set("pagination[pageSize]", "1")

  const data = await strapiFetch<StrapiListResponse>(`/api/posts?${qs.toString()}`)

  const first = (data.data || [])[0]
  if (!first) return null

  const post = unwrapEntry<StrapiPost>(first)

  return {
    ...post,
    cover: unwrapMedia(post.cover),
  }
}
