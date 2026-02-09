import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const raw = (req.query.sku ?? req.query.q ?? "").toString().trim()

  if (!raw) {
    return res.json({ handles: [], count: 0 })
  }

  // нормалізація: пробіли -> дефіс
  const sku = raw.replace(/\s+/g, "-")

  // limit: число, дефолт 24, максимум 50
  const limitRaw = Number(req.query.limit ?? 24)
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 24

  const query = req.scope.resolve("query")

  // Шукаємо variants по sku (ПРЕФІКС): "Mtb-" -> "Mtb-%"
  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "sku", "product.id", "product.handle"],
    filters: {
      sku: { $ilike: `${sku}%` }, 
    },
    pagination: { take: limit, skip: 0 },
  })

  // Унікальні product handles
  const handles = Array.from(
    new Set(
      (variants ?? [])
        .map((v: any) => v?.product?.handle)
        .filter((h: any) => typeof h === "string" && h.length > 0)
    )
  )

  return res.json({ handles, count: handles.length })
}
