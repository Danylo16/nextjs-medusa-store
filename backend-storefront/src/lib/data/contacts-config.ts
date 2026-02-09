export type ChannelType =
  | "tel"
  | "telegram"
  | "viber"
  | "whatsapp"
  | "signal"
  | "messenger"

export type SocialIconKey =
  | "instagram"
  | "facebook"
  | "youtube"
  | "tiktok"
  | "telegram"
  | "linkedin"
  | "twitter"

export interface Channel {
  type: ChannelType
  label: string
  href: string
}

export interface PhoneEntry {
  label: string
  value: string
  channels: Channel[]
}

export interface EmailEntry {
  label: string
  value: string
}

export interface SocialEntry {
  key: string
  label: string
  href: string
  icon: SocialIconKey
}

export interface ContactsConfig {
  phones: PhoneEntry[]
  emails: EmailEntry[]
  socials: SocialEntry[]
  workingHours: { label: string; value: string }[]
  address: string
  companyName: string
  companyDescription: string
}

export const CONTACTS: ContactsConfig = {
  companyName: "RehabCare",
  companyDescription:
    "Професійне обладнання для реабілітації та фізичної терапії. Працюємо з палеоліту.",
  address: "м. Чернігів, вул. Вірастюка 22, офіс 15",

  phones: [
    {
      label: "Відділ продажу",
      value: "+380 44 123 45 67",
      channels: [
        { type: "tel", label: "Зателефонувати", href: "tel:+380441234567" },
        { type: "telegram", label: "Telegram", href: "https://t.me/rehabcare_sales" },
        { type: "viber", label: "Viber", href: "viber://chat?number=%2B380441234567" },
        { type: "whatsapp", label: "WhatsApp", href: "https://wa.me/380441234567" },
      ],
    },
    {
      label: "Технічна підтримка",
      value: "+380 67 987 65 43",
      channels: [
        { type: "tel", label: "Зателефонувати", href: "tel:+380679876543" },
        { type: "telegram", label: "Telegram", href: "https://t.me/rehabcare_support" },
        { type: "viber", label: "Viber", href: "viber://chat?number=%2B380679876543" },
      ],
    },
    {
      label: "Консультація з обладнання",
      value: "+380 50 111 22 33",
      channels: [
        { type: "tel", label: "Зателефонувати", href: "tel:+380501112233" },
        { type: "whatsapp", label: "WhatsApp", href: "https://wa.me/380501112233" },
        { type: "telegram", label: "Telegram", href: "https://t.me/rehabcare_consult" },
      ],
    },
  ],

  emails: [
    { label: "Загальні питання", value: "info@rehabcare.com.ua" },
    { label: "Замовлення та оплата", value: "orders@rehabcare.com.ua" },
    { label: "Сервіс та гарантія", value: "service@rehabcare.com.ua" },
  ],

  workingHours: [
    { label: "Пн — Пт", value: "09:00 — 18:00" },
    { label: "Сб", value: "10:00 — 15:00" },
    { label: "Нд", value: "Вихідний" },
  ],

  socials: [
    { key: "instagram", label: "Instagram", href: "https://instagram.com/rehabcare_ua", icon: "instagram" },
    { key: "facebook", label: "Facebook", href: "https://facebook.com/rehabcare.ua", icon: "facebook" },
    { key: "youtube", label: "YouTube", href: "https://youtube.com/@rehabcare_ua", icon: "youtube" },
    { key: "tiktok", label: "TikTok", href: "https://tiktok.com/@rehabcare_ua", icon: "tiktok" },
    { key: "telegram-channel", label: "Telegram", href: "https://t.me/rehabcare_channel", icon: "telegram" },
    { key: "linkedin", label: "LinkedIn", href: "https://linkedin.com/company/rehabcare-ua", icon: "linkedin" },
  ],
}
