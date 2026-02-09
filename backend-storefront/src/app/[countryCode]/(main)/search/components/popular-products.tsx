"use client"

import Link from "next/link"
import { useId, useMemo, useState } from "react"
import { HttpTypes } from "@medusajs/types"

type Props = {
  countryCode: string
  products: HttpTypes.StoreProduct[]
  initiallyVisible?: number
}

export default function PopularProducts({
  countryCode,
  products,
  initiallyVisible = 3,
}: Props) {
  const listId = useId()
  const [expanded, setExpanded] = useState(false)

  const visible = useMemo(
    () => products.slice(0, initiallyVisible),
    [products, initiallyVisible]
  )
  const hidden = useMemo(
    () => products.slice(initiallyVisible),
    [products, initiallyVisible]
  )

  const canToggle = hidden.length > 0

  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">
          Популярні товари
        </h2>

        <Link
          href={`/${countryCode}/store`}
          className="group inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
        >
          <span>Дивитись всі</span>
          <span
            aria-hidden="true"
            className="inline-flex transition-transform duration-200 group-hover:translate-x-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </Link>
      </header>

      {products.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Нема що показати прямо зараз. Перейди в каталог.
        </p>
      ) : (
        <>
          {/* One clean card, flat rows inside */}
          <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
            {/* Visible part */}
            <div className="divide-y divide-border" role="list" aria-label="Популярні товари">
              {visible.map((p) => (
                <ProductRow key={p.id} countryCode={countryCode} p={p} />
              ))}
            </div>

            {/* Expandable part (keeps your logic) */}
            {canToggle && (
              <div
                className={[
                  "grid",
                  "transition-[grid-template-rows,opacity] duration-700",
                  "ease-[cubic-bezier(0.16,1,0.3,1)]",
                  "motion-reduce:transition-none",
                  expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                ].join(" ")}
                aria-hidden={!expanded}
              >
                <div className="overflow-hidden">
                  <div
                    id={listId}
                    className={[
                      "border-t border-border",
                      "divide-y divide-border",
                      // a tiny “float-in” feeling without jank
                      "transition-[transform,opacity] duration-700",
                      "ease-[cubic-bezier(0.16,1,0.3,1)]",
                      expanded ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
                    ].join(" ")}
                  >
                    {hidden.map((p) => (
                      <ProductRow key={p.id} countryCode={countryCode} p={p} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {canToggle && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className={[
                "mt-3 w-full inline-flex items-center justify-center gap-2",
                "rounded-xl border border-border bg-transparent px-3 py-2.5",
                "text-sm font-semibold text-muted-foreground",
                "transition-colors hover:bg-muted/40 hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              ].join(" ")}
              aria-expanded={expanded}
              aria-controls={listId}
            >
              {expanded ? "Менше" : `Більше (+${hidden.length})`}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className={[
                  "transition-transform duration-300",
                  expanded ? "rotate-180" : "",
                ].join(" ")}
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </>
      )}
    </section>
  )
}

function ProductRow({
  countryCode,
  p,
}: {
  countryCode: string
  p: HttpTypes.StoreProduct
}) {
  const sku = p.variants?.[0]?.sku

  return (
    <Link
      href={`/${countryCode}/products/${p.handle}`}
      className={[
        "group flex items-center gap-3",
        // mobile-friendly touch target + tighter layout
        "px-3 py-3 sm:px-4 sm:py-3.5",
        "transition-colors",
        "hover:bg-[#f7dde280]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
      ].join(" ")}
      role="listitem"
    >
      <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-muted">
        {p.thumbnail ? (
          <img
            src={p.thumbnail}
            alt={p.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        {/* 2-line clamp without plugin */}
        <div
          className={[
            "text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary",
            "overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]",
          ].join(" ")}
        >
          {p.title}
        </div>

        <div className="mt-1 text-xs font-medium text-foreground/60">

          {sku ? `Артикул: ${sku}` : "Переглянути деталі"}
        </div>
      </div>
    </Link>
  )
}
