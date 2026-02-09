import { Metadata } from "next"

import { sdk } from "@lib/config"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "Каталог товарів | MTB1-4",
  description:
    "Каталог тренажерів та аксесуарів для реабілітації ",
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    categories?: string // comma-separated category ids
  }>
  params: Promise<{
    countryCode: string
  }>
}

type CategoryFilter = { id: string; name: string; handle?: string; parent_category_id?: string | null }

async function getTopCategories(): Promise<{ id: string; name: string }[]> {
  try {
    const data = await sdk.client.fetch<any>(`/store/product-categories`, {
      method: "GET",
      query: {
        limit: 100,
        fields: "id,name,handle,parent_category_id",
      },
      // легке кешування
      next: { revalidate: 60 * 60 },
    })

    const items: CategoryFilter[] =
      data?.product_categories || data?.productCategories || data?.categories || []

    const top = items
      .filter((c) => !c.parent_category_id) // топ-рівень
      .sort((a, b) => String(a.name).localeCompare(String(b.name)))
      .slice(0, 4)
      .map((c) => ({ id: c.id, name: c.name }))

    return top
  } catch {
    return []
  }
}

export default async function StorePage(props: Params) {
  const params = await props.params
  const searchParams = await props.searchParams

  const { sortBy, page, categories } = searchParams

  const categoryIds = (categories || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  const topCategories = await getTopCategories()

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
      categoryIds={categoryIds}
      categoryFilters={topCategories}
    />
  )
}
