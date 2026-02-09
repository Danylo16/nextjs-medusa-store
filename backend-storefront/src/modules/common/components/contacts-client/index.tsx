"use client"

import { useEffect, useRef, useState } from "react"
import { Phone, Mail, Clock, MapPin, ChevronDown, ArrowRight } from "lucide-react"

import { CONTACTS } from "@/lib/data/contacts-config"
import { Button } from "@modules/common/UI/button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CallbackRequestModal from  "@modules/common/components/callback-request-modal"

import { SocialIcon } from '../social-icon'
import { ChannelIcon } from "../channel-icon"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../accordion' 

export function ContactsClient() {
  const [modalOpen, setModalOpen] = useState(false)
 

  return (
    <main className="min-h-[calc(100vh-64px)]">
      {/* Hero */}
      <section className="w-full py-16 md:py-24 bg-[#F8F0F2]">
        <div className="content-container text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-4">
            Контакти
          </h1>
          <p className="text-black/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Зв&apos;яжіться з нами зручним способом — по телефону, у месенджері або
            залиште заявку на консультацію.
          </p>

          <Button size="lg" variant="primary" onClick={() => setModalOpen(true)}>
            Замовити консультацію
          </Button>
        </div>
      </section>

      {/* Cards */}
      <section className="section">
        <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phones */}
            <div className="card-soft border border-black/10 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Phone className="h-5 w-5 text-primary/80" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Телефони</h2>
              </div>
              <div className="flex flex-col gap-5">
                {CONTACTS.phones.map((phone) => (
                  <PhoneEntryCard key={phone.value} phone={phone} />
                ))}
              </div>
            </div>

            {/* Emails */}
            <div className="card-soft border border-black/10 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Mail className="h-5 w-5 text-primary/80" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Електронна пошта
                </h2>
              </div>

              <div className="flex flex-col gap-4">
                {CONTACTS.emails.map((email) => (
                  <div key={email.value}>
                    <p className="text-xs text-black/50 mb-1">{email.label}</p>
                    <a
                      href={`mailto:${email.value}`}
                      className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {email.value}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Hours */}
            <div className="card-soft border border-black/10 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Clock className="h-5 w-5 text-primary/80" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Графік роботи
                </h2>
              </div>

              <div className="flex flex-col gap-2">
                {CONTACTS.workingHours.map((wh) => (
                  <div key={wh.label} className="flex items-center justify-between text-sm">
                    <span className="text-black/55">{wh.label}</span>
                    <span className="font-semibold text-foreground">{wh.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Address */}
            <div className="card-soft border border-black/10 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary/80" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Адреса</h2>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{CONTACTS.address}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Socials */}
      <section className="section-alt bg-[#F8F0F2]">
        <div className="content-container text-center">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-6">
            Ми у соцмережах
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {CONTACTS.socials.map((social) => (
              <a
                key={social.key}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-foreground shadow-soft hover:shadow-medium hover:border-primary/30 hover:text-primary transition-all"
                aria-label={social.label}
              >
                <SocialIcon icon={social.icon} />
                <span>{social.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="section">
        <div className="content-container text-center max-w-3xl">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
            Про нас коротко
          </h2>
          <p className="text-black/60 text-sm md:text-base leading-relaxed mb-6">
            {CONTACTS.companyDescription} Ми спеціалізуємось на постачанні
            сертифікованого обладнання для реабілітаційних центрів, лікарень та
            приватних кабінетів по всій Україні.
          </p>

          <LocalizedClientLink
            href="/about"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary "
            >
            Дізнатися більше
            <ArrowRight
                className="h-4 w-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1"
                aria-hidden="true"
            />
            </LocalizedClientLink>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-alt bg-[#F8F0F2]">
  <div className="content-container">
    <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-6 text-center">
      Часті запитання
    </h2>

    {/* no card, only list */}
    <Accordion type="single" collapsible className="mx-auto w-full max-w-4xl">
      <AccordionItem value="faq-1">
        <AccordionTrigger>Як швидко ви відповідаєте на запити?</AccordionTrigger>
        <AccordionContent>
          <p className="text-black/60 leading-relaxed text-sm">
            Ми відповідаємо на всі звернення протягом одного робочого дня. У месенджерах
            час відповіді зазвичай складає до 30 хвилин у робочий час.
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="faq-2">
        <AccordionTrigger>Чи можна замовити доставку по всій Україні?</AccordionTrigger>
        <AccordionContent>
          <p className="text-black/60 leading-relaxed text-sm">
            Так, ми доставляємо обладнання по всій території України. Для великогабаритного
            обладнання організовуємо спеціалізовану доставку з монтажем.
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="faq-3">
        <AccordionTrigger>Які умови гарантії на обладнання?</AccordionTrigger>
        <AccordionContent>
          <p className="text-black/60 leading-relaxed text-sm">
            Гарантія від виробника складає від 12 до 36 місяців залежно від типу обладнання.
            Ми також надаємо постгарантійне сервісне обслуговування.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
</section> 
      

      {/* Bottom CTA */}
      {/* <section className="section">
        <div className="content-container text-center max-w-3xl">
          <p className="text-black/55 text-sm mb-4">
            Потрібна допомога з вибором обладнання?
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button variant="outline" size="lg">
              <LocalizedClientLink href="/">Перейти в каталог</LocalizedClientLink>
            </Button>

            <Button variant="outline" size="lg">
              <LocalizedClientLink href="/search">Пошук по артикулу</LocalizedClientLink>
            </Button>
          </div>
        </div>
      </section> */}

      <CallbackRequestModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </main>
  )
}

function PhoneEntryCard({
  phone,
}: {
  phone: (typeof CONTACTS.phones)[number]
}) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const telHref =
    phone.channels.find((c) => c.type === "tel")?.href ??
    `tel:${phone.value.replace(/\s/g, "")}`

  const channels = phone.channels.filter((c) => c.type !== "tel")

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-black/50">{phone.label}</p>

      <div className="flex items-center gap-2">
        <a
          href={telHref}
          className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
        >
          {phone.value}
        </a>

        {channels.length > 0 ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-lg border border-black/10 bg-white px-2 py-1 text-xs text-black/55 hover:border-primary/30 hover:text-primary transition-colors"
              aria-expanded={open}
              aria-haspopup="true"
            >
              Написати
              <ChevronDown
                className={"h-3 w-3 transition " + (open ? "rotate-180" : "")}
              />
            </button>

            {open ? (
              <div className="absolute left-0 top-[calc(100%+8px)] z-50 min-w-[190px] overflow-hidden rounded-xl border border-black/10 bg-white shadow-medium">
                <div className="p-1">
                  {channels.map((ch) => (
                    <a
                      key={ch.type}
                      href={ch.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-black/[0.04] transition-colors"
                    >
                      <ChannelIcon type={ch.type} />
                      <span>{ch.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
