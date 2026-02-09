"use client"

import React from "react"
import { useFormState, useFormStatus } from "react-dom"
import { useParams } from "next/navigation"
import { submitCallbackOrder } from "@lib/data/cart"

type LeadState = {
  status: "idle" | "success" | "error"
  message: string
}

const initialState: LeadState = {
  status: "idle",
  message: "",
}

function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-4 w-full inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-dark transition-colors disabled:opacity-40"
    >
      {pending ? "Надсилаємо..." : "Залишити замовлення"}
    </button>
  )
}

export default function CartLeadForm() {
  const params = useParams() as { countryCode?: string }
  const countryCode = (params?.countryCode || "ua").toLowerCase()

  const [state, action] = useFormState(submitCallbackOrder as any, initialState)

  return (
    <div className="mt-5">
      <h4 className="text-base font-semibold">Оформлення без оплати на сайті</h4>
      <p className="mt-1 text-xs text-foreground/60 leading-5">
        Залиште контакт — менеджер зв&apos;яжеться найближчим часом, підтвердить наявність і доставку.
      </p>

      <form action={action} className="mt-3 space-y-2">
        <input type="hidden" name="country_code" value={countryCode} />

        <input
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />

        <div className="grid grid-cols-1 gap-2">
          <input
            name="name"
            placeholder="Ім'я (необов'язково)"
            className="h-11 w-full rounded-xl border border-muted bg-card px-3 text-sm outline-none focus:border-primary"
            autoComplete="name"
          />
          <input
            name="phone"
            placeholder="Телефон *"
            required
            className="h-11 w-full rounded-xl border border-muted bg-card px-3 text-sm outline-none focus:border-primary"
            autoComplete="tel"
          />
          <textarea
            name="comment"
            placeholder="Коментар (опційно)"
            className="min-h-[88px] w-full rounded-xl border border-muted bg-card px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        {state.status === "error" ? (
          <div className="rounded-xl border border-accent/30 bg-accent-light/40 p-3 text-sm">
            {state.message}
          </div>
        ) : null}

        <SubmitBtn />
      </form>
    </div>
  )
}
