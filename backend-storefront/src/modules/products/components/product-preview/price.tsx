import { Text, clx } from "@medusajs/ui"
import type { VariantPrice } from "types/global"

type MoneyInput = string | number | null | undefined

function parseMoney(input: MoneyInput): number | null {
  if (typeof input === "number") return Number.isFinite(input) ? input : null
  if (typeof input !== "string") return null

  const cleaned = input
    .replace(/\s|\u00A0/g, "")
    .replace(/[^\d.,-]/g, "")
    .trim()

  if (!cleaned) return null

  const hasComma = cleaned.includes(",")
  const hasDot = cleaned.includes(".")

  let normalized = cleaned

  if (hasComma && hasDot) {
    // Decide decimal separator by the last occurrence
    const lastComma = cleaned.lastIndexOf(",")
    const lastDot = cleaned.lastIndexOf(".")
    if (lastDot > lastComma) {
      // "8,000.00" -> comma thousands, dot decimals
      normalized = cleaned.replace(/,/g, "")
    } else {
      // "1.234,56" -> dot thousands, comma decimals
      normalized = cleaned.replace(/\./g, "").replace(/,/g, ".")
    }
  } else if (hasComma) {
    // "90,000" -> thousands, "8000,00" -> decimals
    normalized = /,\d{3}(,|$)/.test(cleaned) ? cleaned.replace(/,/g, "") : cleaned.replace(/,/g, ".")
  } else if (hasDot) {
    // "90.000" -> thousands, "8000.00" -> decimals
    normalized = /\.\d{3}(\.|$)/.test(cleaned) ? cleaned.replace(/\./g, "") : cleaned
  }

  const n = Number(normalized)
  return Number.isFinite(n) ? n : null
}

function formatUAHFromKopeks(input: MoneyInput) {
  const kopeksRaw = parseMoney(input)
  if (kopeksRaw === null) return String(input ?? "")

  // Back-end contract: prices are stored/sent in kopeks
  const kopeks = Math.round(kopeksRaw)
  const uah = kopeks / 100

  const hasKopeks = Math.abs(kopeks % 100) !== 0

  const formatted = new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: hasKopeks ? 2 : 0,
    maximumFractionDigits: hasKopeks ? 2 : 0,
  }).format(uah)

  return `${formatted} грн`
}

export default function PreviewPrice({
  price,
  className,
  originalClassName,
}: {
  price: VariantPrice
  className?: string
  originalClassName?: string
}) {
  if (!price) return null

  const calculated = formatUAHFromKopeks(price.calculated_price)
  const original = price.original_price ? formatUAHFromKopeks(price.original_price) : null

  return (
    <div className="flex items-center gap-2">
      {price.price_type === "sale" && original && (
        <Text
          className={clx("line-through text-ui-fg-muted text-sm", originalClassName)}
          data-testid="original-price"
        >
          {original}
        </Text>
      )}

      <Text
        className={clx(
          "text-[22px] font-semibold",
          className,
          {
            "text-ui-fg-interactive": price.price_type === "sale",
            "text-foreground": price.price_type !== "sale",
          }
        )}
        data-testid="price"
      >
        {calculated}
      </Text>
    </div>
  )
}
