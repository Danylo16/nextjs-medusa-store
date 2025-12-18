// @modules/layout/components/header-client.tsx
"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Menu, X, Search, Phone, Mail } from "lucide-react"
import type { StoreRegion } from "@medusajs/types"

import SideMenu from "@modules/layout/components/side-menu"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"

type HeaderClientProps = {
  regions: StoreRegion[]
}

export default function HeaderClient({ regions }: HeaderClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [search, setSearch] = useState("")
  const router = useRouter()

  const navigationLinks = [
    { label: "Products", href: "#products" },
    { label: "Services", href: "#services" },
    { label: "About", href: "#about" },
    { label: "Blog", href: "#blog" },
  ]

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    const query = search.trim()
    if (!query) return
    router.push(`/search?q=${encodeURIComponent(query)}`)
    setIsMenuOpen(false)
  }

  return (
    <>
      {/* Ліва частина: SideMenu + лого */}
      <div className="flex items-center gap-3 flex-1 basis-0 h-full">
        {/* бургер Medusa з регіонами / категоріями */}
        <div className="h-full flex items-center md:hidden">
          <SideMenu regions={regions} />
        </div>

        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">M</span>
          </div>

          <LocalizedClientLink
            href="/"
            className="hidden sm:inline text-lg font-semibold text-foreground"
            data-testid="nav-store-link"
          >
            MTB 1-4
          </LocalizedClientLink>
        </div>
      </div>

      {/* Центр: навігація + пошук (як у твоєму макеті) */}
      <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
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

        <div className="flex-1 max-w-xs">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 pl-10 text-sm rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </form>
        </div>
      </div>

      {/* Права частина: акаунт + кошик + контакти */}
      <div className="flex items-center gap-4 flex-1 basis-0 justify-end h-full">
        

        {/* телефон + пошта іконками */}
        <div className="hidden lg:flex items-center gap-4">
          <a
            href="tel:+1234567890"
            className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
          >
            <Phone className="w-4 h-4" />
          </a>
          <a
            href="mailto:info@mtb1-4.com"
            className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
          >
            <Mail className="w-4 h-4" />
          </a>
        </div>

        {/* Кошик – обов'язково зберігаємо */}
        <CartButton />

        {/* окремий мобільний пошук/меню, якщо хочеш – але можна й без нього */}        
      </div>
    </>
  )
}
