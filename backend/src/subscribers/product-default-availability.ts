import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export default async function productDefaultAvailability({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const productService = container.resolve(Modules.PRODUCT)

  const productId = event.data.id
  if (!productId) return

  // беремо metadata і, якщо ключа нема — додаємо дефолт
  const product = await productService.retrieveProduct(productId, {
    select: ["id", "metadata"],
  })

  const metadata = (product as any)?.metadata ?? {}
  const current = String(metadata?.availability ?? "").trim()

  if (!current) {
    await productService.updateProducts(productId, {
      metadata: {
        ...metadata,
        availability: "in_stock",
      },
    })
  }
}

export const config: SubscriberConfig = {
  event: "product.created",
}
