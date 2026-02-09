// import React from "react"
// import StrapiBlocks from "./strapi-blocks"
// import BlogSlider from "./blog-slider"
// import {
//   Accordion,
//   AccordionItem,
//   AccordionTrigger,
//   AccordionContent,
// } from "@modules/common/components/accordion"

// const STRAPI_BASE =
//   (process.env.NEXT_PUBLIC_STRAPI_URL || process.env.STRAPI_URL || "").trim()

// function joinUrl(base: string, path: string) {
//   const b = base.replace(/\/$/, "")
//   const p = path.replace(/^\//, "")
//   return b ? `${b}/${p}` : path
// }

// function resolveUrl(raw: unknown) {
//   const url = String(raw || "").trim()
//   if (!url) return ""
//   if (url.startsWith("http://") || url.startsWith("https://")) return url
//   if (url.startsWith("//")) return `https:${url}`
//   if (url.startsWith("/")) return joinUrl(STRAPI_BASE, url)
//   return url
// }

// function unwrapEntry<T extends Record<string, any>>(entry: any): T {
//   //  : Strapi v4 nested components can show up as { id, attributes }.
//   if (entry?.attributes && typeof entry.attributes === "object") {
//     return { id: entry.id, ...entry.attributes } as T
//   }
//   return entry as T
// }

// function unwrapMedia(input: any) {
//   if (!input) return null
//   if (typeof input?.url === "string") return input
//   const a = input?.data?.attributes
//   if (a && typeof a?.url === "string") return a
//   return null
// }

// type SrcCandidate = { url: string; width?: number }

// function buildSrcSet(media: any): { src?: string; srcSet?: string; width?: number; height?: number } {
//   const m = unwrapMedia(media)
//   if (!m) return {}

//   const candidates: SrcCandidate[] = []

//   candidates.push({
//     url: m.url,
//     width: typeof m.width === "number" ? m.width : undefined,
//   })

//   const formats = m.formats && typeof m.formats === "object" ? m.formats : null
//   if (formats) {
//     for (const key of Object.keys(formats)) {
//       const f = formats[key]
//       if (f?.url) {
//         candidates.push({
//           url: f.url,
//           width: typeof f.width === "number" ? f.width : undefined,
//         })
//       }
//     }
//   }

//   const seen = new Set<string>()
//   const withWidth = candidates
//     .filter((c) => c.url && !seen.has(c.url) && (seen.add(c.url), true))
//     .filter((c) => typeof c.width === "number" && c.width! > 0)
//     .sort((a, b) => (a.width! - b.width!))

//   const src = resolveUrl(m.url)
//   const srcSet =
//     withWidth.length >= 2 ? withWidth.map((c) => `${resolveUrl(c.url)} ${c.width}w`).join(", ") : undefined

//   return {
//     src,
//     srcSet,
//     width: typeof m.width === "number" ? m.width : undefined,
//     height: typeof m.height === "number" ? m.height : undefined,
//   }
// }

// function MediaImg({
//   media,
//   alt,
//   className,
//   priority,
//   sizes,
// }: {
//   media: any
//   alt: string
//   className?: string
//   priority?: boolean
//   sizes?: string
// }) {
//   const { src, srcSet, width, height } = buildSrcSet(media)
//   if (!src) return null

//   return (
//     <img
//       src={src}
//       srcSet={srcSet}
//       sizes={srcSet ? sizes : undefined}
//       alt={alt}
//       loading={priority ? "eager" : "lazy"}
//       fetchPriority={priority ? "high" : "auto"}
//       decoding="async"
//       width={width}
//       height={height}
//       className={className}
//       draggable={false}
//     />
//   )
// }

// function getYouTubeEmbed(url: string) {
//   try {
//     const u = new URL(url)
//     const host = u.hostname.replace(/^www\./, "")
//     if (host === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.replace("/", "")}`
//     if (host === "youtube.com" || host === "m.youtube.com") {
//       const id = u.searchParams.get("v")
//       if (id) return `https://www.youtube.com/embed/${id}`
//       if (u.pathname.startsWith("/embed/")) return `https://www.youtube.com${u.pathname}`
//     }
//   } catch {}
//   return null
// }

