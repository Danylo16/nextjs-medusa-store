import { Phone } from "lucide-react"
import { BrandIcon } from "@modules/common/icons/brand-icons"
import type { ChannelType } from "@/lib/data/contacts-config"

export function ChannelIcon({
  type,
  className = "h-4 w-4 shrink-0",
}: {
  type: ChannelType
  className?: string
}) {
  switch (type) {
    case "tel":
      return <Phone className={className} />

    case "telegram":
      return <BrandIcon name="telegram" className={className} title="Telegram" />

    case "viber":
      return <BrandIcon name="viber" className={className} title="Viber" />

    case "whatsapp":
      return <BrandIcon name="whatsapp" className={className} title="WhatsApp" />

    default:
      return null
  }
}
