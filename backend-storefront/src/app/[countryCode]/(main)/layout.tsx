import Nav from "@modules/layout/templates/nav"
import { Footer } from "@modules/layout/templates/footer"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"

import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import type { StoreCartShippingOption } from "@medusajs/types"

export default async function MainLayout(props: { children: React.ReactNode }) {
  // Fetch in parallel to reduce TTFB
  const [customer, cart] = await Promise.all([retrieveCustomer(), retrieveCart()])

  let shippingOptions: StoreCartShippingOption[] = []
  if (cart) {
    const { shipping_options } = await listCartOptions()
    shippingOptions = shipping_options
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <Nav />

      {customer && cart && <CartMismatchBanner customer={customer} cart={cart} />}

      {cart && (
        <FreeShippingPriceNudge
          variant="popup"
          cart={cart}
          shippingOptions={shippingOptions}
        />
      )}

      {/* Proper landmark: only page content goes into <main> */}
      <main className="flex-1">{props.children}</main>

      <Footer />
    </div>
  )
}
