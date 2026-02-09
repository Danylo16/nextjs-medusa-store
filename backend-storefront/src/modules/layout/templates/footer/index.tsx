import type { ComponentType } from "react"
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react"

type NavLink = {
  label: string
  href: string
}

type NavSection = {
  title: string
  links: NavLink[]
}

type SocialLink = {
  Icon: ComponentType<{ className?: string }>
  href: string
  label: string
}

const socialLinks: SocialLink[] = [
  { Icon: Facebook, href: "https://facebook.com/yourpage", label: "Facebook" },
  { Icon: Twitter, href: "https://twitter.com/yourpage", label: "Twitter" },
  { Icon: Instagram, href: "https://instagram.com/yourpage", label: "Instagram" },
  { Icon: Linkedin, href: "https://linkedin.com/company/yourpage", label: "LinkedIn" },
]

const footerNav: NavSection[] = [
  {
    title: "Категорії",
    links: [
      { label: "Кінезіотерапія", href: "/categories/mtb-kinesitherapy-trenazhery" },
      { label: "Аксесуари", href: "/categories/mtb-aksesuary" },
      { label: "Лави для реабілітації", href: "/categories/lavky-dlya-reabilitatsiyi-spyny" },
      { label: "Інше обладнання", href: "/categories/brusy-skhody-obladnannya" },
    ],
  },
  {
    title: "Компанія",
    links: [
      { label: "Наші роботи", href: "/#gallery" },
      { label: "Клієнти", href: "/clients" },
      { label: "Блог", href: "/blog" },
      { label: "Контакти", href: "/contacts" },
    ],
  },
  {
    title: "Питання",
    links: [
      { label: "FAQ", href: "/blog/FAQ" },
      { label: "Returns", href: "/returns" },
      { label: "Shipping info", href: "/shipping" },
    ],
  },
  {
    title: "Інфо",
    links: [
      { label: "Політика конфіденційності", href: "/blog" },
      { label: "Терміни та умови", href: "/blog" },
      
    ],
  },
]

function FooterNavBlock({ title, links }: NavSection) {
  return (
    <nav className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ul className="space-y-2 text-sm">
        {links.map(({ label, href }: NavLink) => (
          <li key={href}>
            <a
              href={href}
              className="text-foreground hover:text-primary transition-colors"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-[oklch(.93_0_0)] bg-background mt-16 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12">
          <div className="flex-1 max-w-sm space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Відновлення</h3>

            <p className="text-sm text-muted-foreground">
              Покращуємо реабілітацію за допомогою інноваційного обладнання та сервісів.
            </p>

            <div className="flex items-center gap-3">
              {socialLinks.map(({ Icon, href, label }: SocialLink) => (
                <a
                  key={href}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-[#F7DDE2] flex items-center justify-center transition-colors group"
                >
                  <Icon className="w-4 h-4 text-foreground group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-10">
            {footerNav.map((section: NavSection) => (
              <FooterNavBlock key={section.title} {...section} />
            ))}
          </div>
        </div>

        <div className="mt-14 border-t border-[oklch(.93_0_0)] pt-10 grid gap-6 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-primary mt-1" />
            <div>
              <div className="text-sm font-semibold text-foreground">Телефон</div>
              <a
                href="tel:+18001234567"
                className="text-sm text-foreground hover:text-primary transition-colors"
              >
                +1 (800) 123-4567
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-primary mt-1" />
            <div>
              <div className="text-sm font-semibold text-foreground">Пошта</div>
              <a
                href="mailto:support@rehabcare.com"
                className="text-sm text-foreground hover:text-primary transition-colors"
              >
                support@rehabcare.com
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-primary mt-1" />
            <div>
              <div className="text-sm font-semibold text-foreground">Адреса</div>
              <p className="text-sm text-foreground">
                123 Wellness Ave, Health City, HC 12345
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-[oklch(.93_0_0)] pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} RehabCare. All rights reserved.
          </p>

          <div className="flex gap-4 text-xs">
            <a
              className="text-foreground hover:text-primary transition-colors"
              href="/do-not-sell"
            >
              Do Not Sell My Info
            </a>
            <a
              className="text-foreground hover:text-primary transition-colors"
              href="/cookie-settings"
            >
              Cookie Settings
            </a>
            <a
              className="text-foreground hover:text-primary transition-colors"
              href="/contact"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
