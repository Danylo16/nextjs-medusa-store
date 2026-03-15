// src/utils/email.ts
import { Resend } from "resend"

let resend: Resend | null = null

function getResendClient() {
  if (resend) {
    return resend
  }

  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    return null
  }

  resend = new Resend(apiKey)
  return resend
}

export type OrderEmailPayload = {
  to: string
  from?: string
  subject: string
  html: string
}

export async function sendEmail(payload: OrderEmailPayload) {
  const client = getResendClient()

  if (!client) {
    console.warn("RESEND_API_KEY is not configured. Email sending is skipped.")
    return
  }

  const from =
    payload.from || process.env.NOTIFICATION_FROM || "no-reply@example.com"

  await client.emails.send({
    from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  })
}