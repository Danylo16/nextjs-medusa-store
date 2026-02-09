import Image from "next/image"
import { cookies } from "next/headers"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Дякуємо! Заявку прийнято",
  robots: { index: false, follow: false }, // important: don't index thank-you pages
}

type SummaryItem = {
  id: string
  title: string
  thumbnail?: string
  quantity: number
  unit_price: number | null
  total: number | null
}

type ThanksSummary = {
  display_id: number | string | null
  currency_code: string
  items: SummaryItem[]
}

function formatMoneyMinor(amountMinor: number, currencyCode: string) {
  const major = amountMinor / 100
  try {
    return new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency: currencyCode.toUpperCase(),
      currencyDisplay: "symbol",
      maximumFractionDigits: 2,
    }).format(major)
  } catch {
    return `${major.toFixed(2)} ${currencyCode.toUpperCase()}`
  }
}

export default async function ThanksPage({ params }: { params: { countryCode: string } }) {
  const cc = (params.countryCode || "ua").toLowerCase()

  const c = await cookies()
  const raw = c.get("thanks_summary")?.value

  let summary: ThanksSummary | null = null
  if (raw) {
    try {
      const json = Buffer.from(raw, "base64url").toString("utf8")
      summary = JSON.parse(json)
    } catch {
      summary = null
    }
  }

  const items = summary?.items ?? []
  const currency = summary?.currency_code ?? "uah"

  const itemsTotalMinor = items.reduce((acc, it) => {
    if (typeof it.total === "number") return acc + it.total
    if (typeof it.unit_price === "number") return acc + it.unit_price * (it.quantity ?? 1)
    return acc
  }, 0)

  return (
    <div className="section">
      <div className="content-container">
        <div className="mx-auto max-w-2xl card-soft border border-muted/70 p-6 md:p-8">
          <h1 className="text-[24px] leading-[32px] md:text-[30px] md:leading-[40px] font-semibold">
            Дякуємо! Заявку прийнято.
          </h1>

          <p className="mt-2 text-sm text-foreground/70">
            Менеджер зателефонує найближчим часом, щоб підтвердити наявність і доставку.
          </p>

          {items.length ? (
            <>
              <div className="mt-6 space-y-3">
                {items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center gap-4 rounded-xl border border-muted/70 bg-card p-4"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-secondary-light/40 border border-muted/60">
                      {it.thumbnail ? (
                        <Image
                          src={it.thumbnail}
                          alt={it.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{it.title}</div>
                      <div className="mt-1 text-xs text-foreground/60">
                        К-сть: {it.quantity}
                        {typeof it.unit_price === "number"
                          ? ` · ${formatMoneyMinor(it.unit_price, currency)} / шт`
                          : ""}
                      </div>
                    </div>

                    <div className="text-right text-sm font-semibold">
                      {typeof it.total === "number"
                        ? formatMoneyMinor(it.total, currency)
                        : typeof it.unit_price === "number"
                          ? formatMoneyMinor(it.unit_price * it.quantity, currency)
                          : ""}
                    </div>
                  </div>
                ))}
              </div>

               <div className="mt-5 rounded-xl border border-muted/70 bg-card p-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                    <div className="text-sm text-foreground/70">Сума товарів</div>
                    <div className="mt-1 text-xs text-foreground/60">
                        Доставка та фінальна сума будуть підтверджені менеджером телефоном.
                    </div>
                    </div>

                    <div className="shrink-0 text-sm font-semibold tabular-nums text-right">
                    {formatMoneyMinor(itemsTotalMinor, currency)}
                    </div>
                </div>
                </div>
            </>
          ) : (
            <div className="mt-6 rounded-xl border border-muted/70 bg-card p-4 text-sm text-foreground/70">
              Деталі замовлення недоступні. Якщо потрібно — менеджер все підтвердить по телефону.
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LocalizedClientLink
              href="/store"
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-accent-dark transition-colors"
            >
              Продовжити покупки
            </LocalizedClientLink>

            <LocalizedClientLink
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-primary px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              На головну
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </div>
  )
}
