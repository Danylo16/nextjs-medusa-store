"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowUpRightMini } from "@medusajs/icons"

type Variant = "main" | "checkout" | "locale" | "generic"

type Props = {
  variant?: Variant
}

export default function NotFoundView({ variant = "main" }: Props) {
  const params = useParams() as { countryCode?: string }
  const cc = params?.countryCode

  const base = cc ? `/${cc}` : ""
  const hrefHome = base || "/"
  const hrefStore = `${base}/store`
  const hrefCart = `${base}/cart`

  const copy =
    variant === "checkout"
      ? {
          badge: "Checkout",
          title: "Сторінку не знайдено",
          desc:
            "Цей крок оформлення не існує або був переміщений. Поверніться в кошик і продовжіть звідти.",
          primaryHref: hrefCart,
          primaryLabel: "Назад у кошик",
          secondaryHref: hrefStore,
          secondaryLabel: "До каталогу",
        }
      : variant === "locale"
      ? {
          badge: "Регіон",
          title: "Невірний код країни",
          desc:
            "Схоже, ви зайшли з некоректним кодом країни/мови. Оберіть правильний варіант.",
          primaryHref: "/ua",
          primaryLabel: "UA версія",
          secondaryHref: "/en",
          secondaryLabel: "EN version",
        }
      : {
          badge: "Помилка навігації",
          title: "Сторінку не знайдено",
          desc:
            "Посилання може бути застарілим, сторінку могли перемістити, або ви просто десь промахнулись у адресі.",
          primaryHref: hrefStore,
          primaryLabel: "Перейти до каталогу",
          secondaryHref: hrefHome,
          secondaryLabel: "На головну",
        }

  return (
    <main className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      {/* Decorative background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_78%)]">
          <div className="absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_0%,rgba(75,175,140,0.22)_0%,rgba(75,175,140,0.10)_35%,transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(55%_40%_at_18%_100%,rgba(246,148,111,0.16)_0%,rgba(246,148,111,0.07)_45%,transparent_78%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(40%_32%_at_88%_78%,rgba(75,175,140,0.10)_0%,transparent_70%)]" />
        </div>
      </div>

      <div className="content-container relative flex min-h-[calc(100vh-64px)] items-center py-10">
        <section className="w-full">
          <div className="card-soft relative mx-auto max-w-3xl p-6 md:p-10">
            {/* Big 404 watermark */}
            <div
              aria-hidden="true"
              className="absolute right-6 top-6 select-none text-[64px] font-semibold leading-none text-foreground/10 md:right-10 md:top-8 md:text-[88px]"
            >
              404
            </div>

            <div className="max-w-xl">
              <p className="text-small-semi inline-flex items-center gap-2 rounded-full bg-secondary-light/60 px-3 py-1 text-foreground/80">
                {copy.badge}
              </p>

              <h1 className="mt-4 text-[28px] font-semibold leading-tight md:text-[36px]">
                {copy.title}
              </h1>

              <p className="mt-3 text-base-regular text-foreground/80">
                {copy.desc}
              </p>

              <ul className="mt-5 space-y-2 text-sm text-foreground/80">
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Перевірте правильність URL
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Поверніться на головну або відкрийте каталог
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Посилання могло застаріти
                </li>
              </ul>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                {/* Accent CTA */}
                <Link
                  href={copy.primaryHref}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
                >
                  {copy.primaryLabel}
                  <ArrowUpRightMini className="transition-transform duration-150 group-hover:rotate-45" />
                </Link>

                {/* Primary outline */}
                <Link
                  href={copy.secondaryHref}
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-primary bg-transparent px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
                >
                  {copy.secondaryLabel}
                  <ArrowUpRightMini className="transition-transform duration-150 group-hover:rotate-45" />
                </Link>
              </div>

              <div className="mt-8 rounded-xl bg-secondary-light/40 p-4">
                <p className="text-sm font-semibold">Швидкі посилання</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                  <Link className="text-primary hover:text-primary-dark" href={hrefStore}>
                    Новинки
                  </Link>
                  <Link className="text-primary hover:text-primary-dark" href={hrefStore}>
                    Популярні товари
                  </Link>
                  <Link className="text-primary hover:text-primary-dark" href={hrefCart}>
                    Кошик
                  </Link>
                </div>
              </div>

              <p className="mt-6 text-xs text-foreground/60">
                Якщо ви впевнені, що це помилка сайту — напишіть нам, додайте URL
                сторінки і що саме ви робили.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
