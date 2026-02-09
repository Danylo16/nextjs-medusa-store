import React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { HttpTypes } from "@medusajs/types"

type CategoryLike = {
  name?: string
  handle?: string
  parent_category?: { name?: string; handle?: string } | null
}

function pickCategory(categories: CategoryLike[], preferredHandle?: string) {
  if (!categories.length) return null

  // If admin sets canonical category in metadata, respect it
  if (preferredHandle) {
    const found = categories.find((c) => c?.handle === preferredHandle)
    if (found) return found
  }

  // Prefer a subcategory (has parent) -> gives us full chain (cat + subcat)
  const withParent = categories.find((c) => c?.parent_category?.handle && c?.handle)
  return withParent ?? categories[0]
}

export default function ProductBreadcrumbs({
  product,
  countryCode,
}: {
  product: HttpTypes.StoreProduct
  countryCode: string
}) {
  const categories = (((product as any)?.categories ?? []) as CategoryLike[]).filter(Boolean)

  const preferredHandle = String((product as any)?.metadata?.breadcrumb_category_handle ?? "").trim()
  const chosen = pickCategory(categories, preferredHandle)

  const parent = chosen?.parent_category?.handle ? chosen.parent_category : undefined
  const child = chosen?.handle ? chosen : undefined

  const homeHref = `/${countryCode}`
  const productHref = `/${countryCode}/products/${product.handle}`

  const crumbs: Array<{ label: string; href?: string; current?: boolean; seoItem?: string }> = [
    { label: "Головна", href: homeHref, seoItem: homeHref },
  ]

  if (parent?.handle && parent?.name) {
    const catHref = `/${countryCode}/categories/${parent.handle}`
    crumbs.push({ label: parent.name, href: catHref, seoItem: catHref })

    if (child?.handle && child?.name) {
      const subHref = `/${countryCode}/categories/${parent.handle}/${child.handle}`
      crumbs.push({ label: child.name, href: subHref, seoItem: subHref })
    }
  } else if (child?.handle && child?.name) {
    const catHref = `/${countryCode}/categories/${child.handle}`
    crumbs.push({ label: child.name, href: catHref, seoItem: catHref })
  }

  crumbs.push({
    label: product.title ?? "Товар",
    current: true,
    seoItem: productHref,
  })

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-4"
      itemScope
      itemType="https://schema.org/BreadcrumbList"
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        {crumbs.map((c, idx) => {
          const isLast = idx === crumbs.length - 1

          return (
            <li
              key={`${c.label}-${idx}`}
              className="flex items-center gap-x-2"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {c.href && !c.current ? (
                <Link
                  href={c.href}
                  className="max-w-[52ch] truncate rounded-md px-1 py-0.5 text-gray-400 transition-colors hover:text-primary"
 
                  itemProp="item"
                >
                  <span itemProp="name">{c.label}</span>
                </Link>
              ) : (
                <>
                  <span
                    className="max-w-[60ch] truncate rounded-md px-1 py-0.5 font-semibold text-foreground"
                    aria-current="page"
                    itemProp="name"
                    title={c.label}
                  >
                    {c.label}
                  </span>
                  {/* For SEO microdata: keep URL even if not clickable */}
                  {c.seoItem && <meta itemProp="item" content={c.seoItem} />}
                </>
              )}

              <meta itemProp="position" content={String(idx + 1)} />

              {!isLast && (
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
