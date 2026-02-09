"use client"

import React, { useTransition } from "react"
import Image from "next/image"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { deleteLineItem, updateLineItem } from "@lib/data/cart"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type LineItem = NonNullable<HttpTypes.StoreCart["items"]>[number]

type ItemCardProps = {
  item: LineItem
  currencyCode?: string
}

function formatUAHMinor(amountMinor: number) {
  const value = amountMinor / 100
  const isInt = Math.round(value) === value

  const formatted = new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: isInt ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value)

  return `${formatted} грн`
}

function getLineTotalMinor(item: LineItem) {
  const totalMaybe = (item as unknown as { total?: number }).total
  if (typeof totalMaybe === "number") return totalMaybe
  return (item.unit_price ?? 0) * (item.quantity ?? 0)
}

function pickAvailability(item: LineItem): "made_to_order" | "in_stock" | null {
  const raw =
    (item as any)?.metadata?.availability ??
    (item as any)?.variant?.metadata?.availability ??
    (item as any)?.variant?.product?.metadata?.availability ??
    (item as any)?.product?.metadata?.availability

  const v = String(raw ?? "").trim().toLowerCase()
  if (v === "made_to_order") return "made_to_order"
  if (v === "in_stock") return "in_stock"
  return null
}

function pickSku(item: LineItem): string | null {
  const raw =
    (item as any)?.sku ??
    (item as any)?.variant_sku ??
    (item as any)?.variant?.sku ??
    (item as any)?.metadata?.sku ??
    (item as any)?.variant?.metadata?.sku ??
    null

  const s = String(raw ?? "").trim()
  return s ? s : null
}

function AvailabilityBadge({ value }: { value: "made_to_order" | "in_stock" }) {
  const isMade = value === "made_to_order"
  const label = isMade ? "Під замовлення" : "В наявності"
  const bg = isMade ? "bg-accent-light" : "bg-primary-light"
  const text = isMade ? "text-accent-dark" : "text-primary-dark"

  return (
    <span
      className={[
        "inline-flex items-center justify-center",
        "rounded-full px-2.5 py-1",
        "text-[11px] font-semibold leading-none",
        bg,
        text,
      ].join(" ")}
      title={label}
    >
      {label}
    </span>
  )
}

