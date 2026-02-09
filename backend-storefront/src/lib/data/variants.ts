"use server"

import { cache } from "react"

type VariantSkuResponse = {
  variant?: {
    id?: string
    sku?: string | null
  }
}

export const getVariantSku = cache(async (variantId: string) => {
  if (!variantId) return null

  const baseUrl =
    process.env.MEDUSA_BACKEND_URL ||
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

  if (!baseUrl) return null

  const publishableKey =
    process.env.MEDUSA_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

  const url =
    `${baseUrl}`.replace(/\/$/, "") +
    `/store/variants/${variantId}?fields=id,sku`

  const res = await fetch(url, {
    next: { revalidate: 3600 },
    headers: publishableKey
      ? { "x-publishable-api-key": publishableKey }
      : undefined,
  })

  if (!res.ok) return null

  const data = (await res.json()) as VariantSkuResponse
  return data?.variant?.sku ?? null
})
