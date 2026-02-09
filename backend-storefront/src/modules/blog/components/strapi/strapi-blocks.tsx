"use client"

import React from "react"
import { BlocksRenderer } from "@strapi/blocks-react-renderer"

// Version-safe: infer props from the real component
type BRProps = React.ComponentProps<typeof BlocksRenderer>
type BlocksMap = NonNullable<BRProps["blocks"]>
type ModifiersMap = NonNullable<BRProps["modifiers"]>

function isExternalUrl(url: string) {
  try {
    const u = new URL(url)
    return u.protocol === "http:" || u.protocol === "https:"
  } catch {
    return false
  }
}

function safeHref(raw: unknown): string {
  const url = String(raw || "").trim()
  if (!url) return "#"
  const lower = url.toLowerCase()
  if (lower.startsWith("javascript:") || lower.startsWith("data:")) return "#"
  return url
}

const STRAPI_BASE = (process.env.NEXT_PUBLIC_STRAPI_URL || "").trim()

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/$/, "")
  const p = path.replace(/^\//, "")
  return b ? `${b}/${p}` : path
}

function resolveAssetUrl(raw: unknown) {
  const url = String(raw || "").trim()
  if (!url) return ""
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  if (url.startsWith("//")) return `https:${url}`
  if (url.startsWith("/")) return joinUrl(STRAPI_BASE, url)
  return url
}

type StrapiBlocksProps = {
  content: unknown
  className?: string
}

// NOTE: children MUST be optional because Strapi renderer types declare it optional.
type WithChildren = { children?: React.ReactNode }

type SrcCandidate = { url: string; width?: number }

function buildSrcSetFromImage(image: any): { src?: string; srcSet?: string; width?: number; height?: number; alt?: string; caption?: string } {
  if (!image) return {}
  const url = resolveAssetUrl(image.url)
  if (!url) return {}

  const candidates: SrcCandidate[] = []
  candidates.push({ url: image.url, width: typeof image.width === "number" ? image.width : undefined })

  const formats = image.formats && typeof image.formats === "object" ? image.formats : null
  if (formats) {
    for (const key of Object.keys(formats)) {
      const f = formats[key]
      if (f?.url) {
        candidates.push({
          url: f.url,
          width: typeof f.width === "number" ? f.width : undefined,
        })
      }
    }
  }

  const seen = new Set<string>()
  const withWidth = candidates
    .filter((c) => c.url && !seen.has(c.url) && (seen.add(c.url), true))
    .filter((c) => typeof c.width === "number" && c.width! > 0)
    .sort((a, b) => (a.width! - b.width!))

  const src = resolveAssetUrl(image.url)
  const srcSet =
    withWidth.length >= 2
      ? withWidth.map((c) => `${resolveAssetUrl(c.url)} ${c.width}w`).join(", ")
      : undefined

  return {
    src,
    srcSet,
    width: typeof image.width === "number" ? image.width : undefined,
    height: typeof image.height === "number" ? image.height : undefined,
    alt: image.alternativeText || image.alt || undefined,
    caption: image.caption || undefined,
  }
}

const blocks = {
  paragraph: (props: WithChildren) => (
    <p className="mt-4 leading-7 text-[15px] text-foreground/90">{props.children}</p>
  ),

  heading: (props: WithChildren & { level?: number }) => {
    const lvl =
      typeof props.level === "number" ? Math.min(Math.max(props.level, 1), 6) : 2

    const className =
      lvl === 1
        ? "mt-10 text-3xl font-semibold leading-tight text-balance"
        : lvl === 2
        ? "mt-10 text-2xl font-semibold leading-tight text-balance"
        : lvl === 3
        ? "mt-8 text-xl font-semibold leading-snug text-balance"
        : "mt-6 text-lg font-semibold leading-snug text-balance"

    //  : use createElement to avoid relying on global JSX namespace/types.
    const tag = `h${lvl}` as React.ElementType
    return React.createElement(tag, { className }, props.children)
  },

  list: (props: WithChildren & { format?: "ordered" | "unordered" }) => {
    const ordered = props.format === "ordered"
    const tag = (ordered ? "ol" : "ul") as React.ElementType

    return React.createElement(
      tag,
      {
        className: [
          "mt-4 ml-6 space-y-2 text-[15px] text-foreground/90",
          ordered ? "list-decimal" : "list-disc",
        ].join(" "),
      },
      props.children
    )
  },

  "list-item": (props: WithChildren) => <li className="leading-7">{props.children}</li>,

  link: (props: WithChildren & { url?: string }) => {
    const href = safeHref(props.url)
    const external = isExternalUrl(href)

    return (
      <a
        href={href}
        className="underline underline-offset-4 decoration-black/20 hover:decoration-black/35 transition"
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer noopener" : undefined}
      >
        {props.children}
      </a>
    )
  },

  quote: (props: WithChildren) => (
    <blockquote className="mt-6 rounded-2xl border-l-4 border-black/15 bg-black/5 px-5 py-4 text-[15px] text-foreground/90">
      <div className="[&>p:first-child]:mt-0 [&>p]:mt-3">{props.children}</div>
    </blockquote>
  ),

  code: (props: WithChildren) => (
    <pre className="mt-6 overflow-x-auto rounded-2xl bg-black/90 p-4 text-[13px] leading-6 text-white">
      <code>{props.children}</code>
    </pre>
  ),

  image: (props: { image: any }) => {
    const { src, srcSet, width, height, alt, caption } = buildSrcSetFromImage(props.image)
    if (!src) return null

    return (
      <figure className="mt-8">
        <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
          <img
            src={src}
            srcSet={srcSet}
            sizes={srcSet ? "(min-width: 1024px) 820px, 100vw" : undefined}
            alt={alt || "Image"}
            loading="lazy"
            decoding="async"
            width={width}
            height={height}
            className="h-auto w-full object-cover"
            draggable={false}
          />
        </div>

        {caption ? (
          <figcaption className="mt-2 text-center text-xs text-black/45">
            {caption}
          </figcaption>
        ) : null}
      </figure>
    )
  },
} satisfies BlocksMap

const modifiers = {
  bold: (props: WithChildren) => <strong className="font-semibold">{props.children}</strong>,
  italic: (props: WithChildren) => <em className="italic">{props.children}</em>,
  underline: (props: WithChildren) => <span className="underline underline-offset-4">{props.children}</span>,
  strikethrough: (props: WithChildren) => <span className="line-through">{props.children}</span>,
  code: (props: WithChildren) => (
    <code className="rounded-md bg-black/5 px-1.5 py-0.5 font-mono text-[13px] text-foreground">
      {props.children}
    </code>
  ),
} satisfies ModifiersMap

export default function StrapiBlocks({ content, className }: StrapiBlocksProps) {
  if (!content) return null

  let normalized: unknown = content

  // Support blocks stored as JSON string
  if (typeof content === "string") {
    try {
      normalized = JSON.parse(content)
    } catch {
      return <p className={className}>{content}</p>
    }
  }

  // Strapi blocks content must be an array
  if (!Array.isArray(normalized)) return null

  return (
    <div
      className={[
        // Ensure the first block doesn't start with an ugly top-gap
        "[&>p:first-child]:mt-0 [&>h1:first-child]:mt-0 [&>h2:first-child]:mt-0 [&>h3:first-child]:mt-0 [&>ul:first-child]:mt-0 [&>ol:first-child]:mt-0",
        className || "",
      ].join(" ")}
    >
      <BlocksRenderer content={normalized as any} blocks={blocks} modifiers={modifiers} />
    </div>
  )
}
 