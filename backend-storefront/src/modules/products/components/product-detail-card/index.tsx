 "use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react"
import { HttpTypes } from "@medusajs/types"
import { Button } from "../../../common/UI/button"
import ProductActions from "../product-actions"
import { useParams, useRouter } from "next/navigation"
import MarkdownText from "../../../common/components/content/MarkdownText"
import {ServiceInfoBar } from "../../../common/UI/icons" 

// ===================== V2 CONTENT TYPES =====================
export type VideoLink = { url: string; label: string }
export type SpecsRow = [string, string]

export type ProductContentV2 = {
  version: 2
  sidebar?: SidebarItem[]
  bottom?: BottomItem[]
}

export type SidebarItem =
  | { type: "text"; text: string; variant?: "muted" | "normal" }
  | { type: "section"; title?: string; blocks: RichBlock[] }
  | { type: "video_links"; items: VideoLink[] }
  | { type: "note"; text: string; variant?: "info" | "warning" }
  | { type: "emphasis"; text: string }

export type BottomItem =
  | { type: "section"; title: string; blocks: RichBlock[] }
  | { type: "specs"; title?: string; rows: SpecsRow[] }
  | { type: "video_links"; items: VideoLink[] }
  | { type: "note"; text: string; variant?: "info" | "warning" }

export type RichBlock = { type: "p"; text: string } | { type: "list"; items: string[] }

// ===================== PROPS =====================
type ProductDetailCardProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  content: ProductContentV2[]
}

