import { GallerySection } from "@modules/home/components/gallery/gallery-section"

export const metadata = {
  title: "Галерея | MTB1-4",
  description: "Галерея наших робіт: реалізовані проєкти та приклади обладнання.",
}

export default function GalleryPage() {
  return (
    <main className="min-h-dvh">
      <GallerySection />
    </main>
  )
}
