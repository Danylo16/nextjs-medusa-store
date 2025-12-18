 import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import Product from "../product-preview"

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

  // 1) Спершу — тільки по колекції (найчистіший зв’язок)
  let products: HttpTypes.StoreProduct[] = []
  if (product.collection_id) {
    products = await fetchProducts({
      ...baseParams,
      collection_id: [product.collection_id],
    })
  }

  // 2) Якщо мало — пробуємо по тегах (ширше, але релевантно)
  if (products.length < 4 && product.tags?.length) {
    const tagIds = product.tags.map((t) => t.id).filter(Boolean) as string[]
    if (tagIds.length) {
      products = await fetchProducts({
        ...baseParams,
        tag_id: tagIds,
      })
    }
  }

  // 3) Fallback — просто будь-що (щоб блок не зникав)
  if (!products.length) {
    products = await fetchProducts(baseParams)
  }

  if (!products.length) return null

  return (
    <div className="product-page-constraint">
      <div className="flex flex-col items-center text-center mb-16">
        <span className="text-base-regular text-gray-600 mb-6">
          Пов'язані товари
        </span>
        <p className="text-2xl-regular text-ui-fg-base max-w-lg">
          Вам також можуть сподобатися ці товари
        </p>
      </div>

       <div className="overflow-x-auto no-scrollbar -mx-4 px-4">
  <ul className="flex items-stretch gap-6 snap-x snap-mandatory py-4">
    {products.slice(0, 12).map((p) => (
      <li
  key={p.id}
  className="shrink-0 snap-start w-[260px] sm:w-[280px] md:w-[320px] h-full"
>
  <Product region={region} product={p} countryCode={countryCode} />
</li>
    ))}
  </ul>
</div>
    </div>
  )
}
