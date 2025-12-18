import Link from "next/link"
import { listCategories } from "@lib/data/categories"

type CategoriesIndexParams = {
  countryCode: string
}

type CategoriesIndexProps = {
  params: Promise<CategoriesIndexParams>
}

export default async function CategoriesIndexPage({ params }: CategoriesIndexProps) {
  const { countryCode } = await params  // ← ВАЖЛИВО: чекаємо на params

  const categories = await listCategories()

  return (
    <section className="section">
      <div className="content-container">
        <div className="text-center space-y-2">
          <h1>Product Categories</h1>
          <p className="text-large-regular text-muted">
            Browse all equipment categories.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => {
            // handle в беку починається зі слеша, а у фронта ні
            const normalizedHandle = cat.handle.startsWith("/")
              ? cat.handle.slice(1)
              : cat.handle

            return (
              <Link
                key={cat.id}
                href={`/${countryCode}/categories/${normalizedHandle}`}
                className="card-soft block h-full rounded-xl border border-muted/60 p-4 text-left shadow-soft transition-shadow hover:shadow-medium"
              >
                <h2 className="text-base-semi mb-2">{cat.name}</h2>
                <p className="text-small-regular text-muted">
                  View products in this category.
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
