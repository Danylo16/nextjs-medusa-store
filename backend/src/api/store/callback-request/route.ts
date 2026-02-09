import { z } from "zod"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { escapeTelegramHtml, sendTelegramMessage } from "../../../utils/telegram"

const Schema = z.object({
  phone: z.string().min(6).max(32),
  name: z.string().max(80).optional().or(z.literal("")),
  day: z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]),
  time_slot: z.enum(["09-12", "12-15", "15-18", "18-21"]),
  comment: z.string().max(500).optional().or(z.literal("")),
  consent: z.literal(true),
  ip: z.string().optional(),
})

const DAY_UA: Record<string, string> = {
  mon: "Понеділок",
  tue: "Вівторок",
  wed: "Середа",
  thu: "Четвер",
  fri: "П’ятниця",
  sat: "Субота",
  sun: "Неділя",
}

const SLOT_UA: Record<string, string> = {
  "09-12": "09:00–12:00",
  "12-15": "12:00–15:00",
  "15-18": "15:00–18:00",
  "18-21": "18:00–21:00",
}

function getHeader(req: MedusaRequest, key: string) {
  const v = req.headers[key.toLowerCase()]
  return Array.isArray(v) ? v[0] : v
}

// dev rate limit (prod -> Redis)
const hits = new Map<string, number[]>()
function rateLimit(key: string, limit = 12, windowMs = 10 * 60 * 1000) {
  const now = Date.now()
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs)
  arr.push(now)
  hits.set(key, arr)
  return arr.length <= limit
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  // Secret check (real security)
  const secret = process.env.CALLBACK_WEBHOOK_SECRET
  const got = String(getHeader(req, "x-callback-secret") || "")

  if (!secret || got !== secret) {
    return res.status(401).json({ ok: false, message: "Unauthorized" })
  }

  const parsed = Schema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ ok: false, message: "Validation failed" })
  }

  const data = parsed.data

  const key = data.ip || "unknown"
  if (!rateLimit(key)) {
    return res.status(429).json({ ok: false, message: "Too many requests" })
  }

  const phone = escapeTelegramHtml(data.phone)
  const name = escapeTelegramHtml((data.name || "").trim())
  const comment = escapeTelegramHtml((data.comment || "").trim())
  const when = escapeTelegramHtml(`${DAY_UA[data.day]} • ${SLOT_UA[data.time_slot]}`)
  const ip = escapeTelegramHtml(data.ip || "")

  const msg =
    `📞 <b>Нова заявка на консультацію</b>\n\n` +
    `<b>Телефон:</b> ${phone}\n` +
    (name ? `<b>Ім'я:</b> ${name}\n` : "") +
    `<b>Коли:</b> ${when}\n` +
    (comment ? `<b>Коментар:</b> ${comment}\n` : "") +
    (ip ? `<b>IP:</b> ${ip}\n` : "")

  await sendTelegramMessage(msg)

  return res.json({ ok: true })
}
