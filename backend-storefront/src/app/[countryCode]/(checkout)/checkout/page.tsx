import { redirect } from "next/navigation"

export default function CheckoutRedirect({
  params,
}: {
  params: { countryCode: string }
}) {
  redirect(`/${params.countryCode}/cart`)
}
