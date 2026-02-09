// src/app/[countryCode]/(main)/search/page.tsx

import Link from "next/link"
import { HttpTypes } from "@medusajs/types"
import { sdk } from "@lib/config"
import { listProducts } from "@lib/data/products"
import PopularProducts from "./components/popular-products"
import { Metadata } from "next"
import ProductPreview from "@modules/products/components/product-preview"
import type { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getProductPrice } from "@lib/util/get-product-price"

export const metadata: Metadata = {
  title: "Пошук",
  description: "Search products in the store",
  robots: {
    index: false,
    follow: false,
  },
}

type SearchPageProps = {
  params: { countryCode: string }
  searchParams: { q?: string | string[]; sortBy?: string | string[] }
}

const SORT_VALUES: SortOptions[] = ["created_at", "price_asc", "price_desc"]

function parseSortBy(raw: string | string[] | undefined): SortOptions {
  const v = Array.isArray(raw) ? raw[0] : raw
  return SORT_VALUES.includes(v as SortOptions) ? (v as SortOptions) : "created_at"
}

function parseQ(raw: string | string[] | undefined): string {
  const v = Array.isArray(raw) ? raw[0] : raw
  return (v || "").trim()
}

const isSkuLike = (input: string) => {
  const q = input.trim()
  if (!q) return false
  return q.toLowerCase().startsWith("mtb") || /^[A-Za-z0-9-]{3,}$/.test(q)
}

const normalizeSku = (s: string) => s.trim().replace(/\s+/g, "-")

const buildSuggestionChips = (_q: string) => {
  // Stable chips only (do not echo user garbage)
  return ["Манжети", "Лава", "Аксесуари", "Вага"]
}

async function getRegionByCountryCode(countryCode: string) {
  const cc = (countryCode || "").toLowerCase()

  const data = await sdk.client.fetch<{ regions: HttpTypes.StoreRegion[] }>("/store/regions", {
    method: "GET",
    cache: "force-cache",
  })

  const region =
    data?.regions?.find((r) =>
      (r.countries || []).some((c: any) => (c?.iso_2 || "").toLowerCase() === cc)
    ) || null

  if (!region) throw new Error(`Region not found for countryCode="${countryCode}"`)
  return region
}

