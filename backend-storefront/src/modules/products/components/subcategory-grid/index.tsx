import Link from "next/link"
import type { HttpTypes } from "@medusajs/types"

type StoreCategory = HttpTypes.StoreProductCategory

type SubcategoryGridProps = {
  parentHandle: string
  countryCode: string
  subcategories: StoreCategory[]
}

export function SubcategoryGrid({
  parentHandle,
  countryCode,
  subcategories,
}: SubcategoryGridProps) {
  if (!subcategories.length) {
    return (
      <p className="text-large-regular text-muted">
        Наразі підкатегорій для цієї категорії немає.
      </p>
    )
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {subcategories.map((sub) => (
        <Link
          key={sub.id}
          href={`/${countryCode}/categories/${parentHandle}/${sub.handle}`}
          className="group card-soft block rounded-xl border border-muted/60 p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-medium"
        >
          <h3 className="text-base-semi group-hover:text-primary">
            {sub.name}
          </h3>

          {sub.description && (
            <p className="mt-2 text-small-regular text-muted line-clamp-3">
              {sub.description}
            </p>
          )}
        </Link>
      ))}
    </div>
  )
}