export function ProductDetailCard({ product, region, content }: ProductDetailCardProps) {
  const router = useRouter()
  const countryCode = useParams().countryCode as string

  const contentV2 = content?.[0]

  if (!contentV2 || contentV2.version !== 2) {
    console.error("Invalid ProductContentV2 payload:", content)
    return null
  }

  // ===================== IMAGES =====================
  const images = useMemo(() => {
    const raw =
      product.images?.map((img) => ({
        url: img.url,
        alt: product.title || "Product image",
      })) || []

    return raw.length > 0 ? raw : [{ url: "/placeholder.svg", alt: "No image available" }]
  }, [product.images, product.title])

  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)

  const modalRef = useRef<HTMLDivElement | null>(null)

  // ===== STOP AUTOPLAY AFTER FIRST REAL USER INTERACTION =====
  const autoplayEnabledRef = useRef(true)
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useState(true)

  const stopAutoplay = useCallback(() => {
    if (!autoplayEnabledRef.current) return
    autoplayEnabledRef.current = false
    setIsAutoplayEnabled(false)
  }, [])

  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)")
    if (mql?.matches) stopAutoplay()
  }, [stopAutoplay])

  // ===== THUMB STRIP SCROLL/DRAG =====
  const thumbsRef = useRef<HTMLDivElement | null>(null)

  const leadDragRef = useRef(false)
  const dragStartXRef = useRef(0)
  const dragStartScrollLeftRef = useRef(0)
  const didDragRef = useRef(false)

  const thumbsPointerCapturedRef = useRef(false)
  const thumbsPointerIdRef = useRef<number | null>(null)

  // ===== BIG IMAGE DRAG (SWIPE) =====
  const bigDragRef = useRef(false)
  const bigStartXRef = useRef(0)
  const bigStartYRef = useRef(0)
  const bigDidDragRef = useRef(false)

  // ===== MODAL DRAG + WHEEL NAV =====
  const modalDragRef2 = useRef(false)
  const modalStartXRef2 = useRef(0)
  const modalStartYRef2 = useRef(0)
  const modalDidDragRef2 = useRef(false)
  const modalWheelGateRef = useRef(0)

  // wheel -> horizontal scroll on thumbnail strip
  useEffect(() => {
    const el = thumbsRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      // якщо вже йде горизонтальний скрол (трекпад) — не чіпаємо
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return

      if (e.deltaY !== 0) {
        stopAutoplay()
        e.preventDefault()
        el.scrollLeft += e.deltaY
      }
    }

    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [stopAutoplay])

  // auto-scroll thumbnail strip when active thumb goes out of view
  useEffect(() => {
    const el = thumbsRef.current
    if (!el) return

    const active = el.querySelector<HTMLElement>(`[data-thumb-index="${currentImageIndex}"]`)
    if (!active) return

    const cRect = el.getBoundingClientRect()
    const aRect = active.getBoundingClientRect()

    const outLeft = aRect.left < cRect.left
    const outRight = aRect.right > cRect.right

    if (outLeft || outRight) {
      const targetLeft = active.offsetLeft - el.clientWidth / 2 + active.clientWidth / 2
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
      el.scrollTo({ left: targetLeft, behavior: reduce ? "auto" : "smooth" })
    }
  }, [currentImageIndex, images.length])

  const onThumbsPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return
    if (e.button !== 0) return

    const el = thumbsRef.current
    if (!el) return

    stopAutoplay()

    leadDragRef.current = true
    didDragRef.current = false
    thumbsPointerCapturedRef.current = false
    thumbsPointerIdRef.current = e.pointerId

    dragStartXRef.current = e.clientX
    dragStartScrollLeftRef.current = el.scrollLeft
  }

  const onThumbsPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!leadDragRef.current) return
    const el = thumbsRef.current
    if (!el) return

    const dx = e.clientX - dragStartXRef.current

    // захоплюємо pointer тільки коли drag точно почався
    if (Math.abs(dx) > 6) {
      didDragRef.current = true

      if (!thumbsPointerCapturedRef.current && thumbsPointerIdRef.current != null) {
        e.currentTarget.setPointerCapture(thumbsPointerIdRef.current)
        thumbsPointerCapturedRef.current = true
      }
    }

    if (didDragRef.current) {
      el.scrollLeft = dragStartScrollLeftRef.current - dx
    }
  }

  const onThumbsPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!leadDragRef.current) return
    leadDragRef.current = false

    if (thumbsPointerCapturedRef.current && thumbsPointerIdRef.current != null) {
      try {
        e.currentTarget.releasePointerCapture(thumbsPointerIdRef.current)
      } catch {
        // ok
      }
    }

    thumbsPointerCapturedRef.current = false
    thumbsPointerIdRef.current = null
  }

  // ===== NAV HELPERS =====
  const nextImage = useCallback(
    (fromUser = true) => {
      if (images.length <= 1) return
      if (fromUser) stopAutoplay()
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    },
    [images.length, stopAutoplay]
  )

  const prevImage = useCallback(
    (fromUser = true) => {
      if (images.length <= 1) return
      if (fromUser) stopAutoplay()
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    },
    [images.length, stopAutoplay]
  )

  const openModal = useCallback(
    (index: number) => {
      if (!images.length) return
      stopAutoplay()
      const safe = ((index % images.length) + images.length) % images.length
      setCurrentImageIndex(safe)
      setModalImageIndex(safe)
      setIsModalOpen(true)
    },
    [images.length, stopAutoplay]
  )

  const nextModalImage = useCallback(() => {
    if (images.length <= 1) return
    stopAutoplay()
    setModalImageIndex((prev) => {
      const next = (prev + 1) % images.length
      setCurrentImageIndex(next)
      return next
    })
  }, [images.length, stopAutoplay])

  const prevModalImage = useCallback(() => {
    if (images.length <= 1) return
    stopAutoplay()
    setModalImageIndex((prev) => {
      const next = (prev - 1 + images.length) % images.length
      setCurrentImageIndex(next)
      return next
    })
  }, [images.length, stopAutoplay])

  // ===== BIG IMAGE DRAG HANDLERS (DRAG = CHANGE SLIDE, CLICK = OPEN MODAL) =====
  const onBigPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return
    stopAutoplay()

    bigDragRef.current = true
    bigDidDragRef.current = false
    bigStartXRef.current = e.clientX
    bigStartYRef.current = e.clientY

    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onBigPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!bigDragRef.current) return

    const dx = e.clientX - bigStartXRef.current
    const dy = e.clientY - bigStartYRef.current

    // only treat as "drag" if it’s clearly horizontal
    if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
      bigDidDragRef.current = true
      e.preventDefault()
    }
  }

  const onBigPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!bigDragRef.current) return
    bigDragRef.current = false

    const dx = e.clientX - bigStartXRef.current
    const dy = e.clientY - bigStartYRef.current

    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      // ok
    }

    // If it was a drag: swipe changes slide (threshold). If too small: do nothing (don’t open modal).
    if (bigDidDragRef.current) {
      bigDidDragRef.current = false
      if (Math.abs(dx) >= 30 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) nextImage(true)
        else prevImage(true)
      }
      return
    }

    // If not dragged: open modal
    openModal(currentImageIndex)
  }

  // ===== MODAL DRAG + WHEEL =====
  const onModalPointerDown2 = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return
    stopAutoplay()

    modalDragRef2.current = true
    modalDidDragRef2.current = false
    modalStartXRef2.current = e.clientX
    modalStartYRef2.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onModalPointerMove2 = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!modalDragRef2.current) return

    const dx = e.clientX - modalStartXRef2.current
    const dy = e.clientY - modalStartYRef2.current

    if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
      modalDidDragRef2.current = true
      e.preventDefault()
    }
  }

  const onModalPointerUp2 = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!modalDragRef2.current) return
    modalDragRef2.current = false

    const dx = e.clientX - modalStartXRef2.current
    const dy = e.clientY - modalStartYRef2.current

    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      // ok
    }

    if (!modalDidDragRef2.current) return
    modalDidDragRef2.current = false

    if (Math.abs(dx) >= 30 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) nextModalImage()
      else prevModalImage()
    }
  }

  const onModalWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (images.length <= 1) return
    stopAutoplay()

    // throttle to prevent "wheel spam"
    const now = Date.now()
    if (now - modalWheelGateRef.current < 220) return
    modalWheelGateRef.current = now

    const absX = Math.abs(e.deltaX)
    const absY = Math.abs(e.deltaY)
    const d = absX > absY ? e.deltaX : e.deltaY
    if (!d) return

    e.preventDefault()
    if (d > 0) nextModalImage()
    else prevModalImage()
  }

  // автослайд (стоп, якщо модалка відкрита або user вже торкався)
  useEffect(() => {
    if (!isAutoplayEnabled) return
    if (images.length <= 1 || isModalOpen) return

    const interval = setInterval(() => {
      nextImage(false) // not a user action
    }, 5000)

    return () => clearInterval(interval)
  }, [images.length, isModalOpen, isAutoplayEnabled, nextImage])

  // Prefetch adjacent images
  useEffect(() => {
    if (images.length <= 1) return

    const prefetch = (idx: number) => {
      const url = images[idx]?.url
      if (!url) return
      const img = new window.Image()
      img.decoding = "async"
      img.loading = "eager"
      img.src = url
    }

    const next = (currentImageIndex + 1) % images.length
    const prev = (currentImageIndex - 1 + images.length) % images.length

    prefetch(next)
    prefetch(prev)
  }, [currentImageIndex, images, images.length])

  // focus trap + Escape + Arrow nav
  useEffect(() => {
    if (!isModalOpen || !modalRef.current) return

    const modal = modalRef.current
    const focusableSelectors =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

    const getFocusable = () => Array.from(modal.querySelectorAll<HTMLElement>(focusableSelectors))

    const focusable = getFocusable()
    if (focusable.length > 0) focusable[0].focus()
    else modal.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false)
        return
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault()
        prevModalImage()
        return
      }

      if (e.key === "ArrowRight") {
        e.preventDefault()
        nextModalImage()
        return
      }

      if (e.key === "Tab") {
        const items = getFocusable()
        if (items.length === 0) return

        const currentIndex = items.indexOf(document.activeElement as HTMLElement)
        let nextIndex = currentIndex

        if (e.shiftKey) nextIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1
        else nextIndex = currentIndex === items.length - 1 ? 0 : currentIndex + 1

        e.preventDefault()
        items[nextIndex]?.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isModalOpen, nextModalImage, prevModalImage])

  // lock body scroll while modal open
  useEffect(() => {
    if (!isModalOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [isModalOpen])

  // ===================== PRICE =====================
  const priceFormatted = useMemo(() => {
    const formatMoney = (amountCents: number, currencyCode: string) => {
      const code = currencyCode.toUpperCase()
      const locale = code === "UAH" ? "uk-UA" : code === "EUR" ? "de-AT" : "en-US"

      const amount = amountCents / 100
      const hasFraction = amount % 1 !== 0

      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: code,
        minimumFractionDigits: hasFraction ? 2 : 0,
        maximumFractionDigits: hasFraction ? 2 : 0,
      }).format(amount)
    }

    const getVariantAmount = (v: any) => {
      const cp = v?.calculated_price
      const calc = cp?.calculated_amount
      const cc = cp?.currency_code || region.currency_code
      if (typeof calc === "number" && cc) {
        return { amount: calc as number, currency: String(cc) }
      }

      const prices = Array.isArray(v?.prices) ? v.prices : []
      const regionCurrency = region.currency_code?.toLowerCase()

      const match =
        prices.find((p: any) => p?.currency_code?.toLowerCase() === regionCurrency) || prices[0]

      if (match && typeof match.amount === "number") {
        const currency = String(match.currency_code || region.currency_code || "usd")
        return { amount: match.amount as number, currency }
      }

      return undefined
    }

    try {
      const variants = (((product as any)?.variants ?? []) as any[]).filter(Boolean)
      if (!variants.length) return undefined

      const priced = variants
        .map((v) => getVariantAmount(v))
        .filter((p) => p && typeof (p as any).amount === "number") as Array<{
        amount: number
        currency: string
      }>

      if (!priced.length) return undefined

      priced.sort((a, b) => a.amount - b.amount)
      return formatMoney(priced[0].amount, priced[0].currency)
    } catch {
      return undefined
    }
  }, [product, region.currency_code])

  // ===================== CATEGORY BREADCRUMB =====================
  const categories = ((product as any).categories || []) as {
    id: string
    name: string
    handle: string
    parent_category?: { id: string; name: string; handle: string } | null
  }[]

  let categoryLabel: string | undefined
  let categoryHref: string | undefined

  if (categories.length) {
    const c = categories[0]
    if (c.parent_category) {
      categoryLabel = `${c.parent_category.name} / ${c.name}`
      categoryHref = `/categories/${c.parent_category.handle}/${c.handle}`
    } else {
      categoryLabel = c.name
      categoryHref = `/categories/${c.handle}`
    }
  }

  // ===================== V2 RENDER HELPERS =====================
  const renderRichBlock = (b: RichBlock, key: number) => {
    switch (b.type) {
      case "p":
        return (
          <MarkdownText key={key} text={b.text} className="mb-4 leading-relaxed text-foreground" />
        )

      case "list":
        return (
          <ul key={key} className="mb-4 ml-2 list-inside list-disc space-y-2 text-foreground">
            {b.items.map((it, i) => (
              <li key={i}>
                <MarkdownText inline text={it} />
              </li>
            ))}
          </ul>
        )

      default:
        return null
    }
  }

  const renderSidebarItem = (item: SidebarItem, key: number) => {
    switch (item.type) {
      case "text":
        return (
          <MarkdownText
            key={key}
            text={item.text}
            className={`mb-4 leading-relaxed ${
              item.variant === "muted" ? "text-muted-foreground" : "text-foreground"
            }`}
          />
        )

      case "section":
        return (
          <section key={key} className="space-y-3">
            {item.title && <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>}
            <div className="space-y-2">{item.blocks.map((b, i) => renderRichBlock(b, i))}</div>
          </section>
        )

      case "video_links":
        return (
          <section key={key} className="mb-2 flex flex-wrap gap-3">
            {item.items.map((v, i) => (
              <a
                key={i}
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#65c3c3] px-5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-95 hover:shadow-md active:brightness-90"
                aria-label={`Watch ${v.label}`}
              >
                <Play className="h-4 w-4 text-white" />
                <span>{v.label}</span>
              </a>
            ))}
          </section>
        )

      case "note":
        return (
          <article
            key={key}
            className="mb-4 rounded-sm border-l-4 border-amber-400 bg-amber-50 p-4 text-foreground/90 dark:bg-amber-950/30"
          >
            <MarkdownText text={item.text} />
          </article>
        )

      case "emphasis":
        return (
          <p key={key} className="mb-4 leading-relaxed text-foreground">
            <strong>
              <MarkdownText inline text={item.text} />
            </strong>
          </p>
        )

      default:
        return null
    }
  }

  const renderBottomItem = (item: BottomItem, key: number) => {
    switch (item.type) {
      case "section":
        return (
          <section key={key} className="space-y-3">
            <h2 className="text-pretty text-2xl font-semibold text-foreground">{item.title}</h2>
            <div className="space-y-2">{item.blocks.map((b, i) => renderRichBlock(b, i))}</div>
          </section>
        )

      case "specs":
        return (
          <section key={key} id="characteristics" className="space-y-3">
            {item.title && <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>}

            <div className="overflow-x-auto">
              <div className="inline-block min-w-full overflow-hidden rounded-3xl border border-gray-200 bg-card shadow-sm">
                 <table className="w-full text-sm table-fixed">
                    <colgroup>
                      <col className="w-[42%] sm:w-[38%]" />
                      <col className="w-[58%] sm:w-[62%]" />
                    </colgroup>

                    <tbody>
                      {item.rows.map((row, i) => (
                        <tr
                          key={i}
                          className={(i % 2 === 0 ? "bg-white" : "bg-[#f7f7f7]") + " border-b border-gray-200 last:border-b-0"}
                        >
                          <td className="px-3 sm:px-6 py-3 sm:py-4 align-middle font-semibold text-foreground break-words whitespace-normal">
                            {row[0]}
                          </td>

                          <td className="px-3 sm:pr-6 sm:pl-12 lg:pl-24 xl:pl-28 py-3 sm:py-4 align-middle text-left text-foreground">
                            <div
                              className={[
                                "min-w-0 w-full break-words whitespace-normal leading-snug",
                                "sm:max-w-[450px] sm:overflow-hidden",
                                "sm:[display:-webkit-box] sm:[-webkit-line-clamp:2] sm:[-webkit-box-orient:vertical]",
                              ].join(" ")}
                              title={row[1]}
                            >
                              {row[1]}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>
            </div>
          </section>
        )

      case "video_links":
        return (
          <section key={key} className="mb-2 flex flex-wrap gap-3">
            {item.items.map((v, i) => (
              <a
                key={i}
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 transition-colors duration-200 hover:bg-primary/5"
                aria-label={`Watch ${v.label}`}
              >
                <Play className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{v.label}</span>
              </a>
            ))}
          </section>
        )

      case "note":
        return (
          <article
            key={key}
            className="rounded-sm border-l-4 border-amber-400 bg-amber-50 p-4 text-foreground/90 dark:bg-amber-950/30"
          >
            <MarkdownText text={item.text} />
          </article>
        )

      default:
        return null
    }
  }

  // ===================== SIDEBAR "READ MORE" =====================
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)
  const sidebarItems = contentV2.sidebar ?? []
  const bottomItems = contentV2.bottom ?? []

  const title = product.title
  const subtitle = (product as any).subtitle || (product.description as string | undefined)

  // ===== Availability + SKU =====
  const availabilityRaw = String((product as any)?.metadata?.availability ?? "").toLowerCase()
  const availability =
    availabilityRaw === "in_stock"
      ? "in_stock"
      : availabilityRaw === "made_to_order"
      ? "made_to_order"
      : undefined

  const sku = String((product as any)?.variants?.[0]?.sku ?? "").trim() || undefined

  // ===================== RENDER =====================
  return (
    <article className="bg-background text-foreground">
      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false)
          }}
        >
          <div
            ref={modalRef}
            className="relative flex w-full max-w-5xl max-h-[85vh] flex-col items-center justify-center outline-none"
            tabIndex={-1}
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-12 right-0 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="relative flex w-full items-center justify-center">
              <div
                className="relative h-[85vh] w-full select-none cursor-grab active:cursor-grabbing touch-none"
                onPointerDown={onModalPointerDown2}
                onPointerMove={onModalPointerMove2}
                onPointerUp={onModalPointerUp2}
                onPointerCancel={onModalPointerUp2}
                onWheel={onModalWheel}
              >
                <Image
                  src={images[modalImageIndex].url}
                  alt={images[modalImageIndex].alt || `Product image ${modalImageIndex + 1}`}
                  fill
                  sizes="100vw"
                  quality={90}
                  className="object-contain pointer-events-none select-none"
                  draggable={false}
                  priority
                />
              </div>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevModalImage}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg transition-transform transition-colors hover:scale-105 hover:bg-white"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-7 w-7 text-gray-900" />
                  </button>

                  <button
                    type="button"
                    onClick={nextModalImage}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg transition-transform transition-colors hover:scale-105 hover:bg-white"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-7 w-7 text-gray-900" />
                  </button>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-sm text-white">
                    {modalImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top grid */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 p-6 md:p-8 lg:grid-cols-2 lg:gap-12 lg:p-12">
        {/* Gallery */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:h-fit">
          <div
            className={`group relative aspect-square overflow-hidden rounded-lg bg-muted/10 select-none ${
              images.length > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
            } touch-pan-y`}
            onPointerDown={onBigPointerDown}
            onPointerMove={onBigPointerMove}
            onPointerUp={onBigPointerUp}
            onPointerCancel={onBigPointerUp}
            role="button"
            tabIndex={0}
            aria-label="Drag to change image. Click to open full-screen gallery."
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                openModal(currentImageIndex)
                return
              }
              if (e.key === "ArrowLeft") {
                e.preventDefault()
                prevImage(true)
                return
              }
              if (e.key === "ArrowRight") {
                e.preventDefault()
                nextImage(true)
                return
              }
            }}
          >
            <Image
              src={images[currentImageIndex].url}
              alt={images[currentImageIndex].alt || `Product image ${currentImageIndex + 1}`}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              quality={85}
              className="object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none select-none"
              draggable={false}
              priority={currentImageIndex === 0}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => prevImage(true)}
              className="rounded-lg p-2 transition-colors hover:bg-muted/40"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 text-primary" />
            </button>

            <div
              ref={thumbsRef}
              className="no-scrollbar flex flex-1 gap-2 overflow-x-auto p-0.5 select-none cursor-grab active:cursor-grabbing"
              onPointerDown={onThumbsPointerDown}
              onPointerMove={onThumbsPointerMove}
              onPointerUp={onThumbsPointerUp}
              onPointerCancel={onThumbsPointerUp}
              onClickCapture={(e) => {
                // якщо був drag — прибираємо клік по мініатюрах
                if (didDragRef.current) {
                  e.preventDefault()
                  e.stopPropagation()
                  didDragRef.current = false
                }
              }}
            >
              {images.map((image, index) => (
                <button
                  type="button"
                  key={index}
                  data-thumb-index={index}
                  onClick={() => {
                    stopAutoplay()
                    setCurrentImageIndex(index)
                    if (isModalOpen) setModalImageIndex(index)
                  }}
                  className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                    index === currentImageIndex ? "ring-2 ring-primary" : "opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`View image ${index + 1}`}
                  aria-pressed={index === currentImageIndex}
                >
                  <Image
                    src={image.url}
                    alt={image.alt || `Thumbnail ${index + 1}`}
                    fill
                    sizes="64px"
                    quality={60}
                    loading="lazy"
                    className="object-cover pointer-events-none select-none"
                    draggable={false}
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => nextImage(true)}
              className="rounded-lg p-2 transition-colors hover:bg-muted/40"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5 text-primary" />
            </button>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            {categoryLabel && categoryHref && (
              <Link
                href={categoryHref}
                className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-dark"
              >
                {categoryLabel}
              </Link>
            )}

            <h1 className="text-balance text-3xl font-bold text-foreground md:text-4xl">{title}</h1>

            {/* Price + SKU + Availability in one row */}
            {(priceFormatted || sku || availability) && (
              <div className="mt-4 flex items-start gap-6">
                {priceFormatted && (
                  <div className="shrink-0 text-4xl font-semibold leading-none text-primary">
                    {priceFormatted}
                  </div>
                )}

                {(sku || availability) && (
                  <div className="flex flex-col gap-1">
                    {sku && (
                      <div className="text-sm md:text-base font-medium leading-none text-neutral-400/80">
                        {sku}
                      </div>
                    )}

                    {availability && (
                      <div className="inline-flex items-center gap-2 text-sm md:text-base font-semibold">
                        <span
                          className={
                            "h-2.5 w-2.5 rounded-full " +
                            (availability === "in_stock" ? "bg-emerald-500" : "bg-[#E86D5E]")
                          }
                        />
                        <span
                          className={availability === "in_stock" ? "text-emerald-600" : "text-[#E86D5E]"}
                        >
                          {availability === "in_stock" ? "В наявності" : "Під замовлення"}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {subtitle && <p className="mt-3 text-lg text-muted-foreground">{subtitle}</p>}
          </div>

          <ProductActions
            product={product}
            region={region}
            renderButtons={({ addToCart, isAdding, disabled }) => (
              <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:gap-4">
                <Button
                  size="lg"
                  variant="primary"
                  className="
                    w-full sm:flex-1
                    h-12 sm:h-11
                    rounded-full
                    px-6 sm:px-8
                    text-[15px] sm:text-base
                    font-semibold
                    shadow-sm
                    active:scale-[0.99]
                    disabled:opacity-60
                  "
                  onClick={addToCart}
                  disabled={disabled}
                >
                  {isAdding ? "Додаю..." : "Додати в кошик"}
                </Button>

                <Button
                  size="lg"
                  variant="accentOutline"
                  className="
                    w-full sm:flex-1
                    h-12 sm:h-11
                    rounded-full
                    px-6 sm:px-8
                    text-[15px] sm:text-base
                    font-semibold
                    border-2
                    active:scale-[0.99]
                    disabled:opacity-60
                  "
                  onClick={async () => {
                    await addToCart()
                    router.push(`/${countryCode}/cart`)
                  }}
                  disabled={disabled}
                >
                  Купити в один клік
                </Button>
              </div>
            )}
          />
 
          <ServiceInfoBar />
          <button
            type="button"
            onClick={() => {
              document.getElementById("characteristics")?.scrollIntoView({ behavior: "smooth" })
            }}
            className="text-sm font-medium text-primary hover:underline"
            aria-label="Scroll to characteristics table"
          >
            Див. характеристики
          </button>

          {/* Sidebar content (V2) */}
          {sidebarItems.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <div
                className={`transition-all duration-300 ${
                  isSidebarExpanded ? "max-h-none" : "max-h-80 overflow-hidden"
                }`}
              >
                <div className="space-y-4">
                  {sidebarItems.map((item, i) => renderSidebarItem(item, i))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSidebarExpanded((v) => !v)}
                className="mt-4 text-sm font-medium text-primary hover:underline"
                aria-expanded={isSidebarExpanded}
              >
                {isSidebarExpanded ? "Згорнути" : "Більше"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom (V2) */}
      {bottomItems.length > 0 && (
        <div className="border-t border-gray-200">
          <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
            <article className="space-y-8">
              {bottomItems.map((item, i) => renderBottomItem(item, i))}
            </article>
          </div>
        </div>
      )}
    </article>
  )
}
