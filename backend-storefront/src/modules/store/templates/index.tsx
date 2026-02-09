import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

type CategoryFilter = { id: string; name: string }

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
  categoryIds,
  categoryFilters,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  categoryIds?: string[]
  categoryFilters?: CategoryFilter[]
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <section className="section" data-testid="category-container">
      <div className="content-container">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="card-soft p-5 lg:sticky lg:top-24 h-fit">
            <RefinementList sortBy={sort} categories={categoryFilters || []} />
          </aside>

          <main className="min-w-0">
            <header className="mb-6 flex flex-col gap-2">
              <h1 data-testid="store-page-title">Каталог товарів</h1>

              <p className="text-base-regular text-foreground/70">
                Обирайте обладнання та аксесуари для реабілітації 
              </p>
            </header>

            <Suspense fallback={<SkeletonProductGrid />}>
              <PaginatedProducts
                sortBy={sort}
                page={pageNumber}
                countryCode={countryCode}
                categoryIds={categoryIds}
              />
            </Suspense>

            {/* маленький SEO-блок під каталогом (корисно і людям, і пошуковикам) */}
            <div className="mt-10 text-sm text-foreground/70 leading-relaxed">
              MTB1-4 — магазин реабілітаційних тренажерів та аксесуарів. Тут ви знайдете обладнання для відновлення, комплектуючі та додаткові елементи для тренувань.
            </div>
          </main>
        </div>
      </div>
    </section>
  )
}

export default StoreTemplate