// function getVimeoEmbed(url: string) {
//   try {
//     const u = new URL(url)
//     const host = u.hostname.replace(/^www\./, "")
//     if (host === "vimeo.com") {
//       const id = u.pathname.split("/").filter(Boolean)[0]
//       if (id) return `https://player.vimeo.com/video/${id}`
//     }
//     if (host === "player.vimeo.com" && u.pathname.startsWith("/video/")) {
//       return `https://player.vimeo.com${u.pathname}`
//     }
//   } catch {}
//   return null
// }

// function Caption({ children }: { children: React.ReactNode }) {
//   return <figcaption className="mt-2 text-center text-xs text-black/45">{children}</figcaption>
// }

// export default function PostSections({ sections }: { sections: any[] }) {
//   if (!Array.isArray(sections) || sections.length === 0) return null

//   return (
//     <div className="space-y-12">
//       {sections.map((raw, idx) => {
//         const s = unwrapEntry<any>(raw)
//         const type = String(s?.__component || "").toLowerCase()

//         const isRichText = type.endsWith(".rich-text")
//         const isImage = type.endsWith(".image")
//         const isVideo = type.endsWith(".video")
//         const isSlider = type.endsWith(".slider")
//         const isFaq = type.endsWith(".faq")

//         if (isRichText) {
//           return (
//             <section key={idx}>
//               <StrapiBlocks content={s.body} />
//             </section>
//           )
//         }

//         if (isImage) {
//           const caption = String(s.caption || "").trim()
//           return (
//             <figure key={idx}>
//               <div className="overflow-hidden rounded-3xl border border-black/10 bg-black/5">
//                 <div className="relative w-full aspect-[16/9]">
//                   <MediaImg
//                     media={s.image}
//                     alt={s.alt || "Image"}
//                     className="absolute inset-0 h-full w-full object-cover select-none"
//                     sizes="(min-width: 1024px) 900px, 100vw"
//                     priority={false}
//                   />
//                 </div>
//               </div>
//               {caption ? <Caption>{caption}</Caption> : null}
//             </figure>
//           )
//         }

//         if (isVideo) {
//           const url = String(s.url || "")
//           const embed = getYouTubeEmbed(url) || getVimeoEmbed(url)

//           return (
//             <section key={idx}>
//               {String(s.title || "").trim() ? (
//                 <h2 className="text-[20px] leading-[28px] font-semibold text-balance">
//                   {s.title}
//                 </h2>
//               ) : null}

//               {embed ? (
//                 <div className="mt-4 overflow-hidden rounded-3xl border border-black/10 bg-black/5">
//                   <div className="relative w-full aspect-video">
//                     <iframe
//                       className="absolute inset-0 h-full w-full"
//                       src={embed}
//                       title={s.title || "Video"}
//                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                       allowFullScreen
//                     />
//                   </div>
//                 </div>
//               ) : url ? (
//                 <a className="mt-3 inline-block underline underline-offset-4" href={url} target="_blank" rel="noreferrer">
//                   Відкрити відео
//                 </a>
//               ) : null}
//             </section>
//           )
//         }

//         if (isSlider) {
//           const slidesRaw = Array.isArray(s.slides) ? s.slides : []
//           const slides = slidesRaw.map((x: any) => unwrapEntry<any>(x)).filter(Boolean)
//           if (!slides.length) return null

//           const prepared = slides
//             .map((sl: any, i: number) => {
//               const m = unwrapMedia(sl.image)
//               if (!m) return null
//               const { src, srcSet, width, height } = buildSrcSet(sl.image)
//               if (!src) return null
//               return {
//                 src,
//                 srcSet,
//                 width,
//                 height,
//                 alt: sl.alt || m.alternativeText || "Slide",
//                 caption: String(sl.caption || "").trim() || undefined,
//                 sizes: "(min-width: 1024px) 560px, 92vw",
//               }
//             })
//             .filter(Boolean) as any[]

