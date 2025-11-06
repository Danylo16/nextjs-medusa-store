 // src/subscribers/notify-on-order.ts
import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { sendTelegramMessage } from "../utils/telegram"
import { sendEmail } from "../utils/email"

export default async function onOrderPlaced(
  { event: { data }, container }: SubscriberArgs<{ id: string }>
) {
  const logger = container.resolve("logger")
  const query = container.resolve("query") as any

  logger.info(`notify-on-order → start for ${data.id}`)

  // 1) дістаємо повний ордер через Query Graph
  const { data: orders } = await query.graph({
    entity: "order",
    filters: { id: data.id },
    // поля: базові + зв’язки. *items підтягує позиції; через links дістанемо варіант/продукт/клієнта/адреси
    fields: [
      "id",
      "display_id",
      "created_at",
      "currency_code",
      "email",
      "summary.*",                // totals: total, subtotal, tax_total, etc.
      "items.*",
      "items.variant.*",
      "items.product.*",
      "shipping_address.*",
      "billing_address.*",
      "customer.*",
      "transactions.*",
      "promotion.*",
      "cart.*",
    ],
    // (за потреби) options: { cache: { enable: true } }
  })

  const order = orders?.[0]
  if (!order) {
    logger.warn(`notify-on-order → order not found ${data.id}`)
    return
  }

  // 2) Готуємо payloadи
  const phone =
    order?.shipping_address?.phone ||
    order?.billing_address?.phone ||
    order?.customer?.phone

  const itemsText = (order.items || [])
    .map((it: any, idx: number) => {
      const title = it?.product?.title || it?.variant?.title || it?.title || "Товар"
      const sku   = it?.variant?.sku ? ` (${it.variant.sku})` : ""
      const qty   = `x${it?.quantity ?? 1}`
      const unit  = it?.unit_price != null ? (it.unit_price / 100).toFixed(2) : "-"
      return `${idx + 1}. ${title}${sku} — ${qty} — €${unit}`
    })
    .join("<br/>")

  const totalEUR = (order?.summary?.total ?? 0) / 100

  const adminUrl = process.env.ADMIN_BASE_URL || ""
  const orderLink = adminUrl ? `${adminUrl}/a/orders/${order.id}` : ""

  const html = `
    <h3>Нове замовлення #${order.display_id}</h3>
    <p><b>ID:</b> ${order.id}<br/>
    <b>Створено:</b> ${new Date(order.created_at).toLocaleString()}<br/>
    <b>Email клієнта:</b> ${order.email}<br/>
    <b>Телефон:</b> ${phone || "-"}</p>

    <p><b>Адреса доставки:</b><br/>
    ${order.shipping_address?.first_name || ""} ${order.shipping_address?.last_name || ""}<br/>
    ${order.shipping_address?.address_1 || ""} ${order.shipping_address?.address_2 || ""}<br/>
    ${order.shipping_address?.postal_code || ""} ${order.shipping_address?.city || ""}<br/>
    ${order.shipping_address?.country_code?.toUpperCase() || ""}</p>

    <p><b>Товари:</b><br/>${itemsText || "—"}</p>
    <p><b>Валюта:</b> ${order.currency_code?.toUpperCase()}<br/>
    <b>Разом:</b> €${totalEUR.toFixed(2)}</p>

    ${orderLink ? `<p><a href="${orderLink}">Відкрити в адмінці</a></p>` : ""}
  `

  // 3) Відправка Email (Resend)
   
  await sendEmail({
    to: order.email, // або OWNER_EMAIL, якщо треба тільки собі
    subject: `Підтвердження замовлення #${order.display_id}`,
    html,
  })

  // 4) Відправка Telegram (адміну)
   
  const tgHtml =
    `🛒 <b>Нове замовлення</b>\n` +
    `ID: <code>${order.id}</code>\n` +
    `№: <b>${order.display_id}</b>\n` +
    `Клієнт: <code>${order.email}</code>\n` +
    `Телефон: <code>${phone || "-"}</code>\n` +
    `Сума: <b>€${totalEUR.toFixed(2)}</b>` +
    (orderLink ? `\n<a href="${orderLink}">Адмінка</a>` : "")
  await sendTelegramMessage(tgHtml)

  logger.info(`notify-on-order → done for ${data.id}`)
}

export const config: SubscriberConfig = {
  event: "order.placed", // офіційна назва івенту у v2
}
