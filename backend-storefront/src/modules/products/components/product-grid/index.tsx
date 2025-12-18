import Link from "next/link"
import Image from "next/image"
import type { HttpTypes } from "@medusajs/types"

type ProductGridProps = {
  products: HttpTypes.StoreProduct[]
  countryCode: string
}

export function ProductGrid({ products, countryCode }: ProductGridProps) {
  if (!products?.length) {
    return (
      <p className="text-large-regular text-muted">
        У цій категорії поки немає товарів.
      </p>
    )
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          countryCode={countryCode}
        />
      ))}
    </div>
  )
}

type ProductCardProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export function ProductCard({ product, countryCode }: ProductCardProps) {
  const thumbnail = product.thumbnail || "/images/placeholder-product.jpg"

  return (
    <Link
      href={`/${countryCode}/products/${product.handle}`}
      className="group card-soft flex h-full flex-col overflow-hidden rounded-xl shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-medium"
    >
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={thumbnail}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-200 group-hover:scale-105"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-base-semi line-clamp-2">{product.title}</h3>

        {product.description && (
          <p className="text-small-regular text-muted line-clamp-3">
            {product.description}
          </p>
        )}
      </div>
    </Link>
  )
}
