// import { useState } from "react"
// import { useMutation, useQueryClient } from "@tanstack/react-query"
// import { defineWidgetConfig } from "@medusajs/admin-sdk"
// import { Container, Heading, Text } from "@medusajs/ui"
// import { sdk } from "../lib/sdk"

// // Немає DetailWidgetProps → використовуємо any
// const ProductWidget = ({ data }: any) => {
//   const product = data
//   const queryClient = useQueryClient()

//   const initialJson = JSON.stringify(
//     product?.metadata?.content_blocks ?? [],
//     null,
//     2
//   )

//   const [value, setValue] = useState(initialJson)
//   const [error, setError] = useState<string | null>(null)
//   const [saving, setSaving] = useState(false)

//   const { mutate } = useMutation({
//     mutationFn: async () => {
//       setError(null)

//       let parsed: unknown

//       try {
//         parsed = JSON.parse(value)
//         if (!Array.isArray(parsed)) {
//           throw new Error("JSON має бути масивом блоків []")
//         }
//       } catch (e: any) {
//         throw new Error(e?.message || "JSON не валідний")
//       }

//       setSaving(true)

//       await sdk.admin.product.update(product.id, {
//         metadata: {
//           ...(product.metadata || {}),
//           content_blocks: parsed,
//         },
//       })
//     },
//     onSuccess: () => {
//       setSaving(false)
//       queryClient.invalidateQueries({
//         queryKey: [["product", product.id]],
//       })
//     },
//     onError: (e: any) => {
//       setSaving(false)
//       setError(e?.message || "Помилка збереження")
//     },
//   })

//   return (
//     <Container className="divide-y p-0">
//       <div className="flex items-center justify-between px-6 py-4">
//         <Heading level="h2">
//           Структурований опис (metadata.content_blocks)
//         </Heading>
//       </div>

//       <div className="px-6 py-4 flex flex-col gap-y-2">
//         <Text size="small" leading="compact" className="text-ui-fg-subtle">
//           Тут ти редагуєш JSON-масив блоків опису. На фронті він рендериться по
//           полю <code>type</code> (h1, h2, paragraph, list, table тощо).
//         </Text>

//         <textarea
//           rows={18}
//           className="w-full border border-ui-border-subtle rounded-md text-xs font-mono p-2"
//           value={value}
//           onChange={(e) => setValue(e.target.value)}
//         />

//         {error && (
//           <Text size="small" className="text-ui-fg-error">
//             {error}
//           </Text>
//         )}

//         <button
//           type="button"
//           className="mt-2 inline-flex items-center rounded-md border border-ui-border-strong px-3 py-1 text-xs font-medium hover:bg-ui-bg-subtle disabled:opacity-50"
//           disabled={saving}
//           onClick={() => mutate()}
//         >
//           {saving ? "Збереження..." : "Зберегти JSON"}
//         </button>
//       </div>
//     </Container>
//   )
// }

// export const config = defineWidgetConfig({
//   zone: "product.details.after",
// })

// export default ProductWidget

import { useState } from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text } from "@medusajs/ui"
import { sdk } from "../lib/sdk"

// тут без DetailWidgetProps, бо їх тупо немає в admin-sdk типах
type ProductWidgetProps = {
  data: any // AdminProduct, але не морочимось
}

const ProductWidget = ({ data }: ProductWidgetProps) => {
  const product = data

  const [value, setValue] = useState(
    JSON.stringify(product?.metadata?.content_blocks ?? [], null, 2)
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSave = async () => {
    setError(null)
    setSuccess(null)

    let parsed: unknown

    try {
      parsed = JSON.parse(value)
      if (!Array.isArray(parsed)) {
        throw new Error("JSON має бути масивом блоків []")
      }
    } catch (e: any) {
      setError(e?.message || "JSON не валідний")
      return
    }

    try {
      setSaving(true)

      // КЛЮЧОВЕ МІСЦЕ: оновлюємо metadata продукту
      await sdk.admin.product.update(product.id, {
        metadata: {
          ...(product.metadata || {}),
          content_blocks: parsed,
        },
      })

      setSuccess("Збережено")
    } catch (e: any) {
      console.error("Update error", e)
      setError(e?.message || "Помилка збереження на сервері")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">
          Структурований опис (metadata.content_blocks)
        </Heading>
      </div>

      <div className="px-6 py-4 flex flex-col gap-y-2">
        <Text size="small" leading="compact" className="text-ui-fg-subtle">
          Тут ти редагуєш JSON-масив блоків опису. На фронті він рендериться по
          полю <code>type</code> (h1, h2, paragraph, list, table, video_links тощо).
        </Text>
        <Text size="small" leading="compact" className="text-ui-fg-subtle">
          Product ID: {product.id}
        </Text>
        <Text size="small" leading="compact" className="text-ui-fg-subtle mb-2">
          Handle: {product.handle}
        </Text>
        <textarea
          rows={20}
          className="w-full border border-ui-border-subtle rounded-md text-xs font-mono p-2"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        {error && (
          <Text size="small" className="text-ui-fg-error">
            {error}
          </Text>
        )}

        {success && (
          <Text size="small" className="text-ui-fg-success">
            {success}
          </Text>
        )}

        <button
          type="button"
          className="mt-2 inline-flex items-center rounded-md border border-ui-border-strong px-3 py-1 text-xs font-medium hover:bg-ui-bg-subtle disabled:opacity-50"
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? "Збереження..." : "Зберегти JSON"}
        </button>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductWidget
