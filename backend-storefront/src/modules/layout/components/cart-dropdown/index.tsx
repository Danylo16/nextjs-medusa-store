"use client"

import { Transition } from "@headlessui/react"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { ShoppingCart } from "lucide-react"
import { usePathname } from "next/navigation"
import React, { Fragment, useEffect, useRef, useState } from "react"

type Props = {
  cart?: HttpTypes.StoreCart | null
}

const CartDropdown: React.FC<Props> = ({ cart: cartState }) => {
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pathname = usePathname()

  const totalItems =
    cartState?.items?.reduce((acc, item) => acc + (item.quantity ?? 0), 0) ?? 0

  const subtotal = cartState?.subtotal ?? 0
  const prevItemsRef = useRef<number>(totalItems)

  const open = () => setCartDropdownOpen(true)
  const close = () => setCartDropdownOpen(false)

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const timedOpen = () => {
    clearTimer()
    open()
    timerRef.current = setTimeout(() => close(), 5000)
  }

  const openAndCancel = () => {
    clearTimer()
    open()
  }

  useEffect(() => {
    return () => clearTimer()
  }, [])

  useEffect(() => {
    const prev = prevItemsRef.current
    const isOnCart = pathname.includes("/cart")

    if (prev !== totalItems && !isOnCart) {
      timedOpen()
    }

    prevItemsRef.current = totalItems
  }, [totalItems, pathname])

  const handleBlurCapture = (e: React.FocusEvent<HTMLDivElement>) => {
    const next = e.relatedTarget as Node | null
    if (!next || !e.currentTarget.contains(next)) {
      close()
    }
  }

  const showBadge = totalItems > 0
  const badgeText = totalItems > 99 ? "99+" : String(totalItems)

  return (
    <div
      className="relative h-full z-50"
      onMouseEnter={openAndCancel}
      onMouseLeave={close}
      onFocusCapture={openAndCancel}
      onBlurCapture={handleBlurCapture}
    >
      <LocalizedClientLink
        href="/cart"
        data-testid="nav-cart-link"
        title={showBadge ? `Кошик: ${totalItems}` : "Кошик"}
        aria-label={showBadge ? `Кошик, товарів: ${totalItems}` : "Кошик"}
        className="relative inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium
          bg-primary/10 text-primary
          transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
      >
        <ShoppingCart className="h-5 w-5" aria-hidden="true" />
        <span className="hidden sm:inline">Кошик</span>

        {showBadge && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#f29999] text-white text-[11px] leading-[18px] font-semibold text-center tabular-nums shadow"
            aria-hidden="true"
          >
            {badgeText}
          </span>
        )}

        <span className="sr-only">
          {showBadge
            ? `Перейти до кошика. Товарів: ${totalItems}`
            : "Перейти до кошика"}
        </span>
      </LocalizedClientLink>

      <Transition
        show={cartDropdownOpen}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <div
          className="hidden small:block absolute right-0 top-[calc(100%+10px)] w-[420px] rounded-2xl border border-border/60 bg-card text-foreground shadow-lg"
          data-testid="nav-cart-dropdown"
          role="dialog"
          aria-label="Попередній перегляд кошика"
        >
          <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
            <h3 className="text-base font-semibold">Кошик</h3>
            {showBadge && (
              <span className="text-xs text-foreground/70 tabular-nums">
                {totalItems} шт.
              </span>
            )}
          </div>

          {cartState && cartState.items?.length ? (
            <>
              <div className="max-h-[402px] overflow-y-auto px-4 py-4 grid grid-cols-1 gap-y-6 no-scrollbar">
                {cartState.items
                  .slice()
                  .sort((a, b) =>
                    (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                  )
                  .map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[96px_1fr] gap-x-4"
                      data-testid="cart-item"
                    >
                      <LocalizedClientLink
                        href={`/products/${item.product_handle}`}
                        className="w-24"
                        onClick={close}
                      >
                        <Thumbnail
                          thumbnail={item.thumbnail}
                          images={item.variant?.product?.images}
                          size="square"
                        />
                      </LocalizedClientLink>

                      <div className="flex flex-col justify-between min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-sm font-medium leading-5 truncate">
                              <LocalizedClientLink
                                href={`/products/${item.product_handle}`}
                                data-testid="product-link"
                                onClick={close}
                                className="hover:text-primary transition-colors"
                              >
                                {item.title}
                              </LocalizedClientLink>
                            </h3>

                            <div className="mt-1">
                              <LineItemOptions
                                variant={item.variant}
                                data-testid="cart-item-variant"
                                data-value={item.variant}
                              />
                            </div>

                            <div
                              className="mt-1 text-xs text-foreground/70 tabular-nums"
                              data-testid="cart-item-quantity"
                              data-value={item.quantity}
                            >
                              Кількість: {item.quantity}
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <LineItemPrice
                              item={item}
                              style="tight"
                              currencyCode={cartState.currency_code}
                            />
                          </div>
                        </div>

                        <DeleteButton
                          id={item.id}
                          className="mt-2 text-xs text-foreground/70 hover:text-foreground"
                          data-testid="cart-item-remove-button"
                        >
                          Видалити
                        </DeleteButton>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="px-4 pb-4 pt-3 border-t border-border/60">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">
                    Підсумок{" "}
                    <span className="font-normal text-foreground/70">
                      (без податків)
                    </span>
                  </span>

                  <span
                    className="text-base font-semibold tabular-nums"
                    data-testid="cart-subtotal"
                    data-value={subtotal}
                  >
                    {convertToLocale({
                      amount: subtotal,
                      currency_code: cartState.currency_code,
                    })}
                  </span>
                </div>

                <div className="mt-3">
                  <LocalizedClientLink href="/cart" passHref onClick={close}>
                    <Button
                      className="w-full rounded-xl"
                      size="large"
                      data-testid="go-to-cart-button"
                    >
                      Перейти до кошика
                    </Button>
                  </LocalizedClientLink>
                </div>
              </div>
            </>
          ) : (
            <div className="px-4 py-10 flex flex-col gap-y-4 items-center justify-center">
              <div className="bg-primary/10 text-primary flex items-center justify-center w-10 h-10 rounded-full">
                <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              </div>

              <div className="text-sm text-foreground/80">Кошик порожній.</div>

              <LocalizedClientLink href="/store" onClick={close}>
                <Button className="rounded-xl">Перейти до товарів</Button>
              </LocalizedClientLink>
            </div>
          )}
        </div>
      </Transition>
    </div>
  )
}

export default CartDropdown
