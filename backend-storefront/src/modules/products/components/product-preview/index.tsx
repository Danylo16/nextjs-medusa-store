import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { getProductPrice } from "@lib/util/get-product-price"
import AddToCartButton from "./add-to-cart-button"

export default function ProductPreview({
  product,
  isFeatured,
  region,
  countryCode,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
  countryCode: string
}) {
  const { cheapestPrice } = getProductPrice({ product })

  const categoryName = product.categories?.[0]?.name || ""
  const tagValue = product.tags?.[0]?.value || ""
  const collectionTitle = (product.collection as any)?.title || ""

  const pickShortBadge = (...candidates: string[]) => {
    const clean = candidates.map((s) => String(s || "").trim()).filter(Boolean)
    const short = clean.find((s) => s.length <= 18)
    return short || ""
  }

  const badge = pickShortBadge(tagValue, collectionTitle, categoryName)
  const metaCategory = categoryName || collectionTitle || tagValue || ""

  const sku =
    product.variants?.find((v) => Boolean(v.sku))?.sku ||
    (product as any)?.metadata?.sku ||
    ""

  const availabilityRaw = String((product as any)?.metadata?.availability ?? "")
  const isMadeToOrder = !availabilityRaw || availabilityRaw === "made_to_order"

  const statusText = isMadeToOrder ? "Під замовлення" : "В наявності"
  const etaText = isMadeToOrder ? "до 7 днів" : "2–5 днів"

  const statusClass = isMadeToOrder ? "text-[#e86d5e]" : "text-primary"
  const mutedClass = "text-foreground/50"

  const metaCategoryClass = badge
    ? "sm:hidden mb-1 text-[11px] leading-4 text-foreground/50 truncate"
    : "mb-1 text-[11px] leading-4 text-foreground/50 truncate"

  return (
    <article
      data-testid="product-wrapper"
      className={[
        "group h-full overflow-hidden flex flex-col rounded-2xl bg-card",
        "ring-1 ring-black/5",
        "transition-shadow duration-200",
        "hover:shadow-medium",
      ].join(" ")}
    >
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        aria-label={product.title}
        className="relative overflow-hidden bg-muted aspect-[4/3] flex items-center justify-center p-1.5 cursor-pointer"
      >
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
          fit="contain"
          className="w-full h-full"
          priority={Boolean(isFeatured)}
        />

        {badge ? (
          <div className="absolute top-3 left-3 hidden sm:block">
            <span className="max-w-[calc(100%-1.5rem)] truncate rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-foreground ring-1 ring-black/5 shadow-sm backdrop-blur">
              {badge}
            </span>
          </div>
        ) : null}
      </LocalizedClientLink>

      <div className="p-3">
        {metaCategory ? <div className={metaCategoryClass}>{metaCategory}</div> : null}

        <h3 className="text-[14px] leading-snug font-semibold line-clamp-2 min-h-[36px]">
          <LocalizedClientLink
            href={`/products/${product.handle}`}
            className="text-foreground cursor-pointer transition-colors hover:text-primary"
          >
            {product.title}
          </LocalizedClientLink>
        </h3>

        <div className="mt-1.5">
          {cheapestPrice ? (
            <PreviewPrice price={cheapestPrice} className="text-[18px] font-semibold" />
          ) : null}
        </div>

        <div className="mt-2 space-y-1">
          <div className="text-sm">
            <span className={mutedClass}>Артикул:</span>{" "}
            <span className="text-foreground/85 font-medium">{sku || "—"}</span>
          </div>

          <div className="text-sm">
            <span className={`font-medium ${statusClass}`}>{statusText}</span>
            <span className={`font-normal ${mutedClass}`}> • {etaText}</span>
          </div>
        </div>
      </div>

      <div className="px-3 pb-3 mt-auto">
        <AddToCartButton product={product} countryCode={countryCode} layout="full" />
      </div>
    </article>
  )
}
