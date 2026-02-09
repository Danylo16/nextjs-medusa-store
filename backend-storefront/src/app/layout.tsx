import { getBaseURL } from "@lib/util/env"
import type { Metadata } from "next"
import "styles/globals.css"
import FlashMessage from "@modules/common/components/flash-message"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body className="min-h-dvh">
        {/* Root must NOT wrap everything in <main>. <main> belongs to per-section layouts. */}
        {props.children}

        {/* Render once globally to avoid duplicate toasts */}
        <FlashMessage />
      </body>
    </html>
  )
}
