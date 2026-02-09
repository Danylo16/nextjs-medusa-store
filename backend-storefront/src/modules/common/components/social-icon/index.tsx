import { BrandIcon } from "@modules/common/icons/brand-icons"
import type { SocialIconKey } from "@/lib/data/contacts-config"

export function SocialIcon({
  icon,
  className = "h-4 w-4 shrink-0",
}: {
  icon: SocialIconKey
  className?: string
}) {
  switch (icon) {
    case "instagram":
      return <BrandIcon name="instagram" className={className} title="Instagram" />
    case "facebook":
      return <BrandIcon name="facebook" className={className} title="Facebook" />
    case "youtube":
      return <BrandIcon name="youtube" className={className} title="YouTube" />
    case "tiktok":
      return <BrandIcon name="tiktok" className={className} title="TikTok" />
    case "telegram":
      return <BrandIcon name="telegram" className={className} title="Telegram" />
    case "linkedin":
      return <BrandIcon name="linkedin" className={className} title="LinkedIn" />
    default:
      return null
  }
}
