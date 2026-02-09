import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"

/**
 * Retrieve a single product by ID (recommended by Medusa) and render actions.
 * This avoids abusing the list endpoint with unsupported query params.
 */
export default async function ProductActionsWrapper({
  id,
  region,
}: {
  id: string
  region: HttpTypes.StoreRegion
}) {
  const { product } = await sdk.store.product.retrieve(id, {
    region_id: region.id,
  })

  if (!product) return null

  return <ProductActions product={product} region={region} />
}
