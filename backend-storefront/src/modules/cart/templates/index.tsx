import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const CartTemplate = ({ cart }: { cart: HttpTypes.StoreCart | null }) => {
  const itemCount =
    cart?.items?.reduce((a, i) => a + (i.quantity ?? 0), 0) ?? 0

  return (
    <div className="section">
      <div className="content-container" data-testid="cart-container">
        {cart?.items?.length ? (
          <>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-[32px] leading-[44px] md:text-[40px] md:leading-[52px]">
                  Кошик
                </h1>
                <div className="mt-1 text-sm text-foreground/70">
                  {itemCount} товар(и) у кошику
                </div>
              </div>

              <LocalizedClientLink
  href="/store"
  className="
    group inline-flex items-center gap-2
    text-sm font-medium
    text-muted-foreground
    no-underline hover:no-underline
    transition-colors duration-200
    hover:text-primary
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
  "
>
  <span>Продовжити покупки</span>

  <span
    aria-hidden="true"
    className="inline-flex transition-transform duration-200 ease-out group-hover:translate-x-1"
  >
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      fill="none"
    >
      <path
        d="M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="m13 5 7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
</LocalizedClientLink>
 
 
 
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-12">
              <div className="md:col-span-8">
                <ItemsTemplate cart={cart} />
              </div>

              <div className="md:col-span-4">
                <div className="md:sticky md:top-6">
                  {cart.region ? <Summary cart={cart} /> : null}
                </div>
              </div>
            </div>
          </>
        ) : (
          <EmptyCartMessage />
        )}
      </div>
    </div>
  )
}

export default CartTemplate
