"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

type AccordionType = "single" | "multiple"

type Ctx = {
  type: AccordionType
  open: string[]
  setOpen: (v: string[]) => void
  collapsible: boolean
}

const AccordionContext = React.createContext<Ctx | null>(null)

export function Accordion({
  type = "single",
  collapsible = true,
  className = "",
  children,
}: {
  type?: AccordionType
  collapsible?: boolean
  className?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState<string[]>([])
  return (
    <AccordionContext.Provider value={{ type, open, setOpen, collapsible }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  )
}

export function AccordionItem({
  value,
  className = "",
  children,
}: {
  value: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      data-acc-item={value}
      className={"border-b border-black/10 last:border-b-0 " + className}
    >
      {children}
    </div>
  )
}


export function AccordionTrigger({
  children,
}: {
  children: React.ReactNode
}) {
  const ctx = React.useContext(AccordionContext)
  if (!ctx) throw new Error("AccordionTrigger must be used within Accordion")

  const ref = React.useRef<HTMLButtonElement>(null)
  const [value, setValue] = React.useState("")

  React.useEffect(() => {
    const el = ref.current?.closest("[data-acc-item]") as HTMLElement | null
    setValue(el?.dataset?.accItem ?? "")
  }, [])

  const isOpen = value ? ctx.open.includes(value) : false

  const toggle = () => {
    if (!value) return
    if (isOpen) {
      if (!ctx.collapsible) return
      ctx.setOpen(ctx.open.filter((v) => v !== value))
      return
    }
    if (ctx.type === "single") ctx.setOpen([value])
    else ctx.setOpen([...ctx.open, value])
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={toggle}
      aria-expanded={isOpen}
      className="flex w-full items-center justify-between gap-3 py-4 text-left text-sm font-semibold text-foreground hover:text-primary transition-colors"
    >
      <span>{children}</span>
      <ChevronDown
        size={18}
        className={"shrink-0 text-black/40 transition " + (isOpen ? "rotate-180" : "")}
      />
    </button>
  )
}

export function AccordionContent({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(AccordionContext)
  if (!ctx) throw new Error("AccordionContent must be used within Accordion")

  const ref = React.useRef<HTMLDivElement>(null)
  const [value, setValue] = React.useState("")

  React.useEffect(() => {
    const el = ref.current?.closest("[data-acc-item]") as HTMLElement | null
    setValue(el?.dataset?.accItem ?? "")
  }, [])

  const isOpen = value ? ctx.open.includes(value) : false

  return (
    <div
      ref={ref}
      className={
        "grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out " +
        (isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")
      }
    >
      {/* IMPORTANT: min-h-0 lets grid item actually shrink in some browsers */}
      <div className="min-h-0">
        <div className="pb-4">{children}</div>
      </div>
    </div>
  )
}
