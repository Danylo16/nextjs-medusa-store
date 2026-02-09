"use client"

import React from "react"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    shipping_total?: number | null
    discount_total?: number | null
    gift_card_total?: number | null
    currency_code: string
    item_subtotal?: number | null
    item_total?: number | null
    shipping_subtotal?: number | null
    shipping_methods?: { adjustments?: { amount: number }[] }[]
    items?: { adjustments?: { amount: number }[] }[]
  }
}

const formatUAH = (amountMinor?: number | null) => {
  // Medusa зазвичай тримає суми в "minor units" (копійки), тобто 600 грн = 60000
  const uah = Math.round((amountMinor ?? 0) / 100)
  return `${uah.toLocaleString("uk-UA")} грн`
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals }) => {
  const {
    total,
    tax_total,
    item_subtotal,
    item_total,
    shipping_subtotal,
    shipping_methods,
    items,
  } = totals

  const totalItemDiscount = (items ?? [])
    .flatMap((i) => i.adjustments ?? [])
    .reduce((acc, curr) => acc + (curr?.amount ?? 0), 0)

  const totalShippingDiscount = (shipping_methods ?? [])
    .flatMap((sm) => sm.adjustments ?? [])
    .reduce((acc, curr) => acc + (curr?.amount ?? 0), 0)

  return (
    <div>
      <div className="flex flex-col gap-y-2 txt-medium text-ui-fg-subtle">
        <div className="flex items-center justify-between">
          <span>Вартість (без доставки)</span>
          <div className="flex items-center gap-2">
            <span
              className={totalItemDiscount ? "line-through text-ui-fg-muted" : ""}
              data-testid="cart-item-subtotal"
              data-value={item_subtotal || 0}
            >
              {formatUAH(item_subtotal)}
            </span>

            {!!totalItemDiscount && (
              <span
                className="text-ui-fg-interactive"
                data-testid="cart-discount"
                data-value={item_total || 0}
              >
                {formatUAH(item_total)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span>Доставка</span>
          <div className="flex items-center gap-2">
            <span
              className={totalShippingDiscount ? "line-through text-ui-fg-muted" : ""}
              data-testid="cart-shipping"
              data-value={shipping_subtotal || 0}
            >
              {/* якщо хочеш показувати суму доставки — заміни рядок нижче на formatUAH(shipping_subtotal) */}
              в залежності від способу
            </span>
          </div>
        </div>

         
      </div>

      <div className="h-px w-full border-b border-gray-200 my-4" />

      <div className="flex items-center justify-between text-ui-fg-base mb-2 txt-medium">
        <span>Загалом</span>
        <span className="txt-xlarge-plus" data-testid="cart-total" data-value={total || 0}>
          {formatUAH(total)}
        </span>
      </div>

      <div className="h-px w-full border-b border-gray-200 mt-4" />
    </div>
  )
}

export default CartTotals
