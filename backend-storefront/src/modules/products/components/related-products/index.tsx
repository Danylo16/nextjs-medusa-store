import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import Product from "../product-preview"
import RelatedProductsSlider from "./related-products-slider"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

type RelatedQueryParams = HttpTypes.StoreProductParams & {
  region_id?: string
  collection_id?: string[]
  tag_id?: string[]
  is_giftcard?: boolean
  limit?: number
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)
  if (!region?.id) return null

  const baseParams: RelatedQueryParams = {
    region_id: region.id,
    is_giftcard: false,
    limit: 12,
  }

  const fetchProducts = async (queryParams: RelatedQueryParams) => {
    const { response } = await listProducts({ queryParams, countryCode })
    return response.products.filter((p) => p.id !== product.id)
  }

  let products: HttpTypes.StoreProduct[] = []

  // 1) collection
  if (product.collection_id) {
    products = await fetchProducts({
      ...baseParams,
      collection_id: [product.collection_id],
    })
  }

  // 2) tags
  if (products.length < 4 && product.tags?.length) {
    const tagIds = product.tags.map((t) => t.id).filter(Boolean) as string[]
    if (tagIds.length) {
      products = await fetchProducts({
        ...baseParams,
        tag_id: tagIds,
      })
    }
  }

  // 3) fallback
  if (!products.length) {
    products = await fetchProducts(baseParams)
  }

  products = products.slice(0, 12)
  if (!products.length) return null

  return (
    <div className="product-page-constraint">
      <RelatedProductsSlider
        title="Пов'язані товари"
        subtitle="Вам також можуть сподобатися ці товари"
      >
        {products.map((p) => (
          <Product key={p.id} region={region} product={p} countryCode={countryCode} />
        ))}
      </RelatedProductsSlider>
    </div>
  )
}
