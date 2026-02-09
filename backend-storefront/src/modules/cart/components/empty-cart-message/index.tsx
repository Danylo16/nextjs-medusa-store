import { Heading, Text } from "@medusajs/ui"
import InteractiveLink from "@modules/common/components/interactive-link"

const EmptyCartMessage = () => {
  return (
    <section
      className="section"
      data-testid="empty-cart-message"
      aria-labelledby="empty-cart-title"
    >
      <div className="content-container">
        <div className="relative overflow-hidden rounded-xl bg-card shadow-soft border border-muted/60">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-light/35 via-transparent to-accent-light/25" />

          <div className="relative grid items-center gap-10 p-6 md:p-10 md:grid-cols-[220px_1fr]">
            {/* Illustration */}
            <div className="flex justify-center md:justify-start">
              <div className="grid h-40 w-40 place-items-center rounded-full bg-white/70 border border-muted/60 shadow-soft">
                <svg
                  width="76"
                  height="76"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6.5 6h14l-1.5 8.5a2 2 0 0 1-2 1.7H9.1a2 2 0 0 1-2-1.6L5.2 3.8A1.5 1.5 0 0 0 3.7 2.7H2.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  />
                  <path
                    d="M9.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM17.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="max-w-2xl">
              <Heading
                level="h1"
                id="empty-cart-title"
                className="text-3xl-semi md:text-4xl font-heading"
              >
                Кошик порожній
              </Heading>

              <Text className="mt-3 text-base-regular text-foreground/75 max-w-[48rem]">
                У вас поки немає товарів у кошику. Перейдіть у каталог, відкрийте
                потрібний товар і натисніть “Додати в кошик” — після цього тут
                з’явиться замовлення.
              </Text>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-muted/60 bg-white/60 p-4">
                  <div className="text-sm font-semibold text-foreground">
                    1) Знайдіть товар
                  </div>
                  <div className="mt-1 text-sm text-foreground/70">
                    Перейдіть у каталог і оберіть потрібне.
                  </div>
                </div>

                <div className="rounded-lg border border-muted/60 bg-white/60 p-4">
                  <div className="text-sm font-semibold text-foreground">
                    2) Додайте в кошик
                  </div>
                  <div className="mt-1 text-sm text-foreground/70">
                    На сторінці товару натисніть кнопку додавання.
                  </div>
                </div>

                <div className="rounded-lg border border-muted/60 bg-white/60 p-4">
                  <div className="text-sm font-semibold text-foreground">
                    3) Оформіть замовлення
                  </div>
                  <div className="mt-1 text-sm text-foreground/70">
                    Перевірте позиції і перейдіть до оформлення.
                  </div>
                </div>
              </div>

               {/* CTAs */}
<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
  {/* PRIMARY (зелена заливка) */}
  <div
    className={[
      "sm:flex-1", // щоб кнопки були однакової ширини як на прикладі
      "[&_a]:inline-flex [&_a]:w-full [&_a]:items-center [&_a]:justify-center [&_a]:gap-2",
      "[&_a]:rounded-lg [&_a]:font-medium [&_a]:whitespace-nowrap",
      "[&_a]:transition-all [&_a]:duration-200 [&_a]:ease-out [&_a]:cursor-pointer [&_a]:select-none",
      "[&_a]:focus-visible:outline-none [&_a]:focus-visible:ring-2 [&_a]:focus-visible:ring-offset-2 [&_a]:focus-visible:ring-primary",
      // size lg (як у Button)
      "[&_a]:h-12 [&_a]:px-6 [&_a]:text-base",
      // variant primary (як у Button)
      "[&_a]:bg-primary [&_a]:text-primary-foreground",
      "[&_a:hover]:brightness-90",
      "[&_a]:shadow-[0_1px_4px_rgba(0,0,0,0.05)]",
      "[&_a:hover]:shadow-[0_2px_8px_rgba(0,0,0,0.10)]",
      // прибираємо дефолтні стилі лінка з base layer
      "[&_a]:no-underline",
    ].join(" ")}
  >
    <InteractiveLink href="/store">Перейти в каталог</InteractiveLink>
  </div>

  {/* ACCENT OUTLINE (рожева обводка) */}
  <div
    className={[
      "sm:flex-1",
      "[&_a]:inline-flex [&_a]:w-full [&_a]:items-center [&_a]:justify-center [&_a]:gap-2",
      "[&_a]:rounded-lg [&_a]:font-medium [&_a]:whitespace-nowrap",
      "[&_a]:transition-all [&_a]:duration-200 [&_a]:ease-out [&_a]:cursor-pointer [&_a]:select-none",
      "[&_a]:focus-visible:outline-none [&_a]:focus-visible:ring-2 [&_a]:focus-visible:ring-offset-2 [&_a]:focus-visible:ring-primary",
      // size lg
      "[&_a]:h-12 [&_a]:px-6 [&_a]:text-base",
      // variant accentOutline (як у Button)
      "[&_a]:border [&_a]:border-accent [&_a]:text-accent [&_a]:bg-transparent",
      "[&_a:hover]:bg-accent [&_a:hover]:text-primary-foreground",
      "[&_a]:shadow-[0_1px_4px_rgba(0,0,0,0.05)]",
      "[&_a:hover]:shadow-[0_2px_8px_rgba(0,0,0,0.10)]",
      "[&_a]:no-underline",
    ].join(" ")}
  >
    <InteractiveLink href="/">На головну</InteractiveLink>
  </div>
</div>

 

              <Text className="mt-6 text-sm text-foreground/60">
                Порада: якщо знаєте артикул (SKU) — шукайте його через пошук у
                шапці сайту, це найшвидший шлях.
              </Text>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default EmptyCartMessage
