// src/app/[countryCode]/(main)/categories/[...categoryHandle]/page.tsx

import { notFound } from "next/navigation"
import Link from "next/link"
import type { HttpTypes } from "@medusajs/types"
import { sdk } from "@lib/config"
import { getCategoryByHandle } from "@lib/data/categories"
import ProductPreview from "@modules/products/components/product-preview"
import Image from "next/image"
import type { Metadata } from "next"


type CategoryPageParams = {
  countryCode: string
  categoryHandle: string[]
}

type CategoryPageProps = {
  params: CategoryPageParams
}

type Crumb = {
  label: string
  href?: string
}

function categoryHref(countryCode: string, handles: string[]) {
  return `/${countryCode}/categories/${handles.filter(Boolean).join("/")}`
}

function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-small-regular text-muted">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((c, idx) => {
          const last = idx === items.length - 1
          return (
            <li key={`${c.label}-${idx}`} className="flex items-center gap-1.5">
              {c.href && !last ? (
                <Link className="hover:text-foreground transition-colors" href={c.href}>
                  {c.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className="text-foreground/80">
                  {c.label}
                </span>
              )}
              {!last && <span className="text-muted">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function CountPill({ text }: { text: string }) {
  return (
    <span className="hidden sm:inline-flex items-center rounded-full border border-muted/70 bg-card px-3 py-1 text-xs text-foreground/80 shadow-soft">
      {text}
    </span>
  )
}
 

function SidebarNav({
  title,
  items,
  activeHandle,
  baseHref,
}: {
  title: string
  items: { name: string; handle: string }[]
  activeHandle?: string
  baseHref: (handle: string) => string
}) {
  if (!items.length) return null

  return (
    <div className="space-y-2">
      <div className="text-small-regular font-semibold text-foreground/80">{title}</div>

      <div className="space-y-1">
        {items.map((c) => {
          const active = activeHandle === c.handle
          return (
            <Link
              key={c.handle}
              href={baseHref(c.handle)}
              aria-current={active ? "page" : undefined}
              className={[
                "flex items-center justify-between gap-3 rounded-xl px-3 py-2",
                "ring-1 ring-black/5 bg-card",
                "transition-all",
                "hover:bg-muted/40 hover:ring-black/10",
                active ? "bg-muted/50 ring-black/10" : "",
              ].join(" ")}
            >
              <span className="text-sm font-medium text-foreground/85 line-clamp-2">
                {c.name}
              </span>
              <span className={["text-foreground/35 transition-colors", active ? "text-primary" : ""].join(" ")}>
                →
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

 function CategorySidebar({
  countryCode,
  title,
  description,
  navTitle,
  navItems,
  activeHandle,
  navHrefBuilder,
  backHref,
}: {
  countryCode: string
  title: string
  description?: string | null
  navTitle: string
  navItems: { name: string; handle: string }[]
  activeHandle?: string
  navHrefBuilder: (handle: string) => string
  backHref?: string
}) {
  return (
    <aside className="lg:sticky lg:top-24">
      <div className="card-soft rounded-2xl p-4 shadow-soft ring-1 ring-black/5 space-y-5">
        <div className="space-y-2">
          <div className="text-small-regular font-semibold text-foreground/80">
            Про категорію
          </div>

          <div className="text-base font-semibold text-foreground">{title}</div>

          {description ? (
            <p className="text-sm leading-relaxed text-foreground/65">{description}</p>
          ) : (
            <p className="text-sm leading-relaxed text-foreground/45">
              Опис для цієї категорії поки не додано.
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-muted/60">
          <SidebarNav
            title={navTitle}
            items={navItems}
            activeHandle={activeHandle}
            baseHref={navHrefBuilder}
          />
        </div>

        {/* Bottom actions row */}
        <div className="pt-3 border-t border-muted/60 flex items-center justify-between gap-3">
          {backHref ? (
            <Link
              href={backHref}
              className="group inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
            >
              <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
                ←
              </span>
              <span>Назад</span>
            </Link>
          ) : (
            <span />
          )}

          <Link
            href={`/${countryCode}/store`}
            className="group inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
          >
            <span>Перейти до каталогу товарів</span>
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>
      </div>
    </aside>
  )
}



function SubcategoryCards({
  countryCode,
  parentHandle,
  items,
}: {
  countryCode: string
  parentHandle: string
  items: HttpTypes.StoreProductCategory[]
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((c) => {
        // Read optional image from category metadata
        const img =
          String((c as any)?.metadata?.image || (c as any)?.metadata?.thumbnail || "").trim()

        return (
          <Link
            key={c.id}
            href={categoryHref(countryCode, [parentHandle, c.handle])}
            className={[
              "group card-soft flex h-full flex-col overflow-hidden rounded-2xl",
              "shadow-soft ring-1 ring-black/5",
              "transition-all duration-200",
              "hover:-translate-y-0.5 hover:shadow-medium hover:ring-black/10",
            ].join(" ")}
          >
            <div className="relative aspect-[16/11] bg-muted">
              {img ? (
                <>
                  <Image
                    src={img}
                    alt={c.name}
                    fill
                    // Use contain to avoid ugly cropping for product-like images
                    className="object-contain p-6 transition-transform duration-200 group-hover:scale-[1.02]"
                    sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent"
                  />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-14 w-14 rounded-2xl bg-white/70 ring-1 ring-black/5 flex items-center justify-center text-lg font-semibold text-foreground/70">
                    {(c.name || "?").trim().slice(0, 1).toUpperCase()}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold leading-snug text-foreground/90 line-clamp-2">
                  {c.name}
                </h3>

                <span className="text-foreground/35 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary">
                  →
                </span>
              </div>

              {c.description ? (
                <p className="mt-1 text-sm text-foreground/55 line-clamp-2">
                  {c.description}
                </p>
              ) : (
                <p className="mt-1 text-sm text-foreground/40 line-clamp-2">
                  Перейти до підкатегорії
                </p>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
 

function ProductPreviewGrid({
  products,
  region,
  countryCode,
}: {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  countryCode: string
}) {
  if (!products.length) {
    return (
      <p className="text-large-regular text-muted">
        У цій категорії поки немає товарів.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductPreview
          key={p.id}
          product={p}
          region={region}
          countryCode={countryCode}
        />
      ))}
    </div>
  )
}


function buildMetaDescription(
  desc: string | null | undefined,
  name: string,
  parentName?: string
) {
  const d = String(desc ?? "").trim()

  if (d) {
    
    return d.length > 160 ? d.slice(0, 157).trimEnd() + "…" : d
  }

   
  return parentName
    ? `Категорія “${name}” у розділі “${parentName}”. Перегляньте асортимент, характеристики та ціни.`
    : `Категорія “${name}”. Перегляньте асортимент, характеристики та ціни.`
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { categoryHandle } = params
  const [categorySlug, subcategorySlug] = categoryHandle ?? []

  //  / No category in URL, show generic metadata for categories section
  if (!categorySlug) {
    return {
      title: "Категорія",
      description: "Каталог товарів за категоріями.",
    }
  }

  const category = await getCategoryByHandle(categorySlug)

  if (!category) {
    return {
      title: "Категорія",
      description: "Каталог товарів за категоріями.",
    }
  }

  // /cat/subcat
  if (subcategorySlug) {
    const subcategory = await getCategoryByHandle(subcategorySlug)

    const valid =
      !!subcategory && subcategory.parent_category?.id === category.id

    if (!valid) {
      // якщо підкатегорія не належить батьківській — не вигадуємо, даємо мету батьківської
      return {
        title: category.name,
        description: buildMetaDescription(category.description, category.name),
      }
    }

    return {
      title: `${subcategory.name} | ${category.name}`,
      description: buildMetaDescription(
        subcategory.description,
        subcategory.name,
        category.name
      ),
    }
  }

  // /cat
  return {
    title: category.name,
    description: buildMetaDescription(category.description, category.name),
  }
}


export default async function CategoryPage({ params }: CategoryPageProps) {
  const { countryCode, categoryHandle } = params
  const [categorySlug, subcategorySlug] = categoryHandle ?? []

  if (!categorySlug) return notFound()

  const category = await getCategoryByHandle(categorySlug)
  if (!category) return notFound()

  // ProductPreview relies on region-aware prices, so we must resolve region and pass region_id when fetching products
  const region = await fetchRegionByCountryCode(countryCode)

  // Case A: /cat/subcat
  if (subcategorySlug) {
    const subcategory = await getCategoryByHandle(subcategorySlug)

    // Validate that this subcategory belongs to the parent category
    if (!subcategory || subcategory.parent_category?.id !== category.id) {
      return notFound()
    }

    const products = await fetchProductsByCategoryId(subcategory.id, region.id)

    const crumbs: Crumb[] = [
      { label: "Головна", href: `/${countryCode}` },
      { label: category.name, href: categoryHref(countryCode, [category.handle]) },
      { label: subcategory.name },
    ]

    const siblings = (category.category_children || []) as HttpTypes.StoreProductCategory[]

    return (
      <section className="section">
        <div className="content-container space-y-5">
          <Breadcrumbs items={crumbs} />

          <div className="flex items-end justify-between gap-4">
            <h1 className="text-[40px] leading-tight">{subcategory.name}</h1>
            <CountPill text={`${products.length} товар(ів)`} />
          </div>

          <div className="grid grid-cols-12 gap-6 lg:gap-8">
            <div className="col-span-12 lg:col-span-4">
               <CategorySidebar
              countryCode={countryCode}
              title={subcategory.name}
              description={subcategory.description}
              backHref={categoryHref(countryCode, [category.handle])}
              navTitle="Підкатегорії"
              navItems={siblings.map((c) => ({ name: c.name, handle: c.handle }))}
              activeHandle={subcategory.handle}
              navHrefBuilder={(h) => categoryHref(countryCode, [category.handle, h])}
            />

            </div>

            <div className="col-span-12 lg:col-span-8">
              <div className="max-w-[980px]">
                <ProductPreviewGrid
                  products={products}
                  region={region}
                  countryCode={countryCode}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Case B: /cat
  const children = (category.category_children || []) as HttpTypes.StoreProductCategory[]

  const crumbs: Crumb[] = [
    { label: "Головна", href: `/${countryCode}` },
    { label: category.name },
  ]

  // B1: Has subcategories
  if (children.length > 0) {
    return (
      <section className="section">
        <div className="content-container space-y-5">
          <Breadcrumbs items={crumbs} />

          <div className="flex items-end justify-between gap-4">
            <h1 className="text-[40px] leading-tight">{category.name}</h1>
            <CountPill text={`${children.length} підкатегорій`} />
          </div>

          <div className="grid grid-cols-12 gap-6 lg:gap-8">
            <div className="col-span-12 lg:col-span-4">
              <CategorySidebar
                countryCode={countryCode}
                title={category.name}
                description={category.description}
                navTitle="Підкатегорії"
                navItems={children.map((c) => ({ name: c.name, handle: c.handle }))}
                navHrefBuilder={(h) => categoryHref(countryCode, [category.handle, h])}
              />
            </div>

            <div className="col-span-12 lg:col-span-8">
              <div className="max-w-[980px]">
                <SubcategoryCards
                  countryCode={countryCode}
                  parentHandle={category.handle}
                  items={children}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // B2: No subcategories -> show products directly
  const products = await fetchProductsByCategoryId(category.id, region.id)

  return (
    <section className="section">
      <div className="content-container space-y-5">
        <Breadcrumbs items={crumbs} />

        <div className="flex items-end justify-between gap-4">
          <h1 className="text-[40px] leading-tight">{category.name}</h1>
          <CountPill text={`${products.length} товар(ів)`} />
        </div>

        <div className="grid grid-cols-12 gap-6 lg:gap-8">
          <div className="col-span-12 lg:col-span-4">
            <CategorySidebar
              countryCode={countryCode}
              title={category.name}
              description={category.description}
              navTitle="Підкатегорії"
              navItems={[]}
              navHrefBuilder={() => "#"}
            />
          </div>

          <div className="col-span-12 lg:col-span-8">
            <div className="max-w-[980px]">
              <ProductPreviewGrid
                products={products}
                region={region}
                countryCode={countryCode}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ====================================================================== */
/* Helpers                                                                */
/* ====================================================================== */

async function fetchProductsByCategoryId(categoryId: string, regionId: string) {
  // Region-aware pricing requires region_id, otherwise calculated prices may be missing
  const { products } = await sdk.store.product.list({
    category_id: [categoryId],
    region_id: regionId,
    limit: 48,
  })

  return products
}

async function fetchRegionByCountryCode(countryCode: string) {
  const code = String(countryCode || "").toLowerCase()

  const { regions } = await sdk.store.region.list()
  if (!regions?.length) return notFound()

  // Try to match the region by ISO-2 country code; fallback to the first region
  const matched =
    regions.find((r) =>
      (r.countries || []).some((c: any) => String(c?.iso_2 || "").toLowerCase() === code)
    ) || regions[0]

  return matched as HttpTypes.StoreRegion
}
