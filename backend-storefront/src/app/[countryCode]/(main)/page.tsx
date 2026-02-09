import { Metadata } from "next"

import ProductCategoriesSection from "@modules/home/components/product-categories" 
import Hero from "@modules/home/components/hero"
import { GallerySection } from "@modules/home/components/gallery/gallery-section"
import ClientsCarousel from "@modules/home/components/clients-carousel"
import { listCollections } from "@lib/data/collections"
import GalleryHeroLink from "@modules/home/components/gallery/gallery-hero-link"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "MTB1-4",
  description:
    "A performant frontend ecommerce starter template with Next.js 15 and Medusa.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  if (!collections || !region) {
    return null
  }

  return (
    <>
      <ProductCategoriesSection /> 
      <Hero />
       <GalleryHeroLink />
      <GallerySection />
      <ClientsCarousel />
    </>
  )
}
