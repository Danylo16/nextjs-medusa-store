"use client"

import { useTransition } from "react"
import { Button } from "@modules/common/UI/button"
import { addToCart } from "@lib/data/cart" // шлях перевір: у тебе це той файл, який ти скинув
import { HttpTypes } from "@medusajs/types"

export default function AddToCartButton({
  product,
  countryCode,
}: {
  product: HttpTypes.StoreProduct
  countryCode: string
}) {
  const [isPending, startTransition] = useTransition()

  const variantId = product.variants?.[0]?.id

  return (
    <Button
      size="lg"
      variant="primary"
      className="w-full text-base"
      disabled={!variantId || isPending}
      onClick={(e) => {
        // ❗щоб не спрацьовував клік по <Link> (інакше тебе перекине на товар)
        e.preventDefault()
        e.stopPropagation()

        if (!variantId) return

        startTransition(async () => {
          await addToCart({
            variantId,
            quantity: 1,
            countryCode,
          })
        })
      }}
    >
      {isPending ? "Додаю..." : "До кошика"}
    </Button>
  )
}
