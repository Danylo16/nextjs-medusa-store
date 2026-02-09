"use client"

import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"

import Item from "@modules/cart/components/item"

type ItemsTemplateProps = {
  cart: HttpTypes.StoreCart
}

const ItemsPreviewTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart.items
  const hasOverflow = Boolean(items && items.length > 4)

  return (
    <div
      className={clx("space-y-3", {
        "pl-[1px] overflow-y-scroll overflow-x-hidden no-scrollbar max-h-[420px]":
          hasOverflow,
      })}
      data-testid="items-preview"
    >
      {items
        ? items
            .slice()
            .sort((a, b) => {
              const aDate = a.created_at ? new Date(a.created_at).getTime() : 0
              const bDate = b.created_at ? new Date(b.created_at).getTime() : 0
              return bDate - aDate
            })
            .map((item) => (
              <Item key={item.id} item={item} currencyCode={cart.currency_code} />
            ))
        : repeat(4).map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl border border-muted/70 bg-card"
              aria-hidden="true"
            />
          ))}
    </div>
  )
}

export default ItemsPreviewTemplate
