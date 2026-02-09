import type { Metadata } from "next"
import NotFoundView from "@modules/common/components/not-found-view"

export const metadata: Metadata = {
  title: "404 — Сторінку не знайдено",
  description:
    "Сторінка, яку ви шукаєте, не існує або була переміщена.",
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return <NotFoundView variant="main" />
}