//           return (
//             <section key={idx}>
//               {String(s.title || "").trim() ? (
//                 <h2 className="text-[20px] leading-[28px] font-semibold text-balance">
//                   {s.title}
//                 </h2>
//               ) : null}

//               <div className="mt-4">
//                 <BlogSlider slides={prepared} />
//               </div>
//             </section>
//           )
//         }

//         if (isFaq) {
//           const itemsRaw = Array.isArray(s.items) ? s.items : []
//           const items = itemsRaw.map((x: any) => unwrapEntry<any>(x)).filter(Boolean)
//           if (!items.length) return null

//           return (
//             <section key={idx}>
//               {String(s.title || "").trim() ? (
//                 <h2 className="text-[20px] leading-[28px] font-semibold text-balance">
//                   {s.title}
//                 </h2>
//               ) : null}

//               <Accordion type="single" collapsible className="mx-auto w-full max-w-[900px]">
//                 {items.map((it: any, i: number) => {
//                   const q = String(it.q ?? it.question ?? "").trim()
//                   const a = it.a ?? it.answer
//                   if (!q) return null

//                   return (
//                     <AccordionItem key={i} value={`faq-${idx}-${i}`}>
//                       <AccordionTrigger>{q}</AccordionTrigger>
//                       <AccordionContent>
//                         <div className="[&_p]:text-black/60 [&_p]:leading-relaxed [&_p]:text-sm [&_p]:mt-3 [&_p:first-child]:mt-0">
//                           <StrapiBlocks content={a} />
//                         </div>
//                       </AccordionContent>
//                     </AccordionItem>
//                   )
//                 })}
//               </Accordion>
//             </section>
//           )
//         }

//         return null
//       })}
//     </div>
//   )
// }
import React from "react"
import StrapiBlocks from "./strapi-blocks"
import BlogSlider from "./blog-slider"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@modules/common/components/accordion"

const STRAPI_BASE = (
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  process.env.STRAPI_URL ||
  ""
).trim()

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/$/, "")
  const p = path.replace(/^\//, "")
  return b ? `${b}/${p}` : path
}

function resolveUrl(raw: unknown) {
  const url = String(raw || "").trim()
  if (!url) return ""
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  if (url.startsWith("//")) return `https:${url}`
  if (url.startsWith("/")) return joinUrl(STRAPI_BASE, url)
  return url
}

function unwrapEntry<T extends Record<string, any>>(entry: any): T {
  // Strapi v4 can return nested objects as { id, attributes }.
  if (entry?.attributes && typeof entry.attributes === "object") {
    return { id: entry.id, ...entry.attributes } as T
  }
  return entry as T
}

function unwrapMedia(input: any) {
  // Supports direct media attributes or { data: { attributes } } shape.
  if (!input) return null
  if (typeof input?.url === "string") return input
  const a = input?.data?.attributes
  if (a && typeof a?.url === "string") return a
  return null
}

function pickFirst<T = any>(...vals: any[]): T | null {
  for (const v of vals) {
    if (v === 0) return v
    if (v === false) return v
    if (v !== undefined && v !== null && String(v).trim() !== "") return v
  }
  return null
}

type SrcCandidate = { url: string; width?: number }

