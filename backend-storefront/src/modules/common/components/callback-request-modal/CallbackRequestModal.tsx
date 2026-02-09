"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { X, ChevronDown, Phone, Calendar, Clock } from "lucide-react"

import {
  WEEK_DAYS,
  TIME_SLOTS,
  type TimeSlotValue,
  type WeekDayValue,
} from "@/types/callback-request"
import { useCallbackRequest } from "@/lib/hooks/use-callback-request"
import { Button } from "@modules/common/UI/button"

type Props = {
  open: boolean
  onClose: () => void
}

const MIN_SUBMIT_MS = 1200
const MAX_ATTEMPTS_PER_OPEN = 3

function lockBodyScroll() {
  const body = document.body
  const prevOverflow = body.style.overflow
  const prevPaddingRight = body.style.paddingRight

  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
  body.style.overflow = "hidden"
  if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`

  return () => {
    body.style.overflow = prevOverflow
    body.style.paddingRight = prevPaddingRight
  }
}

function sanitizePhone(input: string) {
  let v = input.replace(/[^\d+]/g, "")
  v = v.replace(/(?!^)\+/g, "") // "+" only at start

  const digits = v.replace(/[^\d]/g, "")
  if (digits.length > 15) {
    const hasPlus = v.startsWith("+")
    v = (hasPlus ? "+" : "") + digits.slice(0, 15)
  }
  return v
}

function looksLikeHtmlError(s: string) {
  const t = s.trim().toLowerCase()
  if (!t) return false
  if (t.includes("<!doctype") || t.includes("<html") || t.includes("<script")) return true
  // Heuristic: lots of tags
  if (s.length > 300 && s.includes("<") && s.includes(">")) return true
  return false
}

/** Headless dropdown (no native system menu) */
function UiSelect<T extends string>({
  label,
  icon,
  value,
  options,
  onChange,
  required,
}: {
  label: string
  icon?: React.ReactNode
  value: T
  options: Array<{ value: T; label: string }>
  onChange: (v: T) => void
  required?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const currentLabel = useMemo(() => {
    return options.find((o) => o.value === value)?.label ?? ""
  }, [options, value])

  useEffect(() => {
    if (!open) return

    const onDown = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div className="space-y-2" ref={ref}>
      <label className="text-sm font-medium text-foreground">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((s) => !s)}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition
                     focus:border-[#4BAF8C]/40 focus:ring-4 focus:ring-[#4BAF8C]/15"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-left">
              {icon ? <span className="text-black/45">{icon}</span> : null}
              <span className="text-foreground">{currentLabel}</span>
            </div>
            <ChevronDown
              size={18}
              className={`text-black/40 transition ${open ? "rotate-180" : ""}`}
            />
          </div>
        </button>

        {open ? (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
            <div className="max-h-60 overflow-auto py-1">
              {options.map((o) => {
                const isActive = o.value === value
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => {
                      onChange(o.value)
                      setOpen(false)
                    }}
                    className={
                      "w-full px-4 py-2.5 text-left text-sm transition " +
                      (isActive
                        ? "bg-[#4BAF8C]/12 text-foreground"
                        : "hover:bg-black/[0.04] text-foreground")
                    }
                  >
                    {o.label}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default function CallbackRequestModal({ open, onClose }: Props) {
  const { payload, setPayload, status, error, canSubmit, submit, reset } =
    useCallbackRequest()

  const phoneRef = useRef<HTMLInputElement>(null)

  // Anti-bot: timestamp when modal opened
  const openedAtRef = useRef<number>(Date.now())

  // Anti-bot: honeypot input (should stay empty)
  const hpRef = useRef<HTMLInputElement>(null)

  // Anti-bot: attempts per open
  const attemptsRef = useRef<number>(0)

  // Local UX state: guard errors + fake success for bots
  const [guardError, setGuardError] = useState<string>("")
  const [fakeSuccess, setFakeSuccess] = useState(false)

  const displayError = useMemo(() => {
    const raw = (guardError || error || "").trim()
    if (!raw) return ""
    if (looksLikeHtmlError(raw)) {
      return "Сталася помилка сервера. Спробуйте ще раз трохи пізніше."
    }
    return raw
  }, [guardError, error])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const unlock = lockBodyScroll()

    // reset anti-bot/session state on open
    openedAtRef.current = Date.now()
    attemptsRef.current = 0
    setGuardError("")
    setFakeSuccess(false)

    // focus phone
    const t = window.setTimeout(() => phoneRef.current?.focus(), 40)

    return () => {
      window.clearTimeout(t)
      unlock()
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      reset()
      setGuardError("")
      setFakeSuccess(false)
    }
  }, [open, reset])

  if (!open) return null

  const isSuccess = fakeSuccess || status === "success"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-label="Закрити"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-[0_24px_90px_rgba(0,0,0,0.28)]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-black/10 px-6 py-5">
          <div className="space-y-1">
            <div className="text-xl font-semibold text-foreground">
              Отримати консультацію
            </div>
            <div className="text-sm text-muted-foreground">
              Лишіть номер — менеджер передзвонить у зручний час.
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-black/5"
            aria-label="Закрити"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[min(76vh,720px)] overflow-auto px-6 py-6">
          {isSuccess ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-[#4BAF8C]/10 p-4 text-sm text-foreground">
                ✔ Заявку отримали. Передзвонимо у вибраний день та час.
              </div>

              <Button
                size="lg"
                variant="primary"
                className="w-full sm:w-auto px-8"
                onClick={onClose}
              >
                Готово
              </Button>
            </div>
          ) : (
            <form
              className="space-y-6"
              onSubmit={async (e) => {
                e.preventDefault()
                setGuardError("")

                // Honeypot check (bots often fill hidden fields)
                const hp = (hpRef.current?.value || "").trim()
                if (hp.length > 0) {
                  setFakeSuccess(true)
                  return
                }

                // Too-fast submit check
                const elapsed = Date.now() - openedAtRef.current
                if (elapsed < MIN_SUBMIT_MS) {
                  setGuardError("Занадто швидко. Спробуйте ще раз через секунду.")
                  return
                }

                // Attempts limit per open
                attemptsRef.current += 1
                if (attemptsRef.current > MAX_ATTEMPTS_PER_OPEN) {
                  setGuardError("Забагато спроб. Зачекайте трохи і повторіть.")
                  return
                }

                await submit()
              }}
            >
              {/* Honeypot field (must stay empty) */}
              <div
                className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
                aria-hidden="true"
              >
                <label>
                  Do not fill
                  <input
                    ref={hpRef}
                    type="text"
                    name="hp"
                    tabIndex={-1}
                    autoComplete="off"
                    defaultValue=""
                  />
                </label>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Номер телефону <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <Phone
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40"
                    size={18}
                  />
                  <input
                    ref={phoneRef}
                    value={payload.phone}
                    onChange={(e) =>
                      setPayload((p) => ({
                        ...p,
                        phone: sanitizePhone(e.target.value),
                      }))
                    }
                    onPaste={(e) => {
                      e.preventDefault()
                      const text = e.clipboardData.getData("text")
                      setPayload((p) => ({ ...p, phone: sanitizePhone(text) }))
                    }}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+380 XX XXX XX XX"
                    className="w-full rounded-xl border border-black/10 bg-white pl-11 pr-4 py-3 text-sm outline-none transition
                               focus:border-[#4BAF8C]/40 focus:ring-4 focus:ring-[#4BAF8C]/15"
                    required
                  />
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Імʼя (необовʼязково)
                </label>
                <input
                  value={payload.name || ""}
                  onChange={(e) =>
                    setPayload((p) => ({ ...p, name: e.target.value }))
                  }
                  type="text"
                  autoComplete="name"
                  placeholder="Як до вас звертатись"
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition
                             focus:border-[#4BAF8C]/40 focus:ring-4 focus:ring-[#4BAF8C]/15"
                />
              </div>

              {/* Schedule */}
              <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 sm:p-5">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Clock size={16} className="text-black/50" />
                    Коли зручно передзвонити
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <UiSelect<WeekDayValue>
                      label="День"
                      required
                      icon={<Calendar size={18} />}
                      value={payload.day}
                      options={WEEK_DAYS}
                      onChange={(v) => setPayload((p) => ({ ...p, day: v }))}
                    />

                    <UiSelect<TimeSlotValue>
                      label="Часовий проміжок"
                      required
                      icon={<Clock size={18} />}
                      value={payload.time_slot}
                      options={TIME_SLOTS}
                      onChange={(v) =>
                        setPayload((p) => ({ ...p, time_slot: v }))
                      }
                    />
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Оберіть один слот — без “від/до”, без плутанини.
                  </div>
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Коментар (необовʼязково)
                </label>
                <textarea
                  value={payload.comment || ""}
                  onChange={(e) =>
                    setPayload((p) => ({ ...p, comment: e.target.value }))
                  }
                  rows={3}
                  placeholder="Напр: після операції на коліні, потрібен тренажер для дому…"
                  className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition
                             focus:border-[#4BAF8C]/40 focus:ring-4 focus:ring-[#4BAF8C]/15"
                />
              </div>

              {/* Consent */}
              <label className="flex items-start gap-3 rounded-xl border border-black/10 bg-black/[0.02] p-4 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={payload.consent}
                  onChange={(e) =>
                    setPayload((p) => ({ ...p, consent: e.target.checked }))
                  }
                  className="mt-1 h-4 w-4 accent-[#4BAF8C]"
                />
                <span>
                  Погоджуюсь на обробку персональних даних.{" "}
                  <a
                    className="underline underline-offset-2 text-[#4BAF8C]"
                    href="/contacts"
                  >
                    Політика конфіденційності
                  </a>
                </span>
              </label>

              {displayError ? (
                <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-700">
                  {displayError}
                </div>
              ) : null}

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-2">
                <Button
                  type="button"
                  size="lg"
                  variant="accentOutline"
                  className="px-8 text-base"
                  onClick={onClose}
                >
                  Скасувати
                </Button>

                <Button
                  type="submit"
                  size="lg"
                  variant="primary"
                  className="px-8 text-base disabled:opacity-50"
                  disabled={!canSubmit || status === "loading"}
                >
                  {status === "loading" ? "Надсилаємо..." : "Замовити дзвінок"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
