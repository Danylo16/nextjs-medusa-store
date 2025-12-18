// src/lib/data/categories.ts
import { sdk } from "@lib/config"
import type { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const listCategories = async (query?: Record<string, any>) => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  const limit = query?.limit || 100

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields:
            "*category_children, *products, *parent_category, *parent_category.parent_category",
          limit,
          ...query,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories)
}

// НОРМАЛЬНА версія
export const getCategoryByHandle = async (handle: string) => {
  const cacheOptions = await getCacheOptions("categories")

  const { product_categories } =
    await sdk.client.fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: "*category_children, *parent_category",
          handle: [handle],      // КЛЮЧОВЕ
          limit: 1,
        },
        next: {
          ...cacheOptions,
          revalidate: 60,
        },
        cache: "force-cache",
      }
    )

  return product_categories[0] || null
}