function buildSrcSet(media: any): {
  src?: string
  srcSet?: string
  width?: number
  height?: number
} {
  const m = unwrapMedia(media)
  if (!m) return {}

  const candidates: SrcCandidate[] = []

  candidates.push({
    url: m.url,
    width: typeof m.width === "number" ? m.width : undefined,
  })

  const formats = m.formats && typeof m.formats === "object" ? m.formats : null
  if (formats) {
    for (const key of Object.keys(formats)) {
      const f = (formats as any)[key]
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

  const src = resolveUrl(m.url)
  const srcSet =
    withWidth.length >= 2
      ? withWidth.map((c) => `${resolveUrl(c.url)} ${c.width}w`).join(", ")
      : undefined

  return {
    src,
    srcSet,
    width: typeof m.width === "number" ? m.width : undefined,
    height: typeof m.height === "number" ? m.height : undefined,
  }
}

function MediaImg({
  media,
  alt,
  className,
  priority,
  sizes,
}: {
  media: any
  alt: string
  className?: string
  priority?: boolean
  sizes?: string
}) {
  const { src, srcSet, width, height } = buildSrcSet(media)
  if (!src) return null

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      width={width}
      height={height}
      className={className}
      draggable={false}
    />
  )
}

function normalizeUrlForParsing(raw: unknown) {
  const input = String(raw || "").trim()
  if (!input) return ""

  // Extract src from iframe HTML if someone pasted embed code.
  if (input.includes("<iframe")) {
    const m = input.match(/src=["']([^"']+)["']/i)
    if (m?.[1]) return normalizeUrlForParsing(m[1])
  }

  if (input.startsWith("//")) return `https:${input}`

  // Add scheme for common cases like "youtube.com/watch?v=..."
  if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(input)) {
    if (
      input.startsWith("www.") ||
      input.startsWith("youtube.com") ||
      input.startsWith("m.youtube.com") ||
      input.startsWith("youtu.be") ||
      input.startsWith("vimeo.com") ||
      input.startsWith("player.vimeo.com")
    ) {
      return `https://${input}`
    }
  }

  return input
}

function getYouTubeEmbed(rawUrl: string) {
  const url = normalizeUrlForParsing(rawUrl)
  if (!url) return null

  // Support raw YouTube IDs (11 chars).
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return `https://www.youtube.com/embed/${url}`
  }

  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, "")
    const isYouTube =
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtu.be" ||
      host === "youtube-nocookie.com"

    if (!isYouTube) return null

    let id = ""

    if (host === "youtu.be") {
      id = u.pathname.split("/").filter(Boolean)[0] || ""
    } else {
      if (u.pathname === "/watch") {
        id = u.searchParams.get("v") || ""
      } else if (u.pathname.startsWith("/embed/")) {
        id = u.pathname.split("/")[2] || ""
      } else if (u.pathname.startsWith("/shorts/")) {
        id = u.pathname.split("/")[2] || ""
      } else if (u.pathname.startsWith("/live/")) {
        id = u.pathname.split("/")[2] || ""
      } else if (u.pathname.startsWith("/v/")) {
        id = u.pathname.split("/")[2] || ""
      }
    }

    if (!id) return null

    return `https://www.youtube.com/embed/${id}`
  } catch {
    return null
  }
}

function getVimeoEmbed(rawUrl: string) {
  const url = normalizeUrlForParsing(rawUrl)
  if (!url) return null

  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, "")

    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0]
      if (id) return `https://player.vimeo.com/video/${id}`
    }

    if (host === "player.vimeo.com" && u.pathname.startsWith("/video/")) {
      return `https://player.vimeo.com${u.pathname}`
    }
  } catch {}

  return null
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <figcaption className="mt-2 text-center text-xs text-black/45">
      {children}
    </figcaption>
  )
}

