import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"

type LineItemUnitPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
  currencyCode: string
}

const LineItemUnitPrice = ({
  item,
  style = "default",
  currencyCode,
}: LineItemUnitPriceProps) => {
  const { total, original_total, quantity } = item

  // NOTE: Medusa totals can be optional. Guard explicitly.
  const currentTotal = typeof total === "number" ? total : undefined
  const originalTotal =
    typeof original_total === "number" ? original_total : undefined

  // NOTE: Quantity must be a positive number to compute unit price.
  const qty = typeof quantity === "number" && quantity > 0 ? quantity : undefined

  // NOTE: If we don't have enough data, do not render nonsense.
  if (typeof currentTotal !== "number" || typeof qty !== "number") {
    return null
  }

  // NOTE: convertToLocale typically expects integer minor units, so keep it integer.
  const currentUnit = Math.round(currentTotal / qty)
  const originalUnit =
    typeof originalTotal === "number" ? Math.round(originalTotal / qty) : undefined

  const hasReducedPrice =
    typeof originalTotal === "number" && originalTotal > 0 && currentTotal < originalTotal

  const percentageDiff = hasReducedPrice
    ? Math.round(((originalTotal! - currentTotal) / originalTotal!) * 100)
    : 0

  return (
    <div className="flex flex-col text-ui-fg-muted justify-center h-full">
      {hasReducedPrice && typeof originalUnit === "number" && (
        <>
          <p>
            {style === "default" && (
              <span className="text-ui-fg-muted">Original: </span>
            )}
            <span className="line-through" data-testid="product-unit-original-price">
              {convertToLocale({
                amount: originalUnit,
                currency_code: currencyCode,
              })}
            </span>
          </p>

          {style === "default" && percentageDiff > 0 && (
            <span className="text-ui-fg-interactive">-{percentageDiff}%</span>
          )}
        </>
      )}

      <span
        className={clx("text-base-regular", {
          "text-ui-fg-interactive": hasReducedPrice,
        })}
        data-testid="product-unit-price"
      >
        {convertToLocale({
          amount: currentUnit,
          currency_code: currencyCode,
        })}
      </span>
    </div>
  )
}

export default LineItemUnitPrice
