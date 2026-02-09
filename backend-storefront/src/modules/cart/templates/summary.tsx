import { Heading } from "@medusajs/ui"
import CartTotals from "@modules/common/components/cart-totals"
import { HttpTypes } from "@medusajs/types"
import CartLeadForm from "@modules/cart/components/lead-form"

type SummaryProps = {
  cart: HttpTypes.StoreCart
}

const Summary = ({ cart }: SummaryProps) => {
  const count = cart.items?.reduce((a, i) => a + (i.quantity ?? 0), 0) ?? 0

  return (
    <div className="card-soft border border-muted/70 p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <Heading level="h2" className="text-[20px] leading-[28px]">
          Підсумок
        </Heading>
        <div className="text-xs text-foreground/60">{count} шт</div>
      </div>

      <div className="my-4 h-px bg-muted/80" />

      <CartTotals totals={cart} />

      <CartLeadForm />
    </div>
  )
}

export default Summary
