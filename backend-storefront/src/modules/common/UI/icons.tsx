"use client"

import React, { useEffect, useMemo, useState } from "react"
import { X } from "lucide-react"

type ServiceKey = "guarantee" | "delivery" | "payment"

type ServiceItem = {
  key: ServiceKey
  title: string
  subtitle: string
  icon: React.ReactNode
  body: React.ReactNode
}

export function ServiceInfoBar() {
  const [openKey, setOpenKey] = useState<ServiceKey | null>(null)

  // щоб exit-анімація була плавна (контент не пропадає миттєво)
  const [renderKey, setRenderKey] = useState<ServiceKey | null>(null)
  const [entered, setEntered] = useState(false)

  const items: ServiceItem[] = useMemo(
    () => [
      {
        key: "guarantee",
        title: "Гарантія",
        subtitle: "Офіційна гарантія",
        icon: <IconShield className="h-6 w-6 sm:h-5 sm:w-5" />,
         body: (
  <div className="space-y-4">
    <h4 className="text-sm font-semibold text-foreground">Гарантії якості та безпеки</h4>

    <p className="text-sm text-foreground/90">
      Ми — офіційний виробник реабілітаційного та силового обладнання, тому гарантуємо{" "}
      <span className="font-semibold">якість, безпечність і надійність</span> кожного виробу.
    </p>

    <ul className="list-disc pl-5 text-sm text-foreground/90 space-y-1">
      <li>Продукція сертифікована</li>
      <li>Відповідає стандарту ISO 9001:2015</li>
      <li>Має позитивний висновок ДСЄЕ</li>
      <li>Відповідає вимогам ДСТУ та санітарно-гігієнічним нормам МОЗ України</li>
    </ul>

    <p className="text-sm text-foreground/90">
      На весь асортимент діє <span className="font-semibold">індивідуальна гарантія виробника</span>, а також{" "}
      <span className="font-semibold">14-денна гарантія обміну або повернення</span> відповідно до Закону України
      «Про захист прав споживачів».
    </p>

    <p className="text-sm text-foreground/90">
      Обираючи обладнання на сайті Mtb1-4.com, ви отримуєте перевірене рішення для реабілітації та тренувань МТБ.
    </p>
  </div>
)

      },
      {
        key: "delivery",
        title: "Доставка",
        subtitle: "Міжнародні",
        icon: <IconTruck className="h-6 w-6 sm:h-5 sm:w-5" />,
        body: (
           <div className="space-y-5">
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-foreground">м. Чернігів</h4>
      <ul className="list-disc pl-5 text-sm text-foreground/90 space-y-1">
        <li>
          Доставка до під’їзду / об’єкта (без занесення) —{" "}
          <span className="font-semibold">безкоштовно</span> при замовленні понад{" "}
          <span className="font-semibold">1000 грн</span>.
        </li>
        <li>
          Доставка до відділення або офісу ТК —{" "}
          <span className="font-semibold">безкоштовно</span>.
        </li>
      </ul>
    </div>

    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-foreground">м. Київ та Україна</h4>
      <p className="text-sm text-foreground/90">
        Вартість доставки по Києву та регіонах України розраховується{" "}
        <span className="font-semibold">індивідуально</span> — з урахуванням географії
        відправлень та номенклатури товарів.
      </p>
    </div>

    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-foreground">Типи доставки</h4>
      <ul className="list-disc pl-5 text-sm text-foreground/90 space-y-1">
        <li>
          <span className="font-semibold">Самовивіз</span> — зі складу, попередньо узгодивши
          дату та час з менеджером.
        </li>
        <li>
          <span className="font-semibold">Вантажоперевізник (ТК)</span> — будь-якою транспортною
          компанією за вашим вибором, відповідно до тарифів перевізника.
        </li>
        <li>
          <span className="font-semibold">Найманий транспорт</span> — допоможемо з пошуком та
          підбором відповідного вантажного автотранспорту.
        </li>
      </ul>
    </div>

    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-foreground/90">
      <span className="font-semibold">Примітка:</span> умови доставки, терміни та вартість уточнюйте у менеджера
      під час оформлення замовлення.
    </div>
  </div>
        ),
      },
      {
        key: "payment",
        title: "Оплата",
        subtitle: "Гнучкі варіанти",
        icon: <IconWallet className="h-6 w-6 sm:h-5 sm:w-5" />,
         body: (
          <div className="space-y-4">
            <p className="text-sm text-foreground">
              Доступні варіанти оплати підбираємо під ваш тип закупівлі.
            </p>

            <ul className="list-disc pl-5 text-sm text-foreground/90 space-y-1">
              <li>ФОП 2 група (без ПДВ)</li>
              <li>ФОП 3 група (як послуги)</li>
              <li>Безготівковий з ПДВ для ТОВ</li>
              <li>Платіж в іноземній валюті (USD / EUR)</li>
              <li>Накладений платіж (Нова Пошта, САТ)</li>
            </ul>
          </div>
        )

      },
    ],
    []
  )

  const active = renderKey ? items.find((x) => x.key === renderKey) : null

  // enter/exit animation orchestration
  useEffect(() => {
    if (openKey) {
      setRenderKey(openKey)
      // даємо DOM змонтуватись, тоді включаємо transition
      requestAnimationFrame(() => setEntered(true))
      return
    }

    // close
    if (renderKey) {
      setEntered(false)
      const t = window.setTimeout(() => setRenderKey(null), 220)
      return () => window.clearTimeout(t)
    }
  }, [openKey, renderKey])

  // ESC to close
  useEffect(() => {
    if (!renderKey) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenKey(null)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [renderKey])

  // lock body scroll + prevent layout shift (scrollbar compensation)
  useEffect(() => {
    if (!renderKey) return

    const body = document.body
    const prevOverflow = body.style.overflow
    const prevPaddingRight = body.style.paddingRight

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    body.style.overflow = "hidden"
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`

    return () => {
      body.style.overflow = prevOverflow
      body.style.paddingRight = prevPaddingRight
    }
  }, [renderKey])

  return (
    <>
       {/* Trust bar */}
<div className="mt-4 rounded-2xl border border-gray-200 bg-muted/20 p-2">
  <div className="grid grid-cols-3 gap-1 sm:gap-2">
    {items.map((it) => (
      <button
        key={it.key}
        type="button"
        onClick={() => setOpenKey(it.key)}
        className={[
          "group min-w-0 cursor-pointer rounded-xl transition hover:bg-background/70 active:scale-[0.99]",
          "px-2 py-2 sm:px-3 sm:py-2",
          // xs: вертикально й по центру, sm+: як було (іконка + текст зліва)
          "flex flex-col items-center justify-center gap-1 text-center",
          "sm:flex-row sm:items-center sm:justify-start sm:gap-3 sm:text-left",
        ].join(" ")}
        aria-label={`${it.title}. ${it.subtitle}`}
      >
        <span
          className={[
            "grid shrink-0 place-items-center rounded-xl bg-background/70 ring-1 ring-gray-200",
            "text-primary transition group-hover:ring-primary/30",
            // xs менше, sm більше
            "h-9 w-9 sm:h-10 sm:w-10",
          ].join(" ")}
        >
          {/* уникаємо “витягування” */}
          <span className="grid h-6 w-6 place-items-center">
            {it.icon}
          </span>
        </span>

        <span className="min-w-0">
          {/* SEO/а11y: повний текст завжди є */}
          <span className="sr-only">{it.title}. {it.subtitle}</span>

          {/* видимий текст: xs — компактний і обрізаний, sm — норм */}
          <span className="block max-w-full truncate text-[10px] font-semibold uppercase tracking-wide text-foreground sm:text-[11px]">
            {it.title}
          </span>

          <span className="hidden sm:block truncate text-xs text-muted-foreground">
            {it.subtitle}
          </span>
        </span>
      </button>
    ))}
  </div>
</div>


      {/* Modal */}
      {active && (
        <div
          className={[
            "fixed inset-0 z-50 flex items-center justify-center p-4",
            "transition-opacity duration-200",
            entered ? "bg-black/50 opacity-100" : "bg-black/50 opacity-0",
          ].join(" ")}
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenKey(null)
          }}
        >
          <div
            className={[
              "w-full max-w-lg rounded-2xl bg-card shadow-lg ring-1 ring-black/5",
              "transform transition-all duration-200 ease-out",
              entered ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-[0.98]",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-muted/20 text-primary shrink-0">
                    {active.icon}
                  </span>
                  <h3 className="text-lg font-semibold text-foreground truncate">{active.title}</h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{active.subtitle}</p>
              </div>

              <button
                type="button"
                onClick={() => setOpenKey(null)}
                className="cursor-pointer rounded-xl p-2 text-muted-foreground transition hover:bg-muted/30 hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* щоб контент не випирав за екран — скрол всередині модалки */}
            <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">{active.body}</div>

            <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
              <button
                type="button"
                onClick={() => setOpenKey(null)}
                className="cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 transition"
              >
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ===== Мінімалістичні SVG-іконки (один стиль, одна товщина) ===== */

type IconProps = React.SVGProps<SVGSVGElement>

function IconShield(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid meet" {...props}>
      <path
        d="M12 3.2c2.4 1.7 4.7 2 7 2.4v6.8c0 4.7-3 7.4-7 8.6-4-1.2-7-3.9-7-8.6V5.6c2.3-.4 4.6-.7 7-2.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M8.8 12.2l2 2 4.6-4.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconTruck(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid meet" {...props}>
      <path
        d="M3.4 7.7h10.2v8H3.4v-8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M13.6 10.2h4l2.1 2.4v3.1h-6.1v-5.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M7.1 18.4a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M17.5 18.4a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M1.9 10.3h1.5M1.9 13.1h1.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconWallet(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid meet" {...props}>
      <path
        d="M6.2 7.3h11.4c1 0 1.8.8 1.8 1.8v6.2c0 1-.8 1.8-1.8 1.8H6.2c-1 0-1.8-.8-1.8-1.8V9.1c0-1 .8-1.8 1.8-1.8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M4.4 10h15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M15.8 14.2h2.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
