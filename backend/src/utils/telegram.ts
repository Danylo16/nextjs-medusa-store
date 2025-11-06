 // src/utils/telegram.ts
export async function sendTelegramMessage(html: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN!
  const chatId = process.env.TELEGRAM_CHAT_ID!
  const url = `https://api.telegram.org/bot${token}/sendMessage`

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: html,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  })
}
