import { useMemo, useState } from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Input, Label, Text, Textarea } from "@medusajs/ui"
import { z } from "zod"
import { sdk } from "../lib/sdk"

type ProductWidgetProps = {
  data: any
}

type VideoLink = {
  url: string
  label: string
}

type RichBlock =
  | { type: "heading"; level: 2 | 3 | 4; text: string }
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }

type SidebarItem =
  | { type: "text"; text: string; variant?: "muted" | "normal" }
  | { type: "section"; title?: string; blocks: RichBlock[] }
  | { type: "video_links"; items: VideoLink[] }
  | { type: "note"; text: string; variant?: "info" | "warning" }
  | { type: "emphasis"; text: string }

type BottomItem =
  | { type: "section"; title: string; blocks: RichBlock[] }
  | { type: "specs"; title?: string; rows: [string, string][] }
  | { type: "video_links"; items: VideoLink[] }
  | { type: "note"; text: string; variant?: "info" | "warning" }

type ProductContentV2 = {
  version: 2
  sidebar: SidebarItem[]
  bottom: BottomItem[]
}

const headingLevelSchema = z.union([
  z.literal(2),
  z.literal(3),
  z.literal(4),
])

const videoLinkSchema = z.object({
  url: z.string(),
  label: z.string(),
})

const richHeadingBlockSchema = z.object({
  type: z.literal("heading"),
  level: headingLevelSchema,
  text: z.string(),
})

const richParagraphBlockSchema = z.object({
  type: z.literal("p"),
  text: z.string(),
})

const richListBlockSchema = z.object({
  type: z.literal("list"),
  items: z.array(z.string()),
})

const richBlockSchema = z.union([
  richHeadingBlockSchema,
  richParagraphBlockSchema,
  richListBlockSchema,
])

const sidebarTextBlockSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
  variant: z.enum(["muted", "normal"]).optional(),
})

const sidebarSectionBlockSchema = z.object({
  type: z.literal("section"),
  title: z.string().optional(),
  blocks: z.array(richBlockSchema),
})

const sidebarVideoLinksBlockSchema = z.object({
  type: z.literal("video_links"),
  items: z.array(videoLinkSchema),
})

const sidebarNoteBlockSchema = z.object({
  type: z.literal("note"),
  text: z.string(),
  variant: z.enum(["info", "warning"]).optional(),
})

const sidebarEmphasisBlockSchema = z.object({
  type: z.literal("emphasis"),
  text: z.string(),
})

const bottomSectionBlockSchema = z.object({
  type: z.literal("section"),
  title: z.string(),
  blocks: z.array(richBlockSchema),
})

const bottomSpecsBlockSchema = z.object({
  type: z.literal("specs"),
  title: z.string().optional(),
  rows: z.array(z.tuple([z.string(), z.string()])),
})

const bottomVideoLinksBlockSchema = z.object({
  type: z.literal("video_links"),
  items: z.array(videoLinkSchema),
})

const bottomNoteBlockSchema = z.object({
  type: z.literal("note"),
  text: z.string(),
  variant: z.enum(["info", "warning"]).optional(),
})

const sidebarItemSchema = z.union([
  sidebarTextBlockSchema,
  sidebarSectionBlockSchema,
  sidebarVideoLinksBlockSchema,
  sidebarNoteBlockSchema,
  sidebarEmphasisBlockSchema,
])

const bottomItemSchema = z.union([
  bottomSectionBlockSchema,
  bottomSpecsBlockSchema,
  bottomVideoLinksBlockSchema,
  bottomNoteBlockSchema,
])

const productContentV2Schema = z.object({
  version: z.literal(2),
  sidebar: z.array(sidebarItemSchema),
  bottom: z.array(bottomItemSchema),
})

const productContentArraySchema = z.array(productContentV2Schema)

function getEmptyContentRoot(): ProductContentV2 {
  return {
    version: 2,
    sidebar: [],
    bottom: [],
  }
}

function readEditorContent(raw: unknown): ProductContentV2 {
  const parsed = productContentArraySchema.safeParse(raw)

  if (!parsed.success) {
    return getEmptyContentRoot()
  }

  return parsed.data[0] || getEmptyContentRoot()
}

function serializeEditorContent(content: ProductContentV2) {
  return [content]
}

