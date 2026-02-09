import type { Metadata, Viewport } from "next"

import Nav from "@modules/layout/templates/nav"
import { Footer } from "@modules/layout/templates/footer"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"

import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import type { StoreCartShippingOption } from "@medusajs/types"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"
const IS_PROD = process.env.NODE_ENV === "production"

const LOCALES = {
  ua: { lang: "uk", ogLocale: "uk_UA" },
  en: { lang: "en", ogLocale: "en_US" },
} as const

type LocaleKey = keyof typeof LOCALES

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
}

// Next.js supports metadata via layout/page exports. :contentReference[oaicite:1]{index=1}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ countryCode: string }>
}): Promise<Metadata> {
  const { countryCode } = await params

  const key = (countryCode in LOCALES ? countryCode : "ua") as LocaleKey
  const { ogLocale } = LOCALES[key]

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "MTB — Реабілітаційне обладнання",
      template: "%s — MTB",
    },
    description:
      "Реабілітаційні тренажери та аксесуари. Підбір, консультація, доставка.",
    alternates: {
      // hreflang mapping (use ISO language codes: uk/en, not ua). 
      languages: {
        uk: "/ua",
         
      },
    },
    openGraph: {
      type: "website",
      siteName: "MTB",
      locale: ogLocale,
      url: `/${key}`,
    },
    twitter: {
      card: "summary_large_image",
    },
    robots: IS_PROD
      ? { index: true, follow: true }
      : { index: false, follow: false },
  }
}

export default async function MainLayout(props: { children: React.ReactNode }) {
  // Fetch in parallel to reduce TTFB
  const [customer, cart] = await Promise.all([retrieveCustomer(), retrieveCart()])

  let shippingOptions: StoreCartShippingOption[] = []
  if (cart) {
    const { shipping_options } = await listCartOptions()
    shippingOptions = shipping_options
  }

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MTB",
    url: SITE_URL,
  }

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Skip link improves accessibility and can reduce UX friction */}
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] rounded-md bg-background px-3 py-2 text-sm shadow"
      >
        Перейти до контенту
      </a>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      <header>
        <Nav />
      </header>

      {customer && cart && <CartMismatchBanner customer={customer} cart={cart} />}

      {cart && (
        <FreeShippingPriceNudge
          variant="popup"
          cart={cart}
          shippingOptions={shippingOptions}
        />
      )}

      {/* Proper landmark: only page content goes into <main> */}
      <main id="content" className="flex-1">
        {props.children}
      </main>

      <footer>
        <Footer />
      </footer>
    </div>
  )
}