function pluralUa(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

/**
 * Extract numeric price for sorting.
 * Tries your getProductPrice helper first, then falls back to best-effort variant parsing.
 */
function getProductPriceNumber(product: HttpTypes.StoreProduct): number {
  try {
    const { cheapestPrice } = getProductPrice({ product } as any)

    // Common numeric fields in many medusa storefront implementations
    const numericCandidates = [
      (cheapestPrice as any)?.calculated_price_number,
      (cheapestPrice as any)?.original_price_number,
      (cheapestPrice as any)?.calculated_amount,
      (cheapestPrice as any)?.original_amount,
      (cheapestPrice as any)?.amount,
    ]

    for (const c of numericCandidates) {
      if (typeof c === "number" && Number.isFinite(c)) return c
    }

    // Sometimes helper returns formatted strings — parse digits as fallback
    const stringCandidates = [
      (cheapestPrice as any)?.calculated_price,
      (cheapestPrice as any)?.original_price,
      (cheapestPrice as any)?.price,
    ]

    for (const s of stringCandidates) {
      if (typeof s === "string") {
        const cleaned = s.replace(/[^\d.,-]/g, "").replace(",", ".")
        const n = Number(cleaned)
        if (Number.isFinite(n)) return n
      }
    }
  } catch {
    // ignore, fall back below
  }

  // Fallback: scan variants for any numeric amount-like field
  const variants = ((product as any)?.variants || []) as any[]
  let min = Infinity

  for (const v of variants) {
    const candidates = [
      v?.calculated_price?.calculated_amount,
      v?.calculated_price?.amount,
      v?.calculated_amount,
      v?.prices?.[0]?.amount,
    ]
    for (const c of candidates) {
      if (typeof c === "number" && Number.isFinite(c)) {
        min = Math.min(min, c)
      }
    }
  }

  return min
}

function sortProducts(products: HttpTypes.StoreProduct[], sortBy: SortOptions) {
  const arr = [...products]

  if (sortBy === "created_at") {
    // Newest first
    arr.sort((a: any, b: any) => {
      const ta = a?.created_at ? new Date(a.created_at).getTime() : 0
      const tb = b?.created_at ? new Date(b.created_at).getTime() : 0
      return tb - ta
    })
    return arr
  }

  if (sortBy === "price_asc") {
    arr.sort((a, b) => {
      const pa = getProductPriceNumber(a)
      const pb = getProductPriceNumber(b)
      // Put "no price" at the end
      if (!Number.isFinite(pa) && !Number.isFinite(pb)) return 0
      if (!Number.isFinite(pa)) return 1
      if (!Number.isFinite(pb)) return -1
      return pa - pb
    })
    return arr
  }

  // price_desc
  arr.sort((a, b) => {
    const pa = getProductPriceNumber(a)
    const pb = getProductPriceNumber(b)
    if (!Number.isFinite(pa) && !Number.isFinite(pb)) return 0
    if (!Number.isFinite(pa)) return 1
    if (!Number.isFinite(pb)) return -1
    return pb - pa
  })
  return arr
}

function SearchSidebar({
  countryCode,
  q,
  sortBy,
}: {
  countryCode: string
  q: string
  sortBy: SortOptions
}) {
  const chips = buildSuggestionChips(q)

  const sortOptions: { value: SortOptions; label: string; hint?: string }[] = [
    { value: "created_at", label: "Новинки", hint: "Нові надходження" },
    { value: "price_asc", label: "Ціна: від дешевих", hint: "Зростання" },
    { value: "price_desc", label: "Ціна: від дорогих", hint: "Спадання" },
  ]

  const mkHref = (nextSort: SortOptions) =>
    `/${countryCode}/search?q=${encodeURIComponent(q)}&sortBy=${encodeURIComponent(nextSort)}`

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-foreground">Сортування</div>
        </div>

        <div className="space-y-2">
          {sortOptions.map((opt) => {
            const checked = sortBy === opt.value

            return (
              <Link
                key={opt.value}
                href={mkHref(opt.value)}
                className={[
                  "group flex items-center gap-3 rounded-xl px-3 py-2 cursor-pointer",
                  "ring-1 ring-black/5 bg-muted/30 hover:bg-muted/60 transition-colors",
                  checked ? "bg-primary/5 ring-primary/25" : "",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="sort"
                  checked={checked}
                  readOnly
                  tabIndex={-1}
                  aria-hidden="true"
                  className="h-4 w-4 accent-primary"
                />

                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground/90">{opt.label}</div>
                  {opt.hint ? <div className="text-xs text-foreground/55">{opt.hint}</div> : null}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <div>
        <div className="text-sm font-semibold">Швидкі запити</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map((s) => (
            <Link
              key={s}
              href={`/${countryCode}/search?q=${encodeURIComponent(s)}`}
              className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary-light/60 transition-colors"
            >
              {s}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <Link
          href={`/${countryCode}/store`}
          className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-dark transition-colors"
        >
          Перейти до каталогу
        </Link>
      </div>
    </div>
  )
}

/**
 
 */
function EmptyResults({
  countryCode,
  q,
  isSkuQuery,
  recommendations,
}: {
  countryCode: string
  q: string
  isSkuQuery: boolean
  recommendations: HttpTypes.StoreProduct[]
}) {
  const chips = ["MTB-45", "MTB-1", "Манжети", "Лава", "Аксесуари"]

  const baseClasses =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap " +
    "transition-all duration-200 ease-out cursor-pointer select-none " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary " +
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"

  const sizeLg = "h-12 px-6 text-base"

  const primary =
    "bg-primary text-primary-foreground " +
    "hover:brightness-90 " +
    "shadow-[0_1px_4px_rgba(0,0,0,0.05)] " +
    "hover:shadow-[0_2px_8px_rgba(0,0,0,0.10)]"

  const outline = "border border-accent text-accent bg-transparent hover:bg-accent hover:text-white"

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px] items-start">
      <div className="card-soft border border-border p-6 md:p-10">
        <div className="mx-auto max-w-[580px] text-center">
          <div className="mx-auto mb-6 w-14 h-14 rounded-full flex items-center justify-center bg-[#f7dde280]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M16.5 16.5 21 21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h2 className="text-3xl-semi">Нічого не знайдено</h2>

          <p className="mt-3 text-base-regular text-muted-foreground">
            Ми не знайшли результатів для{" "}
            <span className="font-semibold text-foreground">“{q}”</span>.
            {isSkuQuery
              ? " Схоже, ви шукаєте артикул — перевір формат."
              : " Перевірте написання або спробуйте інший запит."}
          </p>

          <div className="mt-8 rounded-2xl bg-[#f7dde280] p-5 text-left border border-border">
            <div className="text-xs font-semibold tracking-widest text-foreground/70 uppercase">
              Спробуйте ось це
            </div>

            <ul className="mt-3 space-y-2 text-sm text-foreground/80">
              <li className="flex gap-2">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                Приберіть зайві символи або скоротіть запит (1–2 слова).
              </li>

              <li className="flex gap-2">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                Якщо це артикул: спробуйте{" "}
                <span className="font-semibold text-foreground">MTB-16</span> або{" "}
                <span className="font-semibold text-foreground">MTB 16</span>.
              </li>

              <li className="flex gap-2">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                Спробуйте іншу назву: “манжети”, “аксесуари”, “лава”.
              </li>
            </ul>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/${countryCode}/store`} className={`${baseClasses} ${primary} ${sizeLg}`}>
              До каталогу
            </Link>

            <Link href={`/${countryCode}`} className={`${baseClasses} ${outline} ${sizeLg}`}>
              На головну
            </Link>
          </div>

          <div className="mt-8">
            <div className="text-sm font-semibold text-foreground text-left sm:text-center">
              Швидкі запити:
            </div>
            <div className="mt-3 flex flex-wrap gap-2 justify-start sm:justify-center">
              {chips.map((s) => (
                <Link
                  key={s}
                  href={`/${countryCode}/search?q=${encodeURIComponent(s)}`}
                  className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary-light/60 transition-colors"
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[420px]">
        <PopularProducts countryCode={countryCode} products={recommendations} initiallyVisible={3} />
        <div className="mt-4 text-xs text-muted-foreground">
          Порада: якщо ти шукаєш конкретну модель — введи артикул повністю (наприклад, MTB-45).
        </div>
      </div>
    </div>
  )
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const countryCode = params.countryCode
  const q = parseQ(searchParams.q)
  const sortBy = parseSortBy(searchParams.sortBy)

  if (!q) {
    return (
      <div className="content-container py-10 md:py-14">
        <div className="min-h-[35vh] flex items-center">
          <div className="w-full card-soft border border-border p-6 md:p-10">
            <h1 className="text-3xl-semi">Пошук</h1>
            <p className="mt-2 text-base-regular text-muted-foreground">
              Введіть запит у полі пошуку зверху. Наприклад:{" "}
              <span className="font-semibold text-foreground">MTB-45</span>,{" "}
              <span className="font-semibold text-foreground">манжети</span>,{" "}
              <span className="font-semibold text-foreground">аксесуари</span>.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/${countryCode}/store`}
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-dark transition-colors"
              >
                Відкрити каталог
              </Link>
              <Link href={`/${countryCode}`} className="contrast-btn">
                На головну
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  let products: HttpTypes.StoreProduct[] = []
  let recommendations: HttpTypes.StoreProduct[] = []
  const skuQuery = isSkuLike(q)

  // 1) SKU-first via /store/search → handles
  if (skuQuery) {
    try {
      const sku = normalizeSku(q)

      const result = await sdk.client.fetch<{ handles: string[]; count: number }>("/store/search", {
        method: "GET",
        query: { sku, limit: 24 },
        cache: "no-store",
      })

      const handles = (result.handles || []).slice(0, 24)

      if (handles.length) {
        const fetched = await Promise.all(
          handles.map(async (handle) => {
            const { response } = await listProducts({
              countryCode,
              queryParams: { limit: 1, handle } as any,
            })
            return response.products?.[0] ?? null
          })
        )

        products = fetched.filter(Boolean) as HttpTypes.StoreProduct[]
      }
    } catch {
      // silent fallback
    }
  }

  // 2) fallback: normal fulltext q
  if (products.length === 0) {
    const { response } = await listProducts({
      countryCode,
      queryParams: { q, limit: 24 } as any,
    })
    products = response.products || []
  }

  // Apply sorting HERE (this is what you were missing)
  products = sortProducts(products, sortBy)

  // 3) empty state
  if (products.length === 0) {
    try {
      const { response } = await listProducts({
        countryCode,
        queryParams: { limit: 8 } as any,
      })
      recommendations = response.products || []
    } catch {
      recommendations = []
    }

    return (
      <div className="content-container py-10 md:py-14">
        <h1 className="text-2xl font-semibold mb-6">Результати пошуку: “{q}”</h1>

        <EmptyResults
          countryCode={countryCode}
          q={q}
          isSkuQuery={skuQuery}
          recommendations={recommendations}
        />
      </div>
    )
  }

  const region = await getRegionByCountryCode(countryCode)
  const total = products.length
  const totalLabel = `${total} ${pluralUa(total, "товар", "товари", "товарів")}`

  return (
    <section className="section">
      <div className="content-container">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr] items-start">
          {/* MAIN first on mobile, second on desktop */}
          <main className="min-w-0 order-1 lg:order-2">
            <header className="mb-6 flex flex-col gap-2">
              <h1 data-testid="search-page-title">Результати пошуку</h1>

              <p className="text-base-regular text-foreground/70">
                Запит: <span className="font-semibold text-foreground">“{q}”</span>
                <span className="mx-2">•</span>
                Знайдено: <span className="font-semibold text-foreground">{totalLabel}</span>
              </p>
            </header>

            {/* Mobile: 1 item per row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductPreview key={p.id} product={p} region={region} countryCode={countryCode} />
              ))}
            </div>

            <div className="mt-10 text-sm text-foreground/70 leading-relaxed">
              MTB1-4 — магазин реабілітаційних тренажерів та аксесуарів. Шукайте за артикулами (MTB-1…MTB-45) або за
              назвою товару.
            </div>
          </main>

          {/* Sidebar after results on mobile, left on desktop */}
          <aside className="card-soft p-5 h-fit order-2 lg:order-1 lg:sticky lg:top-24">
            <SearchSidebar countryCode={countryCode} q={q} sortBy={sortBy} />
          </aside>
        </div>
      </div>
    </section>
  )
}
