import type { ComponentProps } from "react"
import { Heading } from "@medusajs/ui"
import { cookies as nextCookies } from "next/headers"

import CartTotals from "@modules/common/components/cart-totals"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import PaymentDetails from "@modules/order/components/payment-details"
import { HttpTypes } from "@medusajs/types"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()
  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  // NOTE: CartTotals expects "cart-like" totals shape.
  // StoreOrder isn't directly assignable because some fields are nullable (e.g. shipping_methods can be null).
  type CartTotalsProps = ComponentProps<typeof CartTotals>
  type CartTotalsInput = CartTotalsProps["totals"]

  const totalsForCartTotals: CartTotalsInput = {
    total: order.total ?? undefined,
    subtotal: order.subtotal ?? undefined,
    tax_total: order.tax_total ?? undefined,
    shipping_total: order.shipping_total ?? undefined,
    discount_total: order.discount_total ?? undefined,
    currency_code: order.currency_code ?? undefined,

    // NOTE: Some Medusa types allow null; CartTotals expects undefined instead.
    shipping_methods: (order.shipping_methods ?? undefined)?.map((sm) => ({
      adjustments: (sm.adjustments ?? undefined)?.map((a) => ({
        amount: a.amount,
      })),
    })),

    // NOTE: If CartTotals uses items for any derived totals, keep them (and avoid null).
    items: Array.isArray(order.items) ? (order.items as any) : undefined,
  }

  return (
    <div className="py-6 min-h-[calc(100vh-64px)]">
      <div className="content-container flex flex-col justify-center items-center gap-y-10 max-w-4xl h-full w-full">
        {isOnboarding && <OnboardingCta orderId={order.id} />}

        <div
          className="flex flex-col gap-4 max-w-4xl h-full bg-white w-full py-10"
          data-testid="order-complete-container"
        >
          <Heading
            level="h1"
            className="flex flex-col gap-y-3 text-ui-fg-base text-3xl mb-4"
          >
            <span>Thank you!</span>
            <span>Your order was placed successfully.</span>
          </Heading>

          <OrderDetails order={order} />

          <Heading level="h2" className="flex flex-row text-3xl-regular">
            Summary
          </Heading>

          <Items order={order} />
          <CartTotals totals={totalsForCartTotals} />
          <ShippingDetails order={order} />
          <PaymentDetails order={order} />
          <Help />
        </div>
      </div>
    </div>
  )
}
