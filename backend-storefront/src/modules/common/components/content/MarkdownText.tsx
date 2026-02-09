"use client"

import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import type { Components } from "react-markdown"
import type { AnchorHTMLAttributes, ReactNode } from "react"

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...(defaultSchema.attributes || {}),
    a: [...(defaultSchema.attributes?.a || []), "href", "title"],
  },
  protocols: {
    ...(defaultSchema.protocols || {}),
    href: ["http", "https", "mailto", "tel"],
  },
}

const ENV_SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")

function getSiteOrigin(): string | undefined {
  if (typeof window !== "undefined") return window.location.origin
  return ENV_SITE_ORIGIN
}

function isInternalHref(href: string): boolean {
  if (!href) return false

  // anchors + абсолютні внутрішні
  if (href.startsWith("#") || href.startsWith("/")) return true

  // відносні ./ ../ — НЕ пхаємо в next/link (може стріляти залежно від роуту)
  if (href.startsWith("./") || href.startsWith("../")) return false

  // protocol-relative
  if (href.startsWith("//")) return false

  // абсолютні URL -> same-origin (якщо можемо)
  try {
    const base = getSiteOrigin()
    if (!base) return false

    const url = new URL(href, base)
    if (url.protocol === "mailto:" || url.protocol === "tel:") return false

    const site = new URL(base)
    return url.origin === site.origin
  } catch {
    return false
  }
}

export type MarkdownTextProps = {
  value?: string
  text?: string
  inline?: boolean
  className?: string
}

export default function MarkdownText({ value, text, inline, className }: MarkdownTextProps) {
  const md = (value ?? text ?? "").trim()
  if (!md) return null

  const aRenderer: Components["a"] = ({ href = "", children, className: aClassName, ...props }) => {
    const baseClass = "underline underline-offset-4 hover:opacity-80"
    const mergedClass = [baseClass, aClassName].filter(Boolean).join(" ")

    // anchor
    if (href.startsWith("#")) {
      return (
        <a
          {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
          href={href}
          className={mergedClass}
        >
          {children as ReactNode}
        </a>
      )
    }

    const internal = isInternalHref(href)
    if (internal) {
      return (
        <Link href={href} className={mergedClass}>
          {children as ReactNode}
        </Link>
      )
    }

    const isMailOrTel = href.startsWith("mailto:") || href.startsWith("tel:")

    return (
      <a
        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
        href={href}
        className={mergedClass}
        target={isMailOrTel ? undefined : "_blank"}
        rel={isMailOrTel ? undefined : "noopener noreferrer"}
      >
        {children as ReactNode}
      </a>
    )
  }

  const blockComponents: Components = {
    a: aRenderer,
    p: ({ children }) => <p className="leading-relaxed">{children as ReactNode}</p>,
    ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children as ReactNode}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children as ReactNode}</ol>,
    li: ({ children }) => <li>{children as ReactNode}</li>,
  }

  // inline режим: замінюємо параграф на span (і не робимо списки “як список”)
  const inlineComponents: Components = {
    a: aRenderer,
    p: ({ children }) => <span>{children as ReactNode}</span>,
    ul: ({ children }) => <span>{children as ReactNode}</span>,
    ol: ({ children }) => <span>{children as ReactNode}</span>,
    li: ({ children }) => <span>{children as ReactNode}</span>,
  }

  const Wrapper = inline ? "span" : "div"

  return (
    <Wrapper className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, sanitizeSchema as any]]}
        components={inline ? inlineComponents : blockComponents}
      >
        {md}
      </ReactMarkdown>
    </Wrapper>
  )
}
