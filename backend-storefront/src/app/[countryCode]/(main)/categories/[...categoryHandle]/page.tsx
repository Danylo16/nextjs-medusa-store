// src/app/[countryCode]/(main)/categories/[...categoryHandle]/page.tsx

import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { SubcategoryGrid } from "@modules/products/components/subcategory-grid"
import { ProductGrid as ProductsGrid } from "@modules/products/components/product-grid"
import type { HttpTypes } from "@medusajs/types"
import { sdk } from "@lib/config"
import { getCategoryByHandle } from "@lib/data/categories"

type CategoryPageParams = {
  countryCode: string
  categoryHandle: string[]
}

type CategoryPageProps = {
  params: CategoryPageParams
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { countryCode, categoryHandle } = params
  const [categorySlug, subcategorySlug] = categoryHandle ?? []

  if (!categorySlug) {
    return notFound()
  }

  // БАТЬКІВСЬКА категорія (перша в URL)
  const category = await getCategoryByHandle(categorySlug)

  if (!category) {
    return notFound()
  }

  // ===== ВИПАДОК A: /cat/subcat =====
  if (subcategorySlug) {
    const subcategory = await getCategoryByHandle(subcategorySlug)

    if (
      !subcategory ||
      subcategory.parent_category?.id !== category.id // перевіряємо, що це дитина
    ) {
      return notFound()
    }

    const products = await fetchProductsByCategoryId(subcategory.id)

    return (
      <section className="section">
        <div className="content-container space-y-4">
          <h1>{subcategory.name}</h1>

          {subcategory.description && (
            <p className="text-large-regular text-muted max-w-2xl">
              {subcategory.description}
            </p>
          )}

          <ProductsGrid products={products} countryCode={countryCode} />
        </div>
      </section>
    )
  }

  // ===== ВИПАДОК B: /cat =====

  const children = (category.category_children || []) as HttpTypes.StoreProductCategory[]

  // B1. Є підкатегорії — показуємо їх
  if (children.length > 0) {
    return (
      <section className="section">
        <div className="content-container space-y-4">
          <h1>{category.name}</h1>

          {category.description && (
            <p className="text-large-regular text-muted max-w-2xl">
              {category.description}
            </p>
          )}

          <SubcategoryGrid
            parentHandle={category.handle}
            countryCode={countryCode}
            subcategories={children}
          />
        </div>
      </section>
    )
  }

  // B2. Підкатегорій нема — одразу товари цієї категорії
  const products = await fetchProductsByCategoryId(category.id)

  return (
    <section className="section">
      <div className="content-container space-y-4">
        <h1>{category.name}</h1>

        {category.description && (
          <p className="text-large-regular text-muted max-w-2xl">
            {category.description}
          </p>
        )}

        <ProductsGrid products={products} countryCode={countryCode} />
      </div>
    </section>
  )
}

/* ======================================================================== */
/*  ХЕЛПЕР ДЛЯ ПРОДУКТІВ                                                    */
/* ======================================================================== */

async function fetchProductsByCategoryId(categoryId: string) {
  const { products } = await sdk.store.product.list({
    category_id: [categoryId],  // ВАЖЛИВО: масив
    limit: 48,
  })

  return products
}
