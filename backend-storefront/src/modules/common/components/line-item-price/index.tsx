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
  const { total, original_total } = item

  // NOTE: Medusa totals can be optional. Guard explicitly.
  const current = typeof total === "number" ? total : undefined
  const original = typeof original_total === "number" ? original_total : undefined

  // NOTE: If we don't have a current unit price, do not render nonsense.
  if (typeof current !== "number") {
    return null
  }

  const hasReducedPrice = typeof original === "number" && current < original

  // NOTE: Avoid division by 0 or undefined.
  const percentageDiff =
    hasReducedPrice && original! > 0
      ? Math.round(((original! - current) / original!) * 100)
      : 0

  return (
    <div className="flex flex-col gap-x-2 text-ui-fg-subtle items-end">
      <div className="text-left">
        {hasReducedPrice && typeof original === "number" && (
          <>
            <p>
              {style === "default" && (
                <span className="text-ui-fg-subtle">Original: </span>
              )}
              <span className="line-through text-ui-fg-muted">
                {convertToLocale({
                  amount: original,
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
        >
          {convertToLocale({
            amount: current,
            currency_code: currencyCode,
          })}
        </span>
      </div>
    </div>
  )
}

export default LineItemUnitPrice