export default function Item({ item }: ItemCardProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const title =
    item.title ||
    (item as any)?.product_title ||
    (item as any)?.variant?.product?.title ||
    "Товар"

  const thumb = item.thumbnail || null
  const unitMinor = item.unit_price ?? 0
  const lineMinor = getLineTotalMinor(item)

  const availability = pickAvailability(item)
  const sku = pickSku(item)

  const handle =
    (item as any)?.product_handle ??
    (item as any)?.variant?.product?.handle ??
    null

  const href = handle ? `/products/${handle}` : null
  const qty = item.quantity ?? 1

  const decQty = () => {
    if (pending) return
    if (qty <= 1) return

    startTransition(async () => {
      try {
        await updateLineItem({ lineId: item.id, quantity: qty - 1 })
        router.refresh()
      } catch (e) {
        console.error("Failed to decrement quantity", e)
      }
    })
  }

  const incQty = () => {
    if (pending) return

    startTransition(async () => {
      try {
        await updateLineItem({ lineId: item.id, quantity: qty + 1 })
        router.refresh()
      } catch (e) {
        console.error("Failed to increment quantity", e)
      }
    })
  }

  const remove = () => {
    if (pending) return

    startTransition(async () => {
      try {
        await deleteLineItem(item.id)
        router.refresh()
      } catch (e) {
        console.error("Failed to remove line item", e)
      }
    })
  }

  const RemoveButton = ({ className = "" }: { className?: string }) => {
    return (
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        className={[
          "inline-flex items-center gap-2",
          "rounded-md px-3 py-2",
          "text-sm font-semibold text-foreground/70",
          "hover:text-accent-dark hover:bg-accent-light/50 transition-colors",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "whitespace-nowrap",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-card",
          className,
        ].join(" ")}
        aria-label={`Прибрати з кошика: ${title}`}
      >
        <Trash2 className="h-4 w-4" />
        <span>Прибрати</span>
      </button>
    )
  }

  return (
    <article
      className="card-soft border border-muted/70 p-4 md:p-6"
      itemScope
      itemType="https://schema.org/Product"
      aria-busy={pending}
    >
      <div className="grid grid-cols-[72px_1fr] md:grid-cols-[80px_1fr] gap-4 md:gap-6 items-start md:items-center">
        {/* Thumbnail */}
        <div className="relative h-[72px] w-[72px] md:h-20 md:w-20 shrink-0 overflow-hidden rounded-2xl md:rounded-xl bg-secondary-light/40 border border-muted/60">
          {thumb ? (
            <Image
              src={thumb}
              alt={title}
              fill
              className="object-cover"
              sizes="80px"
              priority={false}
              itemProp="image"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs text-foreground/50">
              No photo
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0">
          {/* Mobile: 2 columns. Desktop: 4 fixed columns. */}
          <div className="grid grid-cols-2 gap-3 md:gap-6 md:grid-cols-[minmax(0,1fr)_156px_144px_120px] md:items-center">
            {/* Column 1: title + meta */}
            <div className="min-w-0 col-span-2 md:col-span-1 order-1 md:order-none">
              <h3
                className="text-base md:text-lg font-semibold leading-snug line-clamp-2 text-foreground"
                itemProp="name"
              >
                {href ? (
                  <LocalizedClientLink
                    href={href}
                    className="text-foreground hover:text-primary-dark transition-colors"
                  >
                    {title}
                  </LocalizedClientLink>
                ) : (
                  title
                )}
              </h3>

              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                {availability ? <AvailabilityBadge value={availability} /> : null}

                {sku ? (
                  <div className="text-xs text-foreground/60">
                    Артикул: <span className="font-medium">{sku}</span>
                  </div>
                ) : null}

                <div className="text-xs text-foreground/60 tabular-nums">
                  {formatUAHMinor(unitMinor)}{" "}
                  <span className="text-foreground/45">/ шт</span>
                </div>
              </div>
            </div>

            {/* Column 2: qty control */}
            <div className="justify-self-start md:justify-self-center order-2 md:order-none">
              <div className="inline-flex items-stretch overflow-hidden rounded-xl border border-muted/70 bg-card shadow-[0_1px_0_rgba(0,0,0,0.03)]">
                <button
                  type="button"
                  onClick={decQty}
                  disabled={pending || qty <= 1}
                  className={[
                    "h-11 w-12 grid place-items-center",
                    "text-foreground/60",
                    "hover:bg-secondary-light/50 transition-colors",
                    "disabled:opacity-40 disabled:cursor-not-allowed",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                  ].join(" ")}
                  aria-label={`Зменшити кількість для: ${title}`}
                >
                  <Minus className="h-4 w-4" />
                </button>

                <div
                  className="h-11 w-12 grid place-items-center border-x border-muted/70 text-sm font-semibold tabular-nums"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {qty}
                </div>

                <button
                  type="button"
                  onClick={incQty}
                  disabled={pending}
                  className={[
                    "h-11 w-12 grid place-items-center",
                    "text-foreground/60",
                    "hover:bg-secondary-light/50 transition-colors",
                    "disabled:opacity-40 disabled:cursor-not-allowed",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                  ].join(" ")}
                  aria-label={`Збільшити кількість для: ${title}`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Column 3: remove (desktop only) */}
            <div className="hidden md:flex justify-self-center order-3 md:order-none">
              <RemoveButton />
            </div>

            {/* Column 4: total price (bottom row on mobile) */}
            <div className="col-span-2 md:col-span-1 order-4 md:order-none pt-3 border-t border-muted/60 md:pt-0 md:border-t-0 md:justify-self-end">
              <div className="flex items-start justify-between gap-3 md:block md:text-right">
                {/* Mobile: remove button on the same row with total price (left aligned) */}
                <div className="md:hidden">
                  <RemoveButton />
                </div>

                <div className="ml-auto text-right">
                  <div className="text-base md:text-lg font-semibold tabular-nums">
                    {formatUAHMinor(lineMinor)}
                  </div>

                  <div className="mt-1 text-xs text-foreground/55 tabular-nums md:hidden">
                    {formatUAHMinor(unitMinor)} / шт
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
