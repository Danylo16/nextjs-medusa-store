"use client"

import React, { useEffect, useState, useTransition } from "react"
import { Button } from "@modules/common/UI/button"
import { addToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"

function CartFilledIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2Zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2ZM6.2 6l.3 2h12.1c.8 0 1.3.8 1 1.5l-2 4.3c-.3.7-1 1.2-1.8 1.2H8.1c-.8 0-1.5-.6-1.7-1.4L4.6 4H2V2h3.4c.7 0 1.3.5 1.4 1.2L7 4h14v2H6.2Z"
      />
    </svg>
  )
}

export default function AddToCartButton({
  product,
  countryCode,
  layout = "full",
}: {
  product: HttpTypes.StoreProduct
  countryCode: string
  layout?: "full" | "pill"
}) {
  const [isPending, startTransition] = useTransition()
  const [justAdded, setJustAdded] = useState(false)

  const variantId = product.variants?.[0]?.id
  const isPill = layout === "pill"

  useEffect(() => {
    if (!justAdded) return
    const t = setTimeout(() => setJustAdded(false), 1600)
    return () => clearTimeout(t)
  }, [justAdded])

  return (
    <div className="relative">
      {/* toast over button */}
      {justAdded ? (
        <div className="absolute -top-10 right-0 rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background shadow-md">
          Додано до кошика
        </div>
      ) : null}

      <Button
        size={isPill ? "sm" : "lg"}
        variant="primary"
        className={
          isPill
            ? "h-10 w-auto rounded-full px-4 text-sm font-semibold inline-flex items-center gap-2"
            : "w-full text-base"
        }
        disabled={!variantId || isPending}
        onClick={(e) => {
          // crutial to prevent parent link navigation
          e.preventDefault()
          e.stopPropagation()
          if (!variantId) return

          startTransition(async () => {
            try {
              await addToCart({ variantId, quantity: 1, countryCode })
              setJustAdded(true)

               
              window.dispatchEvent(
                new CustomEvent("mtb:cart-added", {
                  detail: { variantId, productId: product.id },
                })
              )
            } catch {
               
            }
          })
        }}
        type="button"
      >
        <CartFilledIcon className="h-4 w-4" />
        {isPending ? "Додаю..." : "Додати"}
      </Button>
    </div>
  )
}
