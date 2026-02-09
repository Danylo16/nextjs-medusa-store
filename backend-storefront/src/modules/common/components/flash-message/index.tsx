"use client"

import React, { useEffect, useState } from "react"

type Flash = { type: "success" | "error"; text: string }

function readCookie(name: string) {
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))
  return m ? m[1] : null
}

function clearCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`
}

export default function FlashMessage() {
  const [flash, setFlash] = useState<Flash | null>(null)

  useEffect(() => {
    const raw = readCookie("flash")
    if (!raw) return

    clearCookie("flash")

    const decoded = (() => {
      try {
        return decodeURIComponent(raw)
      } catch {
        return raw
      }
    })()

    let parsed: Flash | null = null
    try {
      const j = JSON.parse(decoded)
      if (j?.text) parsed = { type: j.type === "error" ? "error" : "success", text: String(j.text) }
    } catch {
      // fallback: treat as plain string
      parsed = { type: "success", text: decoded }
    }

    if (!parsed?.text) return
    setFlash(parsed)

    const t = window.setTimeout(() => setFlash(null), 6500)
    return () => window.clearTimeout(t)
  }, [])

  if (!flash) return null

  const base =
    "fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-[420px] z-[9999] rounded-2xl border px-4 py-3 shadow-lg"

  const cls =
    flash.type === "success"
      ? `${base} border-primary/30 bg-primary-light/70`
      : `${base} border-accent/30 bg-accent-light/70`

  return (
    <div className={cls}>
      <div className="flex items-start justify-between gap-4">
        <div className="text-sm font-semibold leading-6">
          {flash.type === "success" ? "Готово" : "Помилка"}
        </div>
        <button
          type="button"
          className="text-sm text-foreground/60 hover:text-foreground"
          onClick={() => setFlash(null)}
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <div className="mt-1 text-sm text-foreground/80 leading-6">{flash.text}</div>
    </div>
  )
}
