/** backend-storefront\src\modules\products\templates\index.tsx */

import React, { Suspense } from "react"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import RelatedProducts from "@modules/products/components/related-products"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { ProductDetailCard } from "@modules/products/components/product-detail-card"

import ProductBreadcrumbs from "@modules/products/components/product-breadcrumbs"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  // контент із metadata, який віддає бек
  const contentBlocks = (product.metadata?.content_blocks || []) as any

  return (
    <>
      {/* Нова картка товару (весь верхній блок сторінки) */}
      <div
        className="content-container py-6"
        data-testid="product-container"
      >
        <ProductBreadcrumbs product={product} countryCode={countryCode} />
        <ProductDetailCard
          product={product}
          region={region}
          content={contentBlocks}
        />
      </div>
 
      <div
        className="content-container mt-16 mb-0 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
