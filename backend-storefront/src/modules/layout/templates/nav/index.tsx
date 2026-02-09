import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import type { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import HeaderSearch from "@modules/layout/components/header-search"
import { Phone, Mail } from "lucide-react"
import Image from "next/image"

const navigationLinks = [
  { label: "Товари", href: "/store" },
  { label: "Галерея", href: "/#gallery" },
  { label: "Про нас", href: "/about" },
  { label: "Блог", href: "/blog" },
]

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)

  return (
    <header className="sticky top-0 z-50 bg-card shadow-sm">
      {/* No bottom border, shadow only */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* === LEFT CLUSTER: burger + logo + name === */}
          <div className="flex items-center gap-3">
            <div className="h-full flex items-center md:hidden">
              <SideMenu regions={regions} />
            </div>

            <LocalizedClientLink
              href="/"
              className="flex items-center gap-2 hover:opacity-90 transition-opacity"
              data-testid="nav-store-link"
            >
               <div className="flex items-center">
  <Image
    src="/logo.png"
    alt="MTB 1-4"
    width={140}
    height={40}
    priority
    className="h-10 w-auto object-contain"
  />
</div>
              {/* <span className="hidden sm:inline text-lg font-semibold text-foreground">
                MTB 1-4
              </span> */}
            </LocalizedClientLink>
          </div>

          {/* === CENTER: navigation + SEARCH (in one block) === */}
          <div className="hidden md:flex items-center gap-8 flex-1 mx-8">
            <nav className="flex items-center gap-6">
              {navigationLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex-1 max-w-xl">
              <HeaderSearch />
            </div>
          </div>

          {/* === RIGHT CLUSTER: phone / email / account / cart === */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-6">
              <a
                href="/contacts"
                className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden xl:inline">(050) 585-9344</span>
              </a>
              <a
                href="mailto:info@mtb1-4.com"
                className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span className="hidden xl:inline">info@mtb1-4.com</span>
              </a>
            </div>

             

            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-primary text-sm flex gap-1"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Cart (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </div>
      </div>
    </header>
  )
}
