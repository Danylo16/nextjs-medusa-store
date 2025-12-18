import { Text, clx } from "@medusajs/ui"
import { VariantPrice } from "types/global"

function formatUAH(value: string) {
  // очікуємо щось типу "UAH 800.00"
  const numeric = Number(
    value
      .replace(/[^\d.,]/g, "") // прибрали UAH
      .replace(",", ".")
  )

  if (Number.isNaN(numeric)) return value

  return (
    new Intl.NumberFormat("uk-UA", {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(numeric) + " грн"
  )
}

export default function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) return null

  const calculated = formatUAH(price.calculated_price)
  const original =
    price.original_price ? formatUAH(price.original_price) : null

  return (
    <div className="flex items-center gap-2">
      {price.price_type === "sale" && original && (
        <Text
          className="line-through text-ui-fg-muted text-base"
          data-testid="original-price"
        >
          {original}
        </Text>
      )}

      <Text
        className={clx("text-xl font-semibold", {
          "text-ui-fg-interactive": price.price_type === "sale",
          "text-foreground": price.price_type !== "sale",
        })}
        data-testid="price"
      >
        {calculated}
      </Text>
    </div>
  )
}
