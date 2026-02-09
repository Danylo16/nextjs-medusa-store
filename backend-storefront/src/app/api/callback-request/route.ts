import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const Schema = z.object({
  phone: z.string().min(6).max(32),
  name: z.string().max(80).optional().or(z.literal("")),
  day: z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]),
  time_slot: z.enum(["09-12", "12-15", "15-18", "18-21"]),
  comment: z.string().max(500).optional().or(z.literal("")),
  consent: z.literal(true),

  // anti-spam meta
  hp: z.string().optional(),
  startedAt: z.number().int().optional(),
})

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  })
}

// dev rate limit (prod -> Redis/Upstash)
const hits = new Map<string, number[]>()
function rateLimit(key: string, limit = 6, windowMs = 10 * 60 * 1000) {
  const now = Date.now()
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs)
  arr.push(now)
  hits.set(key, arr)
  return arr.length <= limit
}

function getIp(req: NextRequest) {
  const xff = req.headers.get("x-forwarded-for")
  if (xff) return xff.split(",")[0].trim()
  return req.headers.get("x-real-ip") || "unknown"
}

function looksLikeHtml(input: string) {
  const t = input.trim().toLowerCase()
  return t.includes("<!doctype") || t.includes("<html") || t.includes("<script")
}

export async function POST(req: NextRequest) {
  const ct = req.headers.get("content-type") || ""
  if (!ct.includes("application/json")) {
    return json({ ok: false, message: "Expected JSON" }, 415)
  }

  const ip = getIp(req)
  if (!rateLimit(ip, 6, 10 * 60 * 1000)) {
    return json({ ok: false, message: "Too many requests" }, 429)
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return json({ ok: false, message: "Invalid JSON" }, 400)
  }

  const parsed = Schema.safeParse(raw)
  if (!parsed.success) {
    return json(
      { ok: false, message: "Validation failed", issues: parsed.error.issues },
      400
    )
  }

  const data = parsed.data

  // honeypot => bot: pretend success
  if (data.hp && data.hp.trim().length > 0) {
    return json({ ok: true })
  }

  // too fast submit => suspicious
  if (typeof data.startedAt === "number") {
    const elapsed = Date.now() - data.startedAt
    if (elapsed < 1200) {
      return json({ ok: false, message: "Suspicious submit" }, 400)
    }
  }

  const MEDUSA_BACKEND_URL =
    process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

  // Medusa requires this header (you already have it as NEXT_PUBLIC_...)
  const MEDUSA_PUBLISHABLE_KEY =
    process.env.MEDUSA_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

  // Real protection
  const CALLBACK_WEBHOOK_SECRET = process.env.CALLBACK_WEBHOOK_SECRET

  if (!MEDUSA_BACKEND_URL) {
    console.log("CALLBACK_REQUEST (no MEDUSA_BACKEND_URL)", { ...data, ip })
    return json({ ok: true })
  }

  if (!MEDUSA_PUBLISHABLE_KEY) {
    return json(
      { ok: false, message: "Server misconfigured (missing MEDUSA_PUBLISHABLE_KEY / NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY)" },
      500
    )
  }

  if (!CALLBACK_WEBHOOK_SECRET) {
    return json(
      { ok: false, message: "Server misconfigured (missing CALLBACK_WEBHOOK_SECRET)" },
      500
    )
  }

  const ac = new AbortController()
  const timeout = setTimeout(() => ac.abort(), 8000)

  try {
    const r = await fetch(`${MEDUSA_BACKEND_URL}/store/callback-request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",

        // required by Medusa
        "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY,

        // real protection (server-to-server)
        "x-callback-secret": CALLBACK_WEBHOOK_SECRET,
      },
      body: JSON.stringify({ ...data, ip }),
      signal: ac.signal,
    })

    const upstreamCt = r.headers.get("content-type") || ""
    const isJson = upstreamCt.includes("application/json")

    if (!r.ok) {
      if (isJson) {
        const err = (await r.json().catch(() => null)) as any
        return json({ ok: false, message: err?.message || "Upstream error" }, 502)
      }

      const text = await r.text().catch(() => "")
      return json(
        { ok: false, message: looksLikeHtml(text) ? "Upstream error" : (text || "Upstream error") },
        502
      )
    }

    if (!isJson) {
      const text = await r.text().catch(() => "")
      return json(
        { ok: false, message: looksLikeHtml(text) ? "Upstream returned HTML" : "Upstream returned non-JSON" },
        502
      )
    }

    return json({ ok: true })
  } catch (e: any) {
    const isAbort = e?.name === "AbortError"
    return json(
      { ok: false, message: isAbort ? "Upstream timeout" : "Upstream request failed" },
      502
    )
  } finally {
    clearTimeout(timeout)
  }
}

export async function GET() {
  return json({ ok: false, message: "Method not allowed" }, 405)
}
