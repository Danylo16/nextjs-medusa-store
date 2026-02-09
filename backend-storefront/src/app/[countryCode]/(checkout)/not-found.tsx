import type { Metadata } from "next"
import NotFoundView from "@modules/common/components/not-found-view"

export const metadata: Metadata = {
  title: "404 — Сторінку не знайдено",
  description:
    "Цей крок оформлення не існує або був переміщений.",
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return <NotFoundView variant="checkout" />
}
