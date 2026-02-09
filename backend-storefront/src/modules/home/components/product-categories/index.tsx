import Image from "next/image"
import Link from "next/link"
import { categories } from "@modules/home/config/categories"

export default function ProductCategoriesSection() {
  const countryCode = "ua"

  return (
    <section className="section">
      <div className="content-container">
        <div className="text-center space-y-3">
          <h2>Категорії</h2>
          <p className="text-large-regular  max-w-xl mx-auto">
             Оберіть категорію продуктів, щоб дослідити наш широкий асортимент високоякісного обладнання для реабілітації та фізіотерапії.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.handle}
              href={`/${countryCode}/categories/${category.handle}`}
              className="group block h-full"
            >
              <div className="card-soft h-full overflow-hidden rounded-xl shadow-soft transition-shadow duration-200 group-hover:shadow-medium">
                <div className="relative h-64 w-full overflow-hidden">
                  <Image
                    src={category.imageSrc}
                    alt={category.imageAlt}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  />

                  {/* gradient overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 transition-opacity duration-200 group-hover:opacity-100" />

                  {/* title */}
                  <div className="absolute inset-x-4 bottom-4">
                    <h3 className="text-base-semi text-center text-white transition-colors duration-200 group-hover:text-[#f6946f]">  

                      {category.title}
                    </h3>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
