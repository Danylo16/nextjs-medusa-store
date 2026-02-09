import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { sendTelegramMessage } from "../utils/telegram"
import { sendEmail } from "../utils/email"

function money(amountMinor: number, currency: string) {
  const c = (currency || "UAH").toUpperCase()
  return new Intl.NumberFormat("uk-UA", { style: "currency", currency: c }).format(
    (amountMinor || 0) / 100
  )
}

function safe(s: any) {
  return String(s ?? "").trim()
}

/**
 * Telegram uses parse_mode=HTML in your util.
 * If you don't escape user-provided text, Telegram can break the message
 * or interpret it as tags/entities.
 */
function escapeTgHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function stripCommentPrefix(s: string) {
  return s.replace(/^Коментар:\s*/i, "").trim()
}

export default async function onOrderPlaced(
  { event: { data }, container }: SubscriberArgs<{ id: string }>
) {
  const logger = container.resolve("logger")
  const query = container.resolve("query") as any

  logger.info(`notify-on-order → start for ${data.id}`)

  const { data: orders } = await query.graph({
    entity: "order",
    filters: { id: data.id },
    fields: [
      "id",
      "display_id",
      "created_at",
      "currency_code",
      "email",
      "summary.*",
      "items.*",
      "items.product.*",
      "items.variant.*",
      "shipping_address.*",
      "billing_address.*",
      "customer.*",
      "cart.*",
      "cart.metadata",
    ],
  })

  const order = orders?.[0]
  if (!order) {
    logger.warn(`notify-on-order → order not found ${data.id}`)
    return
  }

  const currency = (order.currency_code || "UAH").toUpperCase()

  // Lead fields (metadata -> address/customer fallbacks)
  const leadPhone =
    safe(order?.cart?.metadata?.lead_phone) ||
    safe(order?.shipping_address?.phone) ||
    safe(order?.billing_address?.phone) ||
    safe(order?.customer?.phone) ||
    "-"

  const leadName =
    safe(order?.cart?.metadata?.lead_name) ||
    safe(order?.shipping_address?.first_name) ||
    "-"

  // IMPORTANT: comment fallback to address_2 where you store it as "Коментар: ..."
  const leadComment =
    safe(order?.cart?.metadata?.lead_comment) ||
    stripCommentPrefix(safe(order?.shipping_address?.address_2)) ||
    stripCommentPrefix(safe(order?.billing_address?.address_2)) ||
    "-"

  // Items
  const items = Array.isArray(order.items) ? order.items : []

  const itemsMinor = items.reduce((sum: number, it: any) => {
    const unit = Number(it?.unit_price ?? 0)
    const qty = Number(it?.quantity ?? 0)
    return sum + unit * qty
  }, 0)

  const summaryTotalMinor = Number(order?.summary?.total ?? 0)
  const totalMinor = summaryTotalMinor > 0 ? summaryTotalMinor : itemsMinor

  const lines = items.map((it: any, idx: number) => {
    const title = safe(it?.product?.title) || safe(it?.title) || "Товар"
    const sku = it?.variant?.sku ? ` (${it.variant.sku})` : ""
    const qty = Number(it?.quantity ?? 1)
    const unitMinor = Number(it?.unit_price ?? 0)
    const lineMinor = unitMinor * qty

    return {
      html: `${idx + 1}. ${title}${sku} — x${qty} — ${money(unitMinor, currency)} (рядок: ${money(
        lineMinor,
        currency
      )})`,
      tg: `${idx + 1}) ${title}${sku} ×${qty} — ${money(lineMinor, currency)}`,
    }
  })

  // Admin link
  const adminUrl = process.env.ADMIN_BASE_URL || ""
  const orderLink = adminUrl ? `${adminUrl}/a/orders/${order.id}` : ""

  // EMAIL to owner
  const owner = process.env.OWNER_EMAIL
  if (owner) {
    const html = `
      <h3>Нова заявка (order) #${order.display_id}</h3>
      <p>
        <b>ID:</b> ${order.id}<br/>
        <b>Створено:</b> ${new Date(order.created_at).toLocaleString()}<br/>
        <b>Ім'я:</b> ${leadName}<br/>
        <b>Телефон:</b> ${leadPhone}<br/>
        <b>Коментар:</b> ${leadComment}<br/>
        <b>Email (технічний):</b> ${safe(order.email) || "-"}
      </p>

      <p><b>Товари:</b><br/>${lines.map((l) => l.html).join("<br/>") || "—"}</p>

      <p><b>Разом:</b> ${money(totalMinor, currency)}</p>

      ${orderLink ? `<p><a href="${orderLink}">Відкрити в адмінці</a></p>` : ""}
    `

    await sendEmail({
      to: owner,
      subject: `Нова заявка (order) #${order.display_id}`,
      html,
    })
  }

  // TELEGRAM
  const tgItems = lines.slice(0, 5).map((l) => l.tg).join("\n")
  const more = lines.length > 5 ? `\n…ще ${lines.length - 5} позицій` : ""

  // Escape user-provided values for Telegram HTML mode
  const tgPhone = escapeTgHtml(leadPhone)
  const tgName = escapeTgHtml(leadName)
  const tgComment = escapeTgHtml(leadComment)

  const tgHtml =
    `📞 <b>Нова заявка</b>\n` +
    `№: <b>${escapeTgHtml(String(order.display_id ?? ""))}</b>\n` +
    `Телефон: <code>${tgPhone}</code>\n` +
    `Ім'я: <code>${tgName}</code>\n` +
    `Коментар: <code>${tgComment}</code>\n` +
    `Товари:\n<code>${escapeTgHtml(tgItems)}${escapeTgHtml(more)}</code>\n` +
    `Разом: <b>${escapeTgHtml(money(totalMinor, currency))}</b>` +
    (orderLink ? `\n<a href="${orderLink}">Адмінка</a>` : "")

  await sendTelegramMessage(tgHtml)

  logger.info(`notify-on-order → done for ${data.id}`)
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
