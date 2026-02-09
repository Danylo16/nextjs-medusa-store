"use client"

import { useCallback, useMemo, useState } from "react"
import type { CallbackRequestPayload, CallbackRequestResult } from "@/types/callback-request"
import { isPhoneValid } from "@/lib/util/phone"
import { createCallbackRequest } from "@/lib/data/callback-request"

type Status = "idle" | "loading" | "success" | "error"

const DEFAULT_PAYLOAD: CallbackRequestPayload = {
  phone: "",
  name: "",
  day: "mon",
  time_slot: "09-12",
  comment: "",
  consent: false,
}

export function useCallbackRequest() {
  const [payload, setPayload] = useState<CallbackRequestPayload>(DEFAULT_PAYLOAD)
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string>("")

  const canSubmit = useMemo(() => {
    if (!isPhoneValid(payload.phone)) return false
    if (!payload.consent) return false
    if (!payload.day) return false
    if (!payload.time_slot) return false
    return true
  }, [payload])

  const reset = useCallback(() => {
    setPayload(DEFAULT_PAYLOAD)
    setStatus("idle")
    setError("")
  }, [])

  const submit = useCallback(async (): Promise<CallbackRequestResult> => {
    setError("")

    if (!isPhoneValid(payload.phone)) {
      setStatus("error")
      setError("Вкажіть коректний номер телефону.")
      return { ok: false, message: "invalid_phone" }
    }

    if (!payload.consent) {
      setStatus("error")
      setError("Потрібна згода на обробку персональних даних.")
      return { ok: false, message: "no_consent" }
    }

    setStatus("loading")
    const result = await createCallbackRequest(payload)

    if (result.ok) {
      setStatus("success")
      return result
    }

    setStatus("error")
    setError(result.message)
    return result
  }, [payload])

  return { payload, setPayload, status, error, canSubmit, submit, reset }
}
