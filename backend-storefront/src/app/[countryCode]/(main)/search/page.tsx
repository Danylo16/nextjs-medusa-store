// src/app/[countryCode]/(main)/search/page.tsx

import { HttpTypes } from "@medusajs/types"
import { sdk } from "../../../../lib/config"

type SearchPageProps = {
  searchParams: { q?: string }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const q = (searchParams.q || "").trim()

  if (!q) {
    return (
      <div className="content-container py-8">
        <h1 className="text-2xl font-semibold mb-4">Search</h1>
        <p className="text-muted-foreground">Enter a search term above.</p>
      </div>
    )
  }

  let products: HttpTypes.StoreProduct[] = []

  try {
    const { products: dataProducts } = await sdk.store.product.list({
      q,
      limit: 24,
    })
    products = dataProducts
  } catch (e) {}

  return (
    <div className="content-container py-8">
      <h1 className="text-2xl font-semibold mb-6">
        Results for “{q}”
      </h1>

      {products.length === 0 ? (
        <p className="text-muted-foreground">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <a
              key={p.id}
              href={`/products/${p.handle}`}
              className="block border border-border rounded-lg p-4 bg-card hover:shadow-sm transition-shadow"
            >
              {p.thumbnail && (
                <img
                  src={p.thumbnail}
                  alt={p.title}
                  className="w-full h-40 object-cover rounded mb-3"
                />
              )}
              <div className="text-sm font-medium">{p.title}</div>
              {p.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {p.description}
                </p>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
