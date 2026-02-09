// backend-storefront/src/app/[countryCode]/(main)/categories/page.tsx

import Link from "next/link"
import Image from "next/image"
import { listCategories } from "@lib/data/categories"
import { Metadata } from "next"

type CategoriesIndexParams = {
  countryCode: string
}
export const metadata: Metadata = {
  title: "Категорії",
  description: "list of product categories",
}

type CategoriesIndexProps = {
  params: Promise<CategoriesIndexParams>
}

type Crumb = {
  label: string
  href?: string
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

function Sidebar({
  countryCode,
  total,
}: {
  countryCode: string
  total: number
}) {
  return (
    <aside className="lg:sticky lg:top-24">
      <div className="card-soft rounded-2xl p-4 shadow-soft ring-1 ring-black/5 space-y-5">
        <div className="space-y-2">
          <div className="text-small-regular font-semibold text-foreground/80">
            Категорії
          </div>

          <div className="text-base font-semibold text-foreground">
            Оберіть розділ обладнання
          </div>

          <p className="text-sm leading-relaxed text-foreground/65">
            Тут зібрані всі категорії. Оберіть потрібну — далі буде список товарів або підкатегорій.
          </p>

          <div className="pt-2">
            <span className="inline-flex items-center rounded-full border border-muted/70 bg-card px-3 py-1 text-xs text-foreground/80 shadow-soft">
              {total} категорій
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-muted/60 flex items-center justify-between gap-3">
          <Link
            href={`/${countryCode}`}
            className="group inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
              ←
            </span>
            <span>Назад</span>
          </Link>

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

function normalizeHandle(handle: string) {
  const h = String(handle || "").trim()
  if (!h) return ""
  return h.startsWith("/") ? h.slice(1) : h
}

export default async function CategoriesIndexPage({ params }: CategoriesIndexProps) {
  const { countryCode } = await params

  const categories = await listCategories()

  const crumbs: Crumb[] = [
    { label: "Головна", href: `/${countryCode}` },
    { label: "Категорії" },
  ]

  return (
    <section className="section">
      <div className="content-container space-y-5">
        <Breadcrumbs items={crumbs} />

        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-[40px] leading-tight">Категорії</h1>
            <p className="text-large-regular text-muted">
              Оберіть категорію обладнання для перегляду товарів.
            </p>
          </div>

          <span className="hidden sm:inline-flex items-center rounded-full border border-muted/70 bg-card px-3 py-1 text-xs text-foreground/80 shadow-soft">
            {categories.length} категорій
          </span>
        </div>

        <div className="grid grid-cols-12 gap-6 lg:gap-8">
          {/* Narrow sidebar like the updated category pages */}
          <div className="col-span-12 lg:col-span-3">
            <Sidebar countryCode={countryCode} total={categories.length} />
          </div>

          <div className="col-span-12 lg:col-span-9">
            <div className="max-w-[1100px]">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((cat) => {
                  const handle = normalizeHandle(cat.handle)
                  const href = `/${countryCode}/categories/${handle}`

                  // Prepare for images: read optional metadata fields if present
                  const img =
                    String((cat as any)?.metadata?.image || (cat as any)?.metadata?.thumbnail || "").trim()

                  return (
                    <Link
                      key={cat.id}
                      href={href}
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
                              alt={cat.name}
                              fill
                              className="object-contain p-6 transition-transform duration-200 group-hover:scale-[1.02]"
                              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 100vw"
                            />
                            <div
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent"
                            />
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-14 w-14 rounded-2xl bg-white/70 ring-1 ring-black/5 flex items-center justify-center text-lg font-semibold text-foreground/70">
                              {(cat.name || "?").trim().slice(0, 1).toUpperCase()}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <h2 className="text-base font-semibold leading-snug text-foreground/90 line-clamp-2">
                            {cat.name}
                          </h2>

                          <span className="text-foreground/35 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary">
                            →
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-foreground/55 line-clamp-2">
                          Перейти до категорії та переглянути товари.
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {!categories.length ? (
                <p className="mt-6 text-large-regular text-muted">
                  Категорій поки немає.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
