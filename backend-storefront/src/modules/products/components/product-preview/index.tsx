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

  const badge =
    product.categories?.[0]?.name ||
    product.tags?.[0]?.value ||
    (product.collection as any)?.title ||
    ""

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block h-full"
      data-testid="product-wrapper"
    >
      <article
        className={[
          "h-full overflow-hidden flex flex-col rounded-2xl bg-card",
          "ring-1 ring-black/5",
          "transition-shadow duration-300",
          "group-hover:shadow-medium",
          "flex flex-col",
        ].join(" ")}
      >
        <div className="relative overflow-hidden bg-muted aspect-square">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
            fit="cover"
            className="w-full"
            priority={Boolean(isFeatured)}
          />

          {badge ? (
            <div className="absolute top-3 right-3">
              <span className="rounded-full bg-foreground/90 px-3 py-1 text-xs font-medium text-background">
                {badge}
              </span>
            </div>
          ) : null}
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 min-h-[56px]">
            {product.title}
          </h3>

          <div className="text-2xl font-bold text-foreground">
            {cheapestPrice ? <PreviewPrice price={cheapestPrice} /> : null}
          </div>
        </div>

        <div className="p-4 pt-0 mt-auto">
          <AddToCartButton product={product} countryCode={countryCode} />
        </div>
      </article>
    </LocalizedClientLink>
  )
}