export default function PostSections({ sections }: { sections: any[] }) {
  if (!Array.isArray(sections) || sections.length === 0) return null

  return (
    <div className="space-y-12">
      {sections.map((raw, idx) => {
        const s = unwrapEntry<any>(raw)
        const key = s?.id ?? idx
        const type = String(s?.__component || "").toLowerCase()

        const isRichText = type.endsWith(".rich-text")
        const isImage = type.endsWith(".image")
        const isVideo = type.endsWith(".video")
        const isSlider = type.endsWith(".slider")
        const isFaq = type.endsWith(".faq")

        if (isRichText) {
          const blocks = pickFirst(s.body, s.content, s.text, s.blocks, s.value)
          if (!blocks) return null

          return (
            <section key={key}>
              <StrapiBlocks content={blocks} />
            </section>
          )
        }

        if (isImage) {
          const media = pickFirst(s.image, s.media, s.file)
          const caption = String(
            pickFirst(s.caption, s.title, s.description) || ""
          ).trim()

          const { width, height } = buildSrcSet(media)
          const aspectRatio =
            typeof width === "number" && typeof height === "number" && height > 0
              ? `${width}/${height}`
              : "16/9"

          if (!media) return null

          return (
            <figure key={key}>
              <div className="overflow-hidden rounded-3xl border border-black/10 bg-black/5">
                <div className="relative w-full" style={{ aspectRatio }}>
                  <MediaImg
                    media={media}
                    alt={s.alt || "Image"}
                    className="absolute inset-0 h-full w-full object-contain select-none"
                    sizes="(min-width: 1024px) 900px, 100vw"
                    priority={false}
                  />
                </div>
              </div>
              {caption ? <Caption>{caption}</Caption> : null}
            </figure>
          )
        }

        if (isVideo) {
          const rawUrl = String(pickFirst(s.url, s.link) || "")
          const url = normalizeUrlForParsing(rawUrl)
          const embed = getYouTubeEmbed(url) || getVimeoEmbed(url)

          return (
            <section key={key}>
              {String(s.title || "").trim() ? (
                <h2 className="text-[20px] leading-[28px] font-semibold text-balance">
                  {s.title}
                </h2>
              ) : null}

              {embed ? (
                <div className="mt-4 overflow-hidden rounded-3xl border border-black/10 bg-black/5">
                  <div className="relative w-full aspect-video">
                    <iframe
                      className="absolute inset-0 h-full w-full"
                      src={embed}
                      title={s.title || "Video"}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                </div>
              ) : url ? (
                <a
                  className="mt-3 inline-block underline underline-offset-4"
                  href={url}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Відкрити відео
                </a>
              ) : null}
            </section>
          )
        }

        if (isSlider) {
          const slidesRaw = Array.isArray(s.slides) ? s.slides : []
          const slides = slidesRaw.map((x: any) => unwrapEntry<any>(x)).filter(Boolean)
          if (!slides.length) return null

          const prepared = slides
            .map((sl: any) => {
              const media = pickFirst(sl.image, sl.media, sl.file)
              const m = unwrapMedia(media)
              if (!m) return null

              const { src, srcSet, width, height } = buildSrcSet(media)
              if (!src) return null

              return {
                src,
                srcSet,
                width,
                height,
                alt: sl.alt || m.alternativeText || "Slide",
                caption: String(
                  pickFirst(sl.caption, sl.title, sl.description) || ""
                ).trim() || undefined,
                sizes: "(min-width: 1024px) 560px, 92vw",
              }
            })
            .filter(Boolean) as any[]

          if (!prepared.length) return null

          return (
            <section key={key}>
              {String(s.title || "").trim() ? (
                <h2 className="text-[20px] leading-[28px] font-semibold text-balance">
                  {s.title}
                </h2>
              ) : null}

              <div className="mt-4">
                <BlogSlider slides={prepared} />
              </div>
            </section>
          )
        }

        if (isFaq) {
          const itemsRaw = Array.isArray(s.items) ? s.items : []
          const items = itemsRaw.map((x: any) => unwrapEntry<any>(x)).filter(Boolean)
          if (!items.length) return null

          return (
            <section key={key}>
              {String(s.title || "").trim() ? (
                <h2 className="text-[20px] leading-[28px] font-semibold text-balance">
                  {s.title}
                </h2>
              ) : null}

              <Accordion type="single" collapsible className="mx-auto w-full max-w-[900px]">
                {items.map((it: any, i: number) => {
                  const q = String(pickFirst(it.q, it.question, it.title) || "").trim()
                  const a = pickFirst(it.a, it.answer, it.body, it.content)
                  if (!q) return null
                  if (!a) return null

                  return (
                    <AccordionItem key={i} value={`faq-${key}-${i}`}>
                      <AccordionTrigger>{q}</AccordionTrigger>
                      <AccordionContent>
                        <div className="[&_p]:text-black/60 [&_p]:leading-relaxed [&_p]:text-sm [&_p]:mt-3 [&_p:first-child]:mt-0">
                          <StrapiBlocks content={a} />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            </section>
          )
        }

        return null
      })}
    </div>
  )
}
