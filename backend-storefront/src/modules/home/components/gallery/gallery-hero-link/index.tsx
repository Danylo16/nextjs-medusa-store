import Image from "next/image"
import { ArrowRight } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Props = {
  href?: string
  title?: string
  subtitle?: string
}

export default function GalleryHeroImage({
  href = "/gallery",
  title = "Галерея робіт",
  subtitle = "Реальні кейси, інсталяції та рішення під ключ",
}: Props) {
  return (
    <section className="section">
      <div className="content-container">
        <LocalizedClientLink
          href={href}
          aria-label="Перейти до галереї робіт"
          className={[
            "group relative block overflow-hidden rounded-2xl bg-card",
            "shadow-medium ring-1 ring-black/5",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          ].join(" ")}
        >
          {/* Image */}
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9]">
            <Image
              src="/images/projects/gallery-hero.png"
              alt="Галерея реалізованих проєктів реабілітаційних та спортивних центрів"
              fill
              sizes="(max-width: 768px) 100vw, 1440px"
              className={[
                "object-cover",
                "transition-all duration-500 ease-out",
                "group-hover:scale-[1.012] group-hover:saturate-[1.05] group-hover:brightness-[0.98]",
              ].join(" ")}
            />

            {/* Base gradient for readability (works on mobile too) */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/55 via-black/15 to-transparent" />

            {/* Hover polish overlay */}
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-black/10" />

            {/* Text */}
            <div className="absolute inset-y-0 left-0 flex items-end p-4 md:p-8">
              <div className="max-w-[560px]">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground">
                  {title}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </div>

                <p className="mt-3 text-white/90 text-sm md:text-base">
                  {subtitle}
                </p>
              </div>
            </div>
          </div>
        </LocalizedClientLink>
      </div>
    </section>
  )
}
