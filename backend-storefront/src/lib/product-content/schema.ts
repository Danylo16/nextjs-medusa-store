import { z } from "zod"

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

export const richBlockSchema = z.union([
  richHeadingBlockSchema,
  richParagraphBlockSchema,
  richListBlockSchema,
])

export const sidebarTextBlockSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
  variant: z.enum(["muted", "normal"]).optional(),
})

export const sidebarSectionBlockSchema = z.object({
  type: z.literal("section"),
  title: z.string().optional(),
  blocks: z.array(richBlockSchema),
})

export const sidebarVideoLinksBlockSchema = z.object({
  type: z.literal("video_links"),
  items: z.array(videoLinkSchema),
})

export const sidebarNoteBlockSchema = z.object({
  type: z.literal("note"),
  text: z.string(),
  variant: z.enum(["info", "warning"]).optional(),
})

export const sidebarEmphasisBlockSchema = z.object({
  type: z.literal("emphasis"),
  text: z.string(),
})

export const bottomSectionBlockSchema = z.object({
  type: z.literal("section"),
  title: z.string(),
  blocks: z.array(richBlockSchema),
})

export const bottomSpecsBlockSchema = z.object({
  type: z.literal("specs"),
  title: z.string().optional(),
  rows: z.array(z.tuple([z.string(), z.string()])),
})

export const bottomVideoLinksBlockSchema = z.object({
  type: z.literal("video_links"),
  items: z.array(videoLinkSchema),
})

export const bottomNoteBlockSchema = z.object({
  type: z.literal("note"),
  text: z.string(),
  variant: z.enum(["info", "warning"]).optional(),
})

export const sidebarItemSchema = z.union([
  sidebarTextBlockSchema,
  sidebarSectionBlockSchema,
  sidebarVideoLinksBlockSchema,
  sidebarNoteBlockSchema,
  sidebarEmphasisBlockSchema,
])

export const bottomItemSchema = z.union([
  bottomSectionBlockSchema,
  bottomSpecsBlockSchema,
  bottomVideoLinksBlockSchema,
  bottomNoteBlockSchema,
])

export const productContentV2Schema = z.object({
  version: z.literal(2),
  sidebar: z.array(sidebarItemSchema).optional(),
  bottom: z.array(bottomItemSchema).optional(),
})

export const productContentArraySchema = z.array(productContentV2Schema)

export type ProductContentV2 = z.infer<typeof productContentV2Schema>
export type ProductContentArray = z.infer<typeof productContentArraySchema>

export function isProductContentV2(data: unknown): data is ProductContentArray {
  return productContentArraySchema.safeParse(data).success
}