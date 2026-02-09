// src/app/[countryCode]/(main)/blog/page.tsx

import type { Metadata } from "next"
import Image from "next/image"
import Script from "next/script"
import type { CSSProperties } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { listPosts } from "@lib/data/strapi"

export const revalidate = 300

export const metadata: Metadata = {
  title: "Блог",
  description:
    "Статті та оновлення про реабілітацію, тренування, вибір тренажерів MTB1-4 та корисні поради.",
  openGraph: {
    title: "Блог",
    description:
      "Статті та оновлення про реабілітацію, тренування, вибір тренажерів MTB1-4 та корисні поради.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Блог",
    description:
      "Статті та оновлення про реабілітацію, тренування, вибір тренажерів MTB1-4 та корисні поради.",
  },
}

type StrapiMedia = {
  url: string
  alternativeText?: string | null
  width?: number | null
  height?: number | null
}

type BlogPost = {
  id: number | string
  title: string
  slug: string
  excerpt?: string | null
  publishedAt?: string | null
  cover?: StrapiMedia | null
}

function clamp(lines: number): CSSProperties {
  // Use CSS line clamping without relying on Tailwind plugins
  return {
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  }
}

function toIsoDate(s?: string | null) {
  if (!s) return null
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

function formatUaDate(s?: string | null) {
  const iso = toIsoDate(s)
  if (!iso) return null
  const d = new Date(iso)
  return new Intl.DateTimeFormat("uk-UA", { year: "numeric", month: "long", day: "2-digit" }).format(d)
}

function withStrapiBase(url: string) {
  // If Strapi returns relative URLs, prefix them with a base URL from env
  if (!url) return ""
  if (url.startsWith("http://") || url.startsWith("https://")) return url

  const base =
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    process.env.STRAPI_URL ||
    ""

  if (!base) return url
  const slash = url.startsWith("/") ? "" : "/"
  return `${base}${slash}${url}`
}

function coverAlt(post: BlogPost) {
  const alt = post.cover?.alternativeText?.trim()
  if (alt) return alt
  return post.title
}

function FeaturedCard({ post }: { post: BlogPost }) {
  const coverSrc = post.cover?.url ? withStrapiBase(post.cover.url) : ""
  const dateText = formatUaDate(post.publishedAt)

  return (
    <article className="card-soft overflow-hidden ring-1 ring-black/5 hover:ring-black/10 transition-shadow md:col-span-2">
      <div className="grid md:grid-cols-2">
        <LocalizedClientLink
          href={`/blog/${post.slug}`}
          aria-label={`Відкрити статтю: ${post.title}`}
          className="group relative block aspect-[16/10] md:aspect-auto md:min-h-[260px] bg-secondary-light/40"
        >
          {coverSrc ? (
            <Image
              src={coverSrc}
              alt={coverAlt(post)}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-secondary-light/50" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(75,175,140,0.20),transparent_45%),radial-gradient(circle_at_82%_28%,rgba(247,221,226,0.90),transparent_55%)]" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/55" />
            </div>
          )}

          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          <div className="absolute left-4 bottom-4 right-4">
            <p className="text-xs text-white/90">
              {dateText ? (
                <time dateTime={toIsoDate(post.publishedAt) ?? undefined}>{dateText}</time>
              ) : (
                <span>Стаття</span>
              )}
            </p>
          </div>
        </LocalizedClientLink>

        <div className="p-6 md:p-7 flex flex-col">
          <p className="text-xs text-foreground/60">
            {dateText ? (
              <time dateTime={toIsoDate(post.publishedAt) ?? undefined}>{dateText}</time>
            ) : (
              "Статті та оновлення"
            )}
          </p>

          <h2 className="mt-2 text-[20px] leading-[28px] font-semibold" style={clamp(3)}>
            <LocalizedClientLink href={`/blog/${post.slug}`} className="hover:text-primary-dark">
              {post.title}
            </LocalizedClientLink>
          </h2>

          {post.excerpt ? (
            <p className="mt-3 text-sm text-foreground/75" style={clamp(3)}>
              {post.excerpt}
            </p>
          ) : (
            <p className="mt-3 text-sm text-foreground/60" style={clamp(3)}>
              Короткий опис ще не доданий — відкрийте статтю, щоб прочитати повністю.
            </p>
          )}

          <div className="mt-auto pt-5">
            <LocalizedClientLink
              href={`/blog/${post.slug}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark"
            >
              Читати <span aria-hidden="true">→</span>
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </article>
  )
}

function PostCard({ post }: { post: BlogPost }) {
  const coverSrc = post.cover?.url ? withStrapiBase(post.cover.url) : ""
  const dateText = formatUaDate(post.publishedAt)

  return (
    <article className="card-soft overflow-hidden ring-1 ring-black/5 hover:ring-black/10 transition-shadow flex flex-col">
      <LocalizedClientLink
        href={`/blog/${post.slug}`}
        aria-label={`Відкрити статтю: ${post.title}`}
        className="group relative block aspect-[16/9] bg-secondary-light/40"
      >
        {coverSrc ? (
          <Image
            src={coverSrc}
            alt={coverAlt(post)}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-secondary-light/50" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(75,175,140,0.18),transparent_45%),radial-gradient(circle_at_82%_28%,rgba(247,221,226,0.90),transparent_55%)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/55" />
          </div>
        )}

        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <div className="absolute left-4 bottom-3 right-4">
          <p className="text-[11px] text-white/90">
            {dateText ? (
              <time dateTime={toIsoDate(post.publishedAt) ?? undefined}>{dateText}</time>
            ) : (
              <span>Стаття</span>
            )}
          </p>
        </div>
      </LocalizedClientLink>

      <div className="p-6 flex flex-col flex-1">
        <h2 className="text-base font-semibold leading-6" style={clamp(2)}>
          <LocalizedClientLink href={`/blog/${post.slug}`} className="hover:text-primary-dark">
            {post.title}
          </LocalizedClientLink>
        </h2>

        {post.excerpt ? (
          <p className="mt-2 text-sm text-foreground/75" style={clamp(3)}>
            {post.excerpt}
          </p>
        ) : (
          <p className="mt-2 text-sm text-foreground/60" style={clamp(3)}>
            Опис ще не доданий — відкрийте статтю, щоб прочитати повністю.
          </p>
        )}

        <div className="mt-auto pt-4">
          <LocalizedClientLink
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark"
          >
            Читати <span aria-hidden="true">→</span>
          </LocalizedClientLink>
        </div>
      </div>
    </article>
  )
}

export default async function BlogIndexPage() {
  const posts = (await listPosts()) as BlogPost[]
  const [featured, ...rest] = posts

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Блог",
    description:
      "Статті та оновлення про реабілітацію, тренування та вибір тренажерів MTB1-4.",
    blogPost: posts.slice(0, 10).map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `/blog/${p.slug}`,
      datePublished: toIsoDate(p.publishedAt) ?? undefined,
      image: p.cover?.url ? withStrapiBase(p.cover.url) : undefined,
    })),
  }

  return (
    <div className="content-container py-10 md:py-12">
      <Script
        id="blog-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold">Блог</h1>
          <p className="mt-2 text-sm text-foreground/70">
            Статті та оновлення про реабілітацію, тренування та вибір обладнання.
          </p>
        </div>
        <p className="hidden md:block text-sm text-foreground/60">Статті та оновлення</p>
      </div>

      {posts.length === 0 ? (
        <div className="mt-10 card-soft p-8 ring-1 ring-black/5">
          <h2 className="text-lg font-semibold">Поки що немає опублікованих статей.</h2>
          <p className="mt-2 text-sm text-foreground/70">
            Перейдіть у каталог або замовте консультацію — допоможемо підібрати рішення під ваш випадок.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <LocalizedClientLink
              href="/store"
              className="contrast-btn"
              aria-label="Перейти до каталогу товарів"
            >
              Перейти в каталог
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/contacts"
              className="text-sm font-semibold text-primary hover:text-primary-dark self-center"
              aria-label="Перейти на сторінку контактів"
            >
              Замовити консультацію →
            </LocalizedClientLink>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {featured ? <FeaturedCard post={featured} /> : null}
          {rest.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  )
}
