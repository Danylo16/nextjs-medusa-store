 
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react"
import { HttpTypes } from "@medusajs/types"
import { Button } from "../../../common/UI/button"
import ProductActions from "../product-actions"
import { useParams, useRouter } from "next/navigation"

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

export type RichBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }

// ===================== PROPS =====================
type ProductDetailCardProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  content: ProductContentV2[]
}

 export function ProductDetailCard({
  product,
  region,
  content,
}: ProductDetailCardProps) {

  const router = useRouter()
  const countryCode = useParams().countryCode as string

  const contentV2 = content?.[0]

  if (!contentV2 || contentV2.version !== 2) {
    console.error("Invalid ProductContentV2 payload:", content)
    return null
  }


  // ===================== IMAGES =====================
  const rawImages =
    product.images?.map((img) => ({
      url: img.url,
      alt: product.title || "Product image",
    })) || []

  const images =
    rawImages.length > 0
      ? rawImages
      : [{ url: "/placeholder.svg", alt: "No image available" }]

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)

  const modalRef = useRef<HTMLDivElement | null>(null)

  // автослайд (стоп, якщо модалка відкрита)
  useEffect(() => {
    if (images.length <= 1 || isModalOpen) return
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [images.length, isModalOpen])

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length)
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)

  const nextModalImage = () => setModalImageIndex((prev) => (prev + 1) % images.length)
  const prevModalImage = () => setModalImageIndex((prev) => (prev - 1 + images.length) % images.length)

  const openModal = (index: number) => {
    if (!images.length) return
    setModalImageIndex(index)
    setIsModalOpen(true)
  }

  // focus trap + Escape + Arrow nav
  useEffect(() => {
    if (!isModalOpen || !modalRef.current) return

    const modal = modalRef.current
    const focusableSelectors =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

    const getFocusable = () =>
      Array.from(modal.querySelectorAll<HTMLElement>(focusableSelectors))

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
  }, [isModalOpen, images.length])

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
      prices.find((p: any) => p?.currency_code?.toLowerCase() === regionCurrency) ||
      prices[0]

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
      .filter((p) => p && typeof p.amount === "number") as Array<{
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
          <p key={key} className="mb-4 leading-relaxed text-foreground">
            {b.text}
          </p>
        )
      case "list":
        return (
          <ul
            key={key}
            className="mb-4 ml-2 list-inside list-disc space-y-2 text-foreground"
          >
            {b.items.map((it, i) => (
              <li key={i}>{it}</li>
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
          <p
            key={key}
            className={`mb-4 leading-relaxed ${
              item.variant === "muted" ? "text-muted-foreground" : "text-foreground"
            }`}
          >
            {item.text}
          </p>
        )
      case "section":
        return (
          <section key={key} className="space-y-3">
            {item.title && (
              <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
            )}
            <div className="space-y-2">
              {item.blocks.map((b, i) => renderRichBlock(b, i))}
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
            {item.text}
          </article>
        )
      case "emphasis":
        return (
          <p key={key} className="mb-4 leading-relaxed text-foreground">
            <strong>{item.text}</strong>
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
            <h2 className="text-pretty text-2xl font-semibold text-foreground">
              {item.title}
            </h2>
            <div className="space-y-2">
              {item.blocks.map((b, i) => renderRichBlock(b, i))}
            </div>
          </section>
        )
      case "specs":
        return (
          <section key={key} id="characteristics" className="space-y-3">
            {item.title && (
              <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
            )}

            <div className="overflow-x-auto">
              <div className="inline-block min-w-full overflow-hidden rounded-3xl border border-gray-200 bg-card shadow-sm">
                <table className="w-full text-sm">
                  <tbody>
                    {item.rows.map((row, i) => (
                      <tr
                        key={i}
                        className={
                          (i % 2 === 0 ? "bg-white" : "bg-[#f7f7f7]") +
                          " border-b border-gray-200 last:border-b-0"
                        }
                      >
                        <td className="max-w-xs px-6 py-4 font-semibold text-foreground">
                          {row[0]}
                        </td>
                        <td className="px-6 py-4 text-center text-foreground">
                          {row[1]}
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
        // внизу — той самий UI, тільки семантично це bottom
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
            {item.text}
          </article>
        )
      default:
        return null
    }
  }

  // ===================== SIDEBAR "READ MORE" (CSS-only, no content removal) =====================
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)
  const sidebarItems = contentV2.sidebar ?? []
  const bottomItems = contentV2.bottom ?? []

  const title = product.title
  const subtitle = (product as any).subtitle || (product.description as string | undefined)

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
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-12 right-0 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black"
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="relative flex w-full items-center justify-center">
              <div className="relative h-[85vh] w-full">
                <Image
                  src={images[modalImageIndex].url}
                  alt={images[modalImageIndex].alt || `Product image ${modalImageIndex + 1}`}
                  fill
                  sizes="100vw"
                  quality={100}
                  className="object-contain"
                  priority
                />
              </div>

              {images.length > 1 && (
                <>
                  <button
                    onClick={prevModalImage}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg transition-transform transition-colors hover:scale-105 hover:bg-white"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-7 w-7 text-gray-900" />
                  </button>

                  <button
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
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-muted/10"
            onClick={() => openModal(currentImageIndex)}
            role="button"
            tabIndex={0}
            aria-label="Click to view full-screen gallery"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                openModal(currentImageIndex)
              }
            }}
          >
            <Image
              src={images[currentImageIndex].url}
              alt={images[currentImageIndex].alt || `Product image ${currentImageIndex + 1}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={prevImage}
              className="rounded-lg p-2 transition-colors hover:bg-muted/40"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 text-primary" />
            </button>

            <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                    index === currentImageIndex ? "ring-2 ring-primary" : "opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`View image ${index + 1}`}
                  aria-pressed={index === currentImageIndex}
                >
                  <Image src={image.url} alt={image.alt || `Thumbnail ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>

            <button
              onClick={nextImage}
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

            <h1 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
              {title}
            </h1>

            {subtitle && <p className="text-lg text-muted-foreground">{subtitle}</p>}
          </div>

          {priceFormatted && (
            <div className="text-3xl font-semibold text-[#65c3c3]">
              {priceFormatted}
            </div>
          )}

            <ProductActions
  product={product}
  region={region}
  renderButtons={({ addToCart, isAdding, disabled }) => (
    <div className="flex flex-col sm:flex-row gap-4 pt-2">
      <Button
        size="lg"
        variant="primary"
        className="flex-1 px-8 text-base"
        onClick={addToCart}
        disabled={disabled}
      >
        {isAdding ? "Додаю..." : "Додати в кошик"}
      </Button>

       <Button
          size="lg"
          variant="accentOutline"
          className="flex-1 px-8 text-base"
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

          <button
            onClick={() => {
              document.getElementById("characteristics")?.scrollIntoView({ behavior: "smooth" })
            }}
            className="text-sm font-medium text-primary hover:underline"
            aria-label="Scroll to characteristics table"
          >
            View Characteristics
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

              {/* Показуємо кнопку тільки якщо контент реально може бути довгим */}
              <button
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
         <div className="border-t border-gray-200   ">
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
 