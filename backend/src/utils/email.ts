// src/utils/email.ts
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)

export type OrderEmailPayload = {
  to: string
  from?: string
  subject: string
  html: string
}

export async function sendEmail(payload: OrderEmailPayload) {
  const from = payload.from || process.env.NOTIFICATION_FROM || "no-reply@example.com"
  await resend.emails.send({
    from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  })
}
