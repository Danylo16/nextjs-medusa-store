import { productContentArraySchema, type ProductContentArray } from "./schema"

export function getEmptyProductContent(): ProductContentArray {
  return [
    {
      version: 2,
      sidebar: [],
      bottom: [],
    },
  ]
}

export function readProductContent(
  metadata: Record<string, any> | null | undefined
): ProductContentArray {
  const raw = metadata?.content_blocks
  const parsed = productContentArraySchema.safeParse(raw)

  if (parsed.success) {
    return parsed.data
  }

  return getEmptyProductContent()
}

export function normalizeProductContent(content: unknown): ProductContentArray {
  const parsed = productContentArraySchema.safeParse(content)

  if (parsed.success) {
    return parsed.data
  }

  return getEmptyProductContent()
}

export function serializeProductContent(content: unknown): ProductContentArray {
  const parsed = productContentArraySchema.safeParse(content)

  if (parsed.success) {
    return parsed.data
  }

  return getEmptyProductContent()
}

export function readProductSeo(
  metadata: Record<string, any> | null | undefined,
  product: Record<string, any>
) {
  const title = metadata?.seo_title?.trim() || product?.title || ""

  const description =
    metadata?.seo_description?.trim() ||
    product?.description?.trim() ||
    product?.title ||
    ""

  const ogImage =
    metadata?.seo_og_image?.trim() ||
    product?.thumbnail ||
    product?.images?.[0]?.url ||
    undefined

  return {
    title,
    description,
    ogImage,
  }
}