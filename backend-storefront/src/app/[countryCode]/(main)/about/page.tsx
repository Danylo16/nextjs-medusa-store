import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, Hammer, MapPin, ShieldCheck, Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "Про нас — MTB1-4",
  description:
    "Малий виробник з Чернігова. Робимо реабілітаційні рішення, де якість — не маркетинг, а принцип.",
}

type AboutPageProps = {
  params: { countryCode: string }
}

const COPY = {
  hero: {
    kicker: "Про нас",
    title: "Малий цех з Чернігова. Велика впертість до якості.",
    lead: (
      <>
        Ми не “корпорація з презентаціями”. Ми — маленька команда, яка реально відповідає головою
        за продукт. Якщо десь можна зробити краще — робимо краще. Якщо треба переробити —
        переробимо. Бо потім цим користуються люди, яким потрібен результат, а не красиві слова.
      </>
    ),
    chips: ["Виробництво в Україні", "Контроль якості руками", "Логіка, а не “як вийшло”"],
  },
  blocks: {
    storyTitle: "Як це почалося",
    storyText: (
      <>
        Починали з простих задач і дуже приземленої ідеї: реабілітація має бути доступною і
        прогнозованою. Без “має спрацювати”. Відточували конструкції, переробляли вузли, вбивали
        час на дрібниці, які ніхто не бачить — але які відчуваються в експлуатації. Це той випадок,
        коли “херачимо з палеоліту” означає не пафос, а дисципліну: робимо, тестимо, покращуємо.
      </>
    ),
    missionTitle: "Навіщо ми це робимо",
    missionText: (
      <>
        Наш фокус — стабільна якість і адекватний сервіс. Не обіцяємо космос. Обіцяємо чесно:
        нормальні матеріали, логічні рішення, людське ставлення і готовність відповідати за
        результат.
      </>
    ),
  },
  values: [
    {
      icon: ShieldCheck,
      title: "Якість без компромісів",
      text: "Не “майже нормально”. А нормально. Якщо щось не проходить нашу планку — не їде клієнту.",
    },
    {
      icon: Hammer,
      title: "Інженерна дисципліна",
      text: "Ми любимо прості рішення, які працюють роками, а не трюки заради вигляду.",
    },
    {
      icon: Sparkles,
      title: "Постійні покращення",
      text: "Після продажу робота не закінчується. Фідбек перетворюємо в реальні зміни конструкцій.",
    },
    {
      icon: MapPin,
      title: "Свої, поруч, на звʼязку",
      text: "Чернігів. Україна. І ми реально відповідаємо, а не ховаємось за “підтримкою” з тикетами.",
    },
  ],
  pledge: {
    title: "Наш принцип простий",
    bullets: [
      "Краще повільніше, але правильно — ніж швидко і криво.",
      "Клієнт має отримати не “штуку”, а рішення, яким зручно користуватись.",
      "Якщо є проблема — ми не морозимось. Вирішуємо.",
    ],
  },
  cta: {
    title: "Хочеш підібрати рішення під задачу?",
    text: "Напиши — підкажемо, що підійде, що не підійде, і де ти просто витратиш гроші дарма.",
    primary: "Отримати консультацію",
    secondary: "Перейти в каталог",
  },
}

export default function AboutPage({ params }: AboutPageProps) {
  const cc = params.countryCode || "ua"
  const href = (path: string) => `/${cc}${path}`

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-background">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-28 left-1/2 h-[520px] w-[780px] -translate-x-1/2 rounded-full bg-secondary/40 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_90%_at_86%_110%,hsl(var(--primary-light)/0.28)_0%,hsl(var(--primary-light)/0.14)_32%,transparent_68%)]" />
      </div>

      <div className="content-container relative">
        <section className="section">
          <div className="card-soft relative overflow-hidden border border-foreground/10">
            <div className="absolute inset-0 bg-secondary-light/40" />

            <div className="relative grid gap-10 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
                  {COPY.hero.kicker}
                </p>

                <h1 className="mt-2 text-balance">{COPY.hero.title}</h1>

                <p className="mt-4 max-w-[68ch] text-sm leading-6 text-foreground/75">
                  {COPY.hero.lead}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {COPY.hero.chips.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-full border border-foreground/10 bg-card px-3 py-1 text-xs font-medium text-foreground/80 shadow-soft"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={href("/contacts")}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-medium transition-colors hover:bg-primary-dark"
                  >
                    {COPY.cta.primary}
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>

                  <Link
                    href={href("/store")}
                    className="contrast-btn inline-flex items-center justify-center gap-2 py-3"
                  >
                    {COPY.cta.secondary}
                  </Link>
                </div>
              </div>

              <div className="rounded-xl border border-foreground/10 bg-card p-5 shadow-soft md:p-6">
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-foreground">
                    <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold">{COPY.pledge.title}</h3>
                    <ul className="mt-3 space-y-2 text-sm text-foreground/75">
                      {COPY.pledge.bullets.map((b) => (
                        <li key={b} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-foreground/10 bg-secondary-light/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
                    Локація
                  </p>
                  <p className="mt-1 text-sm text-foreground/80">
                    Чернігів, Україна — виробництво, контроль, відповідальність.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="card-soft border border-foreground/10 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl">{COPY.blocks.storyTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-foreground/75">{COPY.blocks.storyText}</p>
            </div>

            <div className="card-soft border border-foreground/10 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl">{COPY.blocks.missionTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-foreground/75">
                {COPY.blocks.missionText}
              </p>

              <div className="mt-6 rounded-xl border border-foreground/10 bg-secondary-light/40 p-4">
                <p className="text-sm font-semibold text-foreground">Чесно про підхід:</p>
                <p className="mt-1 text-sm text-foreground/75">
                  Якщо ми бачимо, що продукт тобі не підходить — ми так і скажемо. Бо “впарити”
                  простіше зараз, але потім репутація згорить.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-alt">
          <div className="content-container px-0">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2>Цінності</h2>
                <p className="mt-2 max-w-[70ch] text-sm text-foreground/75">
                  Це не “слова для сайту”. Це речі, через які ми сперечаємось у цеху і через які
                  переробляємо те, що вже “і так норм”.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {COPY.values.map((v) => {
                const Icon = v.icon
                return (
                  <div
                    key={v.title}
                    className="card-soft border border-foreground/10 p-5 transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold">{v.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-foreground/75">{v.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="card-soft border border-foreground/10 p-6 md:p-10">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl md:text-2xl">{COPY.cta.title}</h2>
                <p className="mt-2 max-w-[75ch] text-sm text-foreground/75">{COPY.cta.text}</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={href("/contacts")}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-medium transition-colors hover:bg-primary-dark"
                >
                  {COPY.cta.primary}
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>

                <Link
                  href={href("/store")}
                  className="contrast-btn inline-flex items-center justify-center py-3"
                >
                  {COPY.cta.secondary}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="pb-10" />
      </div>
    </main>
  )
}
