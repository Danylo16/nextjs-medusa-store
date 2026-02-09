import type { CallbackRequestPayload, CallbackRequestResult } from "@/types/callback-request"
import { normalizePhone } from "@/lib/util/phone"

export async function createCallbackRequest(
  payload: CallbackRequestPayload & { startedAt?: number; hp?: string }
): Promise<CallbackRequestResult> {
  const body = {
    ...payload,
    phone: normalizePhone(payload.phone),
  }

  const res = await fetch("/api/callback-request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  })

  const ct = res.headers.get("content-type") || ""

  // If server returned HTML (404/500 page), don't show it to user
  if (!ct.includes("application/json")) {
    return {
      ok: false,
      message: "Сталася помилка сервера. Спробуйте ще раз трохи пізніше.",
    }
  }

  const data = (await res.json().catch(() => null)) as any

  if (!res.ok) {
    return { ok: false, message: data?.message || "Не вдалося відправити заявку." }
  }

  return { ok: true }
}