function safePrettyJson(value: unknown) {
  return JSON.stringify(value, null, 2)
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

function moveArrayItem<T>(items: T[], index: number, direction: "up" | "down") {
  const next = [...items]

  if (direction === "up" && index > 0) {
    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
  }

  if (direction === "down" && index < next.length - 1) {
    ;[next[index + 1], next[index]] = [next[index], next[index + 1]]
  }

  return next
}

function getLengthTone(count: number, min: number, max: number) {
  if (count === 0) return "text-ui-fg-subtle"
  if (count < min || count > max) return "text-ui-fg-error"
  return "text-ui-fg-success"
}

function createSidebarItem(
  type: SidebarItem["type"]
): SidebarItem {
  switch (type) {
    case "text":
      return { type: "text", text: "", variant: "normal" }
    case "section":
      return { type: "section", title: "", blocks: [] }
    case "video_links":
      return { type: "video_links", items: [] }
    case "note":
      return { type: "note", text: "", variant: "info" }
    case "emphasis":
      return { type: "emphasis", text: "" }
    default:
      return { type: "text", text: "", variant: "normal" }
  }
}

function createBottomItem(
  type: BottomItem["type"]
): BottomItem {
  switch (type) {
    case "section":
      return { type: "section", title: "", blocks: [] }
    case "specs":
      return { type: "specs", title: "", rows: [] }
    case "video_links":
      return { type: "video_links", items: [] }
    case "note":
      return { type: "note", text: "", variant: "info" }
    default:
      return { type: "section", title: "", blocks: [] }
  }
}

function createRichBlock(type: RichBlock["type"]): RichBlock {
  switch (type) {
    case "heading":
      return { type: "heading", level: 2, text: "" }
    case "p":
      return { type: "p", text: "" }
    case "list":
      return { type: "list", items: [""] }
    default:
      return { type: "p", text: "" }
  }
}

function getRichBlockIssues(block: RichBlock, path: string) {
  const issues: string[] = []

  switch (block.type) {
    case "heading":
      if (![2, 3, 4].includes(block.level)) {
        issues.push(`${path}: level must be 2, 3 or 4`)
      }
      if (!block.text.trim()) {
        issues.push(`${path}: heading text is required`)
      }
      break

    case "p":
      if (!block.text.trim()) {
        issues.push(`${path}: paragraph text is required`)
      }
      break

    case "list":
      if (!block.items.length) {
        issues.push(`${path}: add at least one list item`)
      }

      block.items.forEach((item, index) => {
        if (!item.trim()) {
          issues.push(`${path}: list item ${index + 1} is empty`)
        }
      })
      break
  }

  return issues
}

function getSidebarItemIssues(item: SidebarItem, index: number) {
  const path = `sidebar[${index}]`
  const issues: string[] = []

  switch (item.type) {
    case "text":
      if (!item.text.trim()) {
        issues.push(`${path}: text is required`)
      }
      break

    case "section":
      if (!item.blocks.length) {
        issues.push(`${path}: section should contain at least one inner block`)
      }

      item.blocks.forEach((block, blockIndex) => {
        issues.push(...getRichBlockIssues(block, `${path}.blocks[${blockIndex}]`))
      })
      break

    case "video_links":
      if (!item.items.length) {
        issues.push(`${path}: add at least one video link`)
      }

      item.items.forEach((link, linkIndex) => {
        if (!link.label.trim()) {
          issues.push(`${path}.items[${linkIndex}]: label is required`)
        }
        if (!link.url.trim()) {
          issues.push(`${path}.items[${linkIndex}]: URL is required`)
        } else if (!isValidHttpUrl(link.url.trim())) {
          issues.push(`${path}.items[${linkIndex}]: URL must start with http/https`)
        }
      })
      break

    case "note":
      if (!item.text.trim()) {
        issues.push(`${path}: note text is required`)
      }
      break

    case "emphasis":
      if (!item.text.trim()) {
        issues.push(`${path}: emphasis text is required`)
      }
      break
  }

  return issues
}

function getBottomItemIssues(item: BottomItem, index: number) {
  const path = `bottom[${index}]`
  const issues: string[] = []

  switch (item.type) {
    case "section":
      if (!item.title.trim()) {
        issues.push(`${path}: section title is required`)
      }
      if (!item.blocks.length) {
        issues.push(`${path}: section should contain at least one inner block`)
      }

      item.blocks.forEach((block, blockIndex) => {
        issues.push(...getRichBlockIssues(block, `${path}.blocks[${blockIndex}]`))
      })
      break

    case "specs":
      if (!item.rows.length) {
        issues.push(`${path}: add at least one table row`)
      }

      item.rows.forEach((row, rowIndex) => {
        if (!row[0].trim()) {
          issues.push(`${path}.rows[${rowIndex}]: left cell is required`)
        }
        if (!row[1].trim()) {
          issues.push(`${path}.rows[${rowIndex}]: right cell is required`)
        }
      })
      break

    case "video_links":
      if (!item.items.length) {
        issues.push(`${path}: add at least one video link`)
      }

      item.items.forEach((link, linkIndex) => {
        if (!link.label.trim()) {
          issues.push(`${path}.items[${linkIndex}]: label is required`)
        }
        if (!link.url.trim()) {
          issues.push(`${path}.items[${linkIndex}]: URL is required`)
        } else if (!isValidHttpUrl(link.url.trim())) {
          issues.push(`${path}.items[${linkIndex}]: URL must start with http/https`)
        }
      })
      break

    case "note":
      if (!item.text.trim()) {
        issues.push(`${path}: note text is required`)
      }
      break
  }

  return issues
}

function collectContentIssues(content: ProductContentV2) {
  const issues: string[] = []

  content.sidebar.forEach((item, index) => {
    issues.push(...getSidebarItemIssues(item, index))
  })

  content.bottom.forEach((item, index) => {
    issues.push(...getBottomItemIssues(item, index))
  })

  return issues
}

function renderIssueList(issues: string[]) {
  if (!issues.length) return null

  return (
    <div className="mt-3 rounded-md border border-red-300 bg-red-50 p-3 text-xs text-red-700">
      <div className="font-medium">Validation</div>
      <ul className="mt-2 list-disc pl-5">
        {issues.map((issue) => (
          <li key={issue}>{issue}</li>
        ))}
      </ul>
    </div>
  )
}

const cardClass =
  "rounded-lg border border-ui-border-base bg-ui-bg-base p-4"

const tinyButtonClass =
  "inline-flex items-center rounded-md border border-ui-border-strong px-2 py-1 text-xs font-medium hover:bg-ui-bg-subtle"

const addButtonClass =
  "inline-flex items-center rounded-md border border-ui-border-strong px-3 py-1.5 text-xs font-medium hover:bg-ui-bg-subtle"

const ProductWidget = ({ data }: ProductWidgetProps) => {
  const product = data

  const [currentMetadata, setCurrentMetadata] = useState<Record<string, any>>(
    product?.metadata || {}
  )

  const [contentState, setContentState] = useState<ProductContentV2>(
    readEditorContent(currentMetadata?.content_blocks)
  )

  const [seoTitle, setSeoTitle] = useState(currentMetadata?.seo_title ?? "")
  const [seoDescription, setSeoDescription] = useState(
    currentMetadata?.seo_description ?? ""
  )
  const [seoOgImage, setSeoOgImage] = useState(
    currentMetadata?.seo_og_image ?? ""
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fallbackTitle = (product?.title || "").trim()
  const fallbackDescription =
    (product?.description || "").trim() || fallbackTitle
  const fallbackOgImage =
    (product?.thumbnail || "").trim() ||
    (product?.images?.[0]?.url || "").trim() ||
    ""

  const effectiveTitle = seoTitle.trim() || fallbackTitle
  const effectiveDescription = seoDescription.trim() || fallbackDescription
  const effectiveOgImage = seoOgImage.trim() || fallbackOgImage

  const titleCount = seoTitle.trim().length
  const descriptionCount = seoDescription.trim().length

  const titleTone = useMemo(
    () => getLengthTone(titleCount, 50, 60),
    [titleCount]
  )

  const descriptionTone = useMemo(
    () => getLengthTone(descriptionCount, 120, 160),
    [descriptionCount]
  )

  const liveIssues = useMemo(() => collectContentIssues(contentState), [contentState])

  const rawJsonPreview = useMemo(
    () => safePrettyJson(serializeEditorContent(contentState)),
    [contentState]
  )

  const updateSidebarItem = (index: number, nextItem: SidebarItem) => {
    setContentState((prev) => ({
      ...prev,
      sidebar: prev.sidebar.map((item, itemIndex) =>
        itemIndex === index ? nextItem : item
      ),
    }))
  }

  const updateBottomItem = (index: number, nextItem: BottomItem) => {
    setContentState((prev) => ({
      ...prev,
      bottom: prev.bottom.map((item, itemIndex) =>
        itemIndex === index ? nextItem : item
      ),
    }))
  }

  const removeSidebarItem = (index: number) => {
    setContentState((prev) => ({
      ...prev,
      sidebar: prev.sidebar.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const removeBottomItem = (index: number) => {
    setContentState((prev) => ({
      ...prev,
      bottom: prev.bottom.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const moveSidebarItem = (index: number, direction: "up" | "down") => {
    setContentState((prev) => ({
      ...prev,
      sidebar: moveArrayItem(prev.sidebar, index, direction),
    }))
  }

  const moveBottomItem = (index: number, direction: "up" | "down") => {
    setContentState((prev) => ({
      ...prev,
      bottom: moveArrayItem(prev.bottom, index, direction),
    }))
  }

  const addSidebarItem = (type: SidebarItem["type"]) => {
    setContentState((prev) => ({
      ...prev,
      sidebar: [...prev.sidebar, createSidebarItem(type)],
    }))
  }

  const addBottomItem = (type: BottomItem["type"]) => {
    setContentState((prev) => ({
      ...prev,
      bottom: [...prev.bottom, createBottomItem(type)],
    }))
  }

  const updateSectionBlocks = (
    area: "sidebar" | "bottom",
    sectionIndex: number,
    updater: (blocks: RichBlock[]) => RichBlock[]
  ) => {
    setContentState((prev) => {
      const items = area === "sidebar" ? [...prev.sidebar] : [...prev.bottom]
      const target = items[sectionIndex] as any

      if (!target || target.type !== "section") {
        return prev
      }

      items[sectionIndex] = {
        ...target,
        blocks: updater(target.blocks || []),
      }

      if (area === "sidebar") {
        return {
          ...prev,
          sidebar: items as SidebarItem[],
        }
      }

      return {
        ...prev,
        bottom: items as BottomItem[],
      }
    })
  }

  const addSectionRichBlock = (
    area: "sidebar" | "bottom",
    sectionIndex: number,
    type: RichBlock["type"]
  ) => {
    updateSectionBlocks(area, sectionIndex, (blocks) => [...blocks, createRichBlock(type)])
  }

  const updateSectionRichBlock = (
    area: "sidebar" | "bottom",
    sectionIndex: number,
    blockIndex: number,
    nextBlock: RichBlock
  ) => {
    updateSectionBlocks(area, sectionIndex, (blocks) =>
      blocks.map((block, index) => (index === blockIndex ? nextBlock : block))
    )
  }

  const removeSectionRichBlock = (
    area: "sidebar" | "bottom",
    sectionIndex: number,
    blockIndex: number
  ) => {
    updateSectionBlocks(area, sectionIndex, (blocks) =>
      blocks.filter((_, index) => index !== blockIndex)
    )
  }

  const moveSectionRichBlock = (
    area: "sidebar" | "bottom",
    sectionIndex: number,
    blockIndex: number,
    direction: "up" | "down"
  ) => {
    updateSectionBlocks(area, sectionIndex, (blocks) =>
      moveArrayItem(blocks, blockIndex, direction)
    )
  }

  const handleInsertTemplate = () => {
    setError(null)
    setSuccess(null)
    setContentState(getEmptyContentRoot())
  }

  const handleSave = async () => {
    setError(null)
    setSuccess(null)

    if (seoOgImage.trim() && !isValidHttpUrl(seoOgImage.trim())) {
      setError("OG image URL має бути валідним http/https посиланням")
      return
    }

    const payload = serializeEditorContent(contentState)
    const parsed = productContentArraySchema.safeParse(payload)

    if (!parsed.success) {
      setError("Структура V2 пошкоджена. Це вже помилка редактора, а не користувача.")
      return
    }

    const issues = collectContentIssues(contentState)

    if (issues.length) {
      setError(issues.join("\n"))
      return
    }

    const nextMetadata = {
      ...(currentMetadata || {}),
      content_blocks: payload,
      seo_title: seoTitle.trim(),
      seo_description: seoDescription.trim(),
      seo_og_image: seoOgImage.trim(),
    }

    try {
      setSaving(true)

      await sdk.admin.product.update(product.id, {
        metadata: nextMetadata,
      })

      setCurrentMetadata(nextMetadata)
      setSuccess("Збережено")
    } catch (saveError: any) {
      console.error("Update error", saveError)
      setError(saveError?.message || "Помилка збереження на сервері")
    } finally {
      setSaving(false)
    }
  }

  const renderRichBlockEditor = (
    block: RichBlock,
    area: "sidebar" | "bottom",
    sectionIndex: number,
    blockIndex: number
  ) => {
    const blockIssues = getRichBlockIssues(
      block,
      `${area}[${sectionIndex}].blocks[${blockIndex}]`
    )

    return (
      <div key={`${area}-${sectionIndex}-${blockIndex}`} className={cardClass}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-medium">
              {block.type === "heading"
                ? "Heading"
                : block.type === "p"
                ? "Paragraph"
                : "List"}
            </div>
            <div className="mt-1 text-xs text-ui-fg-subtle">
              {block.type === "heading"
                ? "Subheading inside the section. Use H2 for large subsection titles, H3/H4 for smaller ones."
                : block.type === "p"
                ? "Regular paragraph text. Markdown is allowed."
                : "List of points. Each row is one item."}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={tinyButtonClass}
              onClick={() => moveSectionRichBlock(area, sectionIndex, blockIndex, "up")}
            >
              ↑
            </button>
            <button
              type="button"
              className={tinyButtonClass}
              onClick={() => moveSectionRichBlock(area, sectionIndex, blockIndex, "down")}
            >
              ↓
            </button>
            <button
              type="button"
              className={tinyButtonClass}
              onClick={() => removeSectionRichBlock(area, sectionIndex, blockIndex)}
            >
              Видалити
            </button>
          </div>
        </div>

        <div className="mt-4">
          {block.type === "heading" && (
            <div className="grid gap-4 md:grid-cols-[140px_1fr]">
              <div className="flex flex-col gap-2">
                <Label>Heading level</Label>
                <select
                  className="w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-2 text-sm"
                  value={block.level}
                  onChange={(e) =>
                    updateSectionRichBlock(area, sectionIndex, blockIndex, {
                      ...block,
                      level: Number(e.target.value) as 2 | 3 | 4,
                    })
                  }
                >
                  <option value={2}>H2</option>
                  <option value={3}>H3</option>
                  <option value={4}>H4</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Heading text</Label>
                <Input
                  value={block.text}
                  onChange={(e) =>
                    updateSectionRichBlock(area, sectionIndex, blockIndex, {
                      ...block,
                      text: e.target.value,
                    })
                  }
                  placeholder="Наприклад: Матеріал і конструкція"
                />
              </div>
            </div>
          )}

          {block.type === "p" && (
            <div className="flex flex-col gap-2">
              <Label>Paragraph text</Label>
              <Textarea
                rows={5}
                value={block.text}
                onChange={(e) =>
                  updateSectionRichBlock(area, sectionIndex, blockIndex, {
                    ...block,
                    text: e.target.value,
                  })
                }
                placeholder="Основний текст абзацу"
              />
            </div>
          )}

          {block.type === "list" && (
            <div className="flex flex-col gap-3">
              <Label>List items</Label>

              {block.items.map((item, itemIndex) => (
                <div key={itemIndex} className="rounded-md border border-ui-border-base p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-medium text-ui-fg-subtle">
                      Item {itemIndex + 1}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className={tinyButtonClass}
                        onClick={() =>
                          updateSectionRichBlock(area, sectionIndex, blockIndex, {
                            ...block,
                            items: moveArrayItem(block.items, itemIndex, "up"),
                          })
                        }
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className={tinyButtonClass}
                        onClick={() =>
                          updateSectionRichBlock(area, sectionIndex, blockIndex, {
                            ...block,
                            items: moveArrayItem(block.items, itemIndex, "down"),
                          })
                        }
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className={tinyButtonClass}
                        onClick={() =>
                          updateSectionRichBlock(area, sectionIndex, blockIndex, {
                            ...block,
                            items: block.items.filter((_, index) => index !== itemIndex),
                          })
                        }
                      >
                        Видалити
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <Textarea
                      rows={3}
                      value={item}
                      onChange={(e) =>
                        updateSectionRichBlock(area, sectionIndex, blockIndex, {
                          ...block,
                          items: block.items.map((current, index) =>
                            index === itemIndex ? e.target.value : current
                          ),
                        })
                      }
                      placeholder="Окремий пункт списку"
                    />
                  </div>
                </div>
              ))}

              <div>
                <button
                  type="button"
                  className={addButtonClass}
                  onClick={() =>
                    updateSectionRichBlock(area, sectionIndex, blockIndex, {
                      ...block,
                      items: [...block.items, ""],
                    })
                  }
                >
                  Додати пункт
                </button>
              </div>
            </div>
          )}
        </div>

        {renderIssueList(blockIssues)}
      </div>
    )
  }

  const renderSidebarItemEditor = (item: SidebarItem, index: number) => {
    const itemIssues = getSidebarItemIssues(item, index)

    return (
      <div key={`sidebar-${index}`} className={cardClass}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-medium">
              Sidebar / {item.type}
            </div>
            <div className="mt-1 text-xs text-ui-fg-subtle">
              {item.type === "text"
                ? "Short introduction or explanation for the sidebar."
                : item.type === "section"
                ? "Grouped content block. Inside it you can add headings, paragraphs and lists."
                : item.type === "video_links"
                ? "Buttons linking to videos."
                : item.type === "note"
                ? "Important note or warning."
                : "Short highlighted phrase."}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={tinyButtonClass}
              onClick={() => moveSidebarItem(index, "up")}
            >
              ↑
            </button>
            <button
              type="button"
              className={tinyButtonClass}
              onClick={() => moveSidebarItem(index, "down")}
            >
              ↓
            </button>
            <button
              type="button"
              className={tinyButtonClass}
              onClick={() => removeSidebarItem(index)}
            >
              Видалити
            </button>
          </div>
        </div>

        <div className="mt-4">
          {item.type === "text" && (
            <div className="grid gap-4">
              <div className="flex flex-col gap-2">
                <Label>Variant</Label>
                <select
                  className="w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-2 text-sm"
                  value={item.variant || "normal"}
                  onChange={(e) =>
                    updateSidebarItem(index, {
                      ...item,
                      variant: e.target.value as "muted" | "normal",
                    })
                  }
                >
                  <option value="normal">normal</option>
                  <option value="muted">muted</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Text</Label>
                <Textarea
                  rows={5}
                  value={item.text}
                  onChange={(e) =>
                    updateSidebarItem(index, {
                      ...item,
                      text: e.target.value,
                    })
                  }
                  placeholder="Короткий вступ або пояснення"
                />
              </div>
            </div>
          )}

          {item.type === "section" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Section title</Label>
                <Input
                  value={item.title || ""}
                  onChange={(e) =>
                    updateSidebarItem(index, {
                      ...item,
                      title: e.target.value,
                    })
                  }
                  placeholder="Можна залишити пустим"
                />
                <Text size="small" leading="compact" className="text-ui-fg-subtle">
                  Заголовок у sidebar необов’язковий.
                </Text>
              </div>

              <div className="rounded-md border border-ui-border-base p-3">
                <div className="mb-3 font-medium">Inner blocks</div>

                <div className="mb-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={addButtonClass}
                    onClick={() => addSectionRichBlock("sidebar", index, "heading")}
                  >
                    Додати heading
                  </button>
                  <button
                    type="button"
                    className={addButtonClass}
                    onClick={() => addSectionRichBlock("sidebar", index, "p")}
                  >
                    Додати paragraph
                  </button>
                  <button
                    type="button"
                    className={addButtonClass}
                    onClick={() => addSectionRichBlock("sidebar", index, "list")}
                  >
                    Додати list
                  </button>
                </div>

                <div className="space-y-3">
                  {item.blocks.map((block, blockIndex) =>
                    renderRichBlockEditor(block, "sidebar", index, blockIndex)
                  )}
                </div>
              </div>
            </div>
          )}

          {item.type === "video_links" && (
            <div className="flex flex-col gap-3">
              <div className="text-xs text-ui-fg-subtle">
                Add one button per link.
              </div>

              {item.items.map((link, linkIndex) => (
                <div key={linkIndex} className="rounded-md border border-ui-border-base p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-medium text-ui-fg-subtle">
                      Link {linkIndex + 1}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className={tinyButtonClass}
                        onClick={() =>
                          updateSidebarItem(index, {
                            ...item,
                            items: moveArrayItem(item.items, linkIndex, "up"),
                          })
                        }
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className={tinyButtonClass}
                        onClick={() =>
                          updateSidebarItem(index, {
                            ...item,
                            items: moveArrayItem(item.items, linkIndex, "down"),
                          })
                        }
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className={tinyButtonClass}
                        onClick={() =>
                          updateSidebarItem(index, {
                            ...item,
                            items: item.items.filter((_, currentIndex) => currentIndex !== linkIndex),
                          })
                        }
                      >
                        Видалити
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label>Label</Label>
                      <Input
                        value={link.label}
                        onChange={(e) =>
                          updateSidebarItem(index, {
                            ...item,
                            items: item.items.map((current, currentIndex) =>
                              currentIndex === linkIndex
                                ? { ...current, label: e.target.value }
                                : current
                            ),
                          })
                        }
                        placeholder="Наприклад: Відео техніки"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label>URL</Label>
                      <Input
                        value={link.url}
                        onChange={(e) =>
                          updateSidebarItem(index, {
                            ...item,
                            items: item.items.map((current, currentIndex) =>
                              currentIndex === linkIndex
                                ? { ...current, url: e.target.value }
                                : current
                            ),
                          })
                        }
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div>
                <button
                  type="button"
                  className={addButtonClass}
                  onClick={() =>
                    updateSidebarItem(index, {
                      ...item,
                      items: [...item.items, { label: "", url: "" }],
                    })
                  }
                >
                  Додати посилання
                </button>
              </div>
            </div>
          )}

          {item.type === "note" && (
            <div className="grid gap-4">
              <div className="flex flex-col gap-2">
                <Label>Variant</Label>
                <select
                  className="w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-2 text-sm"
                  value={item.variant || "info"}
                  onChange={(e) =>
                    updateSidebarItem(index, {
                      ...item,
                      variant: e.target.value as "info" | "warning",
                    })
                  }
                >
                  <option value="info">info</option>
                  <option value="warning">warning</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Note text</Label>
                <Textarea
                  rows={4}
                  value={item.text}
                  onChange={(e) =>
                    updateSidebarItem(index, {
                      ...item,
                      text: e.target.value,
                    })
                  }
                  placeholder="Важлива примітка або попередження"
                />
              </div>
            </div>
          )}

          {item.type === "emphasis" && (
            <div className="flex flex-col gap-2">
              <Label>Emphasis text</Label>
              <Textarea
                rows={3}
                value={item.text}
                onChange={(e) =>
                  updateSidebarItem(index, {
                    ...item,
                    text: e.target.value,
                  })
                }
                placeholder="Коротка виділена фраза"
              />
            </div>
          )}
        </div>

        {renderIssueList(itemIssues)}
      </div>
    )
  }

  const renderBottomItemEditor = (item: BottomItem, index: number) => {
    const itemIssues = getBottomItemIssues(item, index)

    return (
      <div key={`bottom-${index}`} className={cardClass}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-medium">
              Bottom / {item.type === "specs" ? "table" : item.type}
            </div>
            <div className="mt-1 text-xs text-ui-fg-subtle">
              {item.type === "section"
                ? "Main content section. Inside it you can add headings, paragraphs and lists."
                : item.type === "specs"
                ? "Table of characteristics. Left cell is the label, right cell is the value."
                : item.type === "video_links"
                ? "Buttons linking to videos."
                : "Important note shown below the main content."}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={tinyButtonClass}
              onClick={() => moveBottomItem(index, "up")}
            >
              ↑
            </button>
            <button
              type="button"
              className={tinyButtonClass}
              onClick={() => moveBottomItem(index, "down")}
            >
              ↓
            </button>
            <button
              type="button"
              className={tinyButtonClass}
              onClick={() => removeBottomItem(index)}
            >
              Видалити
            </button>
          </div>
        </div>

        <div className="mt-4">
          {item.type === "section" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Section title</Label>
                <Input
                  value={item.title}
                  onChange={(e) =>
                    updateBottomItem(index, {
                      ...item,
                      title: e.target.value,
                    })
                  }
                  placeholder="Назва секції"
                />
                <Text size="small" leading="compact" className="text-ui-fg-subtle">
                  Заголовок у bottom section обов’язковий.
                </Text>
              </div>

              <div className="rounded-md border border-ui-border-base p-3">
                <div className="mb-3 font-medium">Inner blocks</div>

                <div className="mb-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={addButtonClass}
                    onClick={() => addSectionRichBlock("bottom", index, "heading")}
                  >
                    Додати heading
                  </button>
                  <button
                    type="button"
                    className={addButtonClass}
                    onClick={() => addSectionRichBlock("bottom", index, "p")}
                  >
                    Додати paragraph
                  </button>
                  <button
                    type="button"
                    className={addButtonClass}
                    onClick={() => addSectionRichBlock("bottom", index, "list")}
                  >
                    Додати list
                  </button>
                </div>

                <div className="space-y-3">
                  {item.blocks.map((block, blockIndex) =>
                    renderRichBlockEditor(block, "bottom", index, blockIndex)
                  )}
                </div>
              </div>
            </div>
          )}

          {item.type === "specs" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Table title</Label>
                <Input
                  value={item.title || ""}
                  onChange={(e) =>
                    updateBottomItem(index, {
                      ...item,
                      title: e.target.value,
                    })
                  }
                  placeholder="Наприклад: Характеристики товару"
                />
                <Text size="small" leading="compact" className="text-ui-fg-subtle">
                  Заголовок бажаний, але не обов’язковий.
                </Text>
              </div>

              <div className="space-y-3">
                {item.rows.map((row, rowIndex) => (
                  <div key={rowIndex} className="rounded-md border border-ui-border-base p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-medium text-ui-fg-subtle">
                        Row {rowIndex + 1}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className={tinyButtonClass}
                          onClick={() =>
                            updateBottomItem(index, {
                              ...item,
                              rows: moveArrayItem(item.rows, rowIndex, "up"),
                            })
                          }
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className={tinyButtonClass}
                          onClick={() =>
                            updateBottomItem(index, {
                              ...item,
                              rows: moveArrayItem(item.rows, rowIndex, "down"),
                            })
                          }
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className={tinyButtonClass}
                          onClick={() =>
                            updateBottomItem(index, {
                              ...item,
                              rows: item.rows.filter((_, currentIndex) => currentIndex !== rowIndex),
                            })
                          }
                        >
                          Видалити
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <Label>Left cell</Label>
                        <Input
                          value={row[0]}
                          onChange={(e) =>
                            updateBottomItem(index, {
                              ...item,
                              rows: item.rows.map((current, currentIndex) =>
                                currentIndex === rowIndex
                                  ? [e.target.value, current[1]]
                                  : current
                              ),
                            })
                          }
                          placeholder="Назва характеристики"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label>Right cell</Label>
                        <Input
                          value={row[1]}
                          onChange={(e) =>
                            updateBottomItem(index, {
                              ...item,
                              rows: item.rows.map((current, currentIndex) =>
                                currentIndex === rowIndex
                                  ? [current[0], e.target.value]
                                  : current
                              ),
                            })
                          }
                          placeholder="Значення"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div>
                  <button
                    type="button"
                    className={addButtonClass}
                    onClick={() =>
                      updateBottomItem(index, {
                        ...item,
                        rows: [...item.rows, ["", ""]],
                      })
                    }
                  >
                    Додати рядок
                  </button>
                </div>
              </div>
            </div>
          )}

          {item.type === "video_links" && (
            <div className="flex flex-col gap-3">
              <div className="text-xs text-ui-fg-subtle">
                Add one button per link.
              </div>

              {item.items.map((link, linkIndex) => (
                <div key={linkIndex} className="rounded-md border border-ui-border-base p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-medium text-ui-fg-subtle">
                      Link {linkIndex + 1}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className={tinyButtonClass}
                        onClick={() =>
                          updateBottomItem(index, {
                            ...item,
                            items: moveArrayItem(item.items, linkIndex, "up"),
                          })
                        }
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className={tinyButtonClass}
                        onClick={() =>
                          updateBottomItem(index, {
                            ...item,
                            items: moveArrayItem(item.items, linkIndex, "down"),
                          })
                        }
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className={tinyButtonClass}
                        onClick={() =>
                          updateBottomItem(index, {
                            ...item,
                            items: item.items.filter((_, currentIndex) => currentIndex !== linkIndex),
                          })
                        }
                      >
                        Видалити
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label>Label</Label>
                      <Input
                        value={link.label}
                        onChange={(e) =>
                          updateBottomItem(index, {
                            ...item,
                            items: item.items.map((current, currentIndex) =>
                              currentIndex === linkIndex
                                ? { ...current, label: e.target.value }
                                : current
                            ),
                          })
                        }
                        placeholder="Наприклад: Відео техніки"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label>URL</Label>
                      <Input
                        value={link.url}
                        onChange={(e) =>
                          updateBottomItem(index, {
                            ...item,
                            items: item.items.map((current, currentIndex) =>
                              currentIndex === linkIndex
                                ? { ...current, url: e.target.value }
                                : current
                            ),
                          })
                        }
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div>
                <button
                  type="button"
                  className={addButtonClass}
                  onClick={() =>
                    updateBottomItem(index, {
                      ...item,
                      items: [...item.items, { label: "", url: "" }],
                    })
                  }
                >
                  Додати посилання
                </button>
              </div>
            </div>
          )}

          {item.type === "note" && (
            <div className="grid gap-4">
              <div className="flex flex-col gap-2">
                <Label>Variant</Label>
                <select
                  className="w-full rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-2 text-sm"
                  value={item.variant || "info"}
                  onChange={(e) =>
                    updateBottomItem(index, {
                      ...item,
                      variant: e.target.value as "info" | "warning",
                    })
                  }
                >
                  <option value="info">info</option>
                  <option value="warning">warning</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Note text</Label>
                <Textarea
                  rows={4}
                  value={item.text}
                  onChange={(e) =>
                    updateBottomItem(index, {
                      ...item,
                      text: e.target.value,
                    })
                  }
                  placeholder="Важлива примітка або попередження"
                />
              </div>
            </div>
          )}
        </div>

        {renderIssueList(itemIssues)}
      </div>
    )
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">SEO та структурований опис</Heading>
      </div>

      <div className="flex flex-col gap-y-4 px-6 py-4">
        <Text size="small" leading="compact" className="text-ui-fg-subtle">
          Тут редагуються SEO-поля продукту та V2 builder без прямого редагування JSON.
        </Text>

        <Text size="small" leading="compact" className="text-ui-fg-subtle">
          Product ID: {product.id}
        </Text>

        <Text size="small" leading="compact" className="text-ui-fg-subtle">
          Handle: {product.handle}
        </Text>

        <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-4">
          <div className="mb-3">
            <Heading level="h3">SEO</Heading>
          </div>

          <div className="flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="seo-title">SEO title</Label>
              <Input
                id="seo-title"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Заголовок сторінки в Google"
              />
              <Text size="small" leading="compact" className={titleTone}>
                Рекомендовано 50–60 символів. Зараз: {titleCount}
              </Text>
              {!seoTitle.trim() && (
                <Text size="small" leading="compact" className="text-ui-fg-subtle">
                  Якщо поле пусте, буде використано назву товару.
                </Text>
              )}
            </div>

            <div className="flex flex-col gap-y-2">
              <Label htmlFor="seo-description">SEO description</Label>
              <Textarea
                id="seo-description"
                rows={4}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Короткий опис сторінки в Google"
              />
              <Text size="small" leading="compact" className={descriptionTone}>
                Рекомендовано 120–160 символів. Зараз: {descriptionCount}
              </Text>
              {!seoDescription.trim() && (
                <Text size="small" leading="compact" className="text-ui-fg-subtle">
                  Якщо поле пусте, буде використано description товару або його назву.
                </Text>
              )}
            </div>

            <div className="flex flex-col gap-y-2">
              <Label htmlFor="seo-og-image">OG image URL</Label>
              <Input
                id="seo-og-image"
                value={seoOgImage}
                onChange={(e) => setSeoOgImage(e.target.value)}
                placeholder="Картинка для соцмереж і месенджерів"
              />
              {!seoOgImage.trim() && (
                <Text size="small" leading="compact" className="text-ui-fg-subtle">
                  Якщо поле пусте, буде використано thumbnail або перше фото товару.
                </Text>
              )}
            </div>

            <div className="rounded-md border border-ui-border-base bg-ui-bg-base p-3">
              <Text size="small" leading="compact" className="font-medium">
                Preview
              </Text>

              <div className="mt-3 flex flex-col gap-y-2">
                <div>
                  <Text size="small" leading="compact" className="text-ui-fg-subtle">
                    Effective title
                  </Text>
                  <Text size="small" leading="compact">
                    {effectiveTitle || "—"}
                  </Text>
                </div>

                <div>
                  <Text size="small" leading="compact" className="text-ui-fg-subtle">
                    Effective description
                  </Text>
                  <Text size="small" leading="compact">
                    {effectiveDescription || "—"}
                  </Text>
                </div>

                <div>
                  <Text size="small" leading="compact" className="text-ui-fg-subtle">
                    Effective OG image
                  </Text>
                  <Text size="small" leading="compact">
                    {effectiveOgImage || "—"}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Heading level="h3">Content builder</Heading>

            <button
              type="button"
              className={addButtonClass}
              onClick={handleInsertTemplate}
            >
              Очистити до порожнього V2
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-md border border-ui-border-base bg-ui-bg-base p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <div className="font-medium">Sidebar blocks</div>
                  <div className="mt-1 text-xs text-ui-fg-subtle">
                    Short content shown near the product title and actions.
                  </div>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={addButtonClass}
                  onClick={() => addSidebarItem("text")}
                >
                  Додати text
                </button>
                <button
                  type="button"
                  className={addButtonClass}
                  onClick={() => addSidebarItem("section")}
                >
                  Додати section
                </button>
                <button
                  type="button"
                  className={addButtonClass}
                  onClick={() => addSidebarItem("video_links")}
                >
                  Додати video links
                </button>
                <button
                  type="button"
                  className={addButtonClass}
                  onClick={() => addSidebarItem("note")}
                >
                  Додати note
                </button>
                <button
                  type="button"
                  className={addButtonClass}
                  onClick={() => addSidebarItem("emphasis")}
                >
                  Додати emphasis
                </button>
              </div>

              <div className="space-y-4">
                {contentState.sidebar.map((item, index) => renderSidebarItemEditor(item, index))}
              </div>
            </div>

            <div className="rounded-md border border-ui-border-base bg-ui-bg-base p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <div className="font-medium">Bottom blocks</div>
                  <div className="mt-1 text-xs text-ui-fg-subtle">
                    Main detailed content below the top product area.
                  </div>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={addButtonClass}
                  onClick={() => addBottomItem("section")}
                >
                  Додати section
                </button>
                <button
                  type="button"
                  className={addButtonClass}
                  onClick={() => addBottomItem("specs")}
                >
                  Додати table
                </button>
                <button
                  type="button"
                  className={addButtonClass}
                  onClick={() => addBottomItem("video_links")}
                >
                  Додати video links
                </button>
                <button
                  type="button"
                  className={addButtonClass}
                  onClick={() => addBottomItem("note")}
                >
                  Додати note
                </button>
              </div>

              <div className="space-y-4">
                {contentState.bottom.map((item, index) => renderBottomItemEditor(item, index))}
              </div>
            </div>
          </div>

          <details className="mt-6">
            <summary className="cursor-pointer text-sm font-medium">
              Показати технічний JSON
            </summary>

            <div className="mt-3">
              <textarea
                rows={20}
                className="w-full rounded-md border border-ui-border-subtle p-3 font-mono text-xs"
                value={rawJsonPreview}
                readOnly
              />
            </div>
          </details>
        </div>

        {liveIssues.length > 0 && (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 whitespace-pre-wrap">
            <div className="font-medium">Поточні проблеми в контенті</div>
            <ul className="mt-2 list-disc pl-5">
              {liveIssues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 whitespace-pre-wrap">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <button
          type="button"
          className="mt-2 inline-flex items-center rounded-md border border-ui-border-strong px-3 py-2 text-sm font-medium hover:bg-ui-bg-subtle disabled:opacity-50"
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? "Збереження..." : "Зберегти"}
        </button>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductWidget