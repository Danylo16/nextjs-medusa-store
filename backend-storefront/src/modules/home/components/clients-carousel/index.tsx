"use client"

import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { CLIENTS, type ClientLogo } from "@/lib/data/clients-config"

function getItemsPerView(width: number) {
  // 2 on mobile, 3 on tablet, 4 on desktop
  if (width >= 1024) return 4
  if (width >= 768) return 3
  return 2
}

function getGapPx(width: number) {
  // Slightly tighter on mobile, comfortable on desktop
  if (width >= 1024) return 28
  if (width >= 768) return 24
  return 18
}

export default function ClientsCarousel({
  title = "Наші клієнти",
  subtitle = "Партнери, які вже використовують наше обладнання",
  clients = CLIENTS,
}: {
  title?: string
  subtitle?: string
  clients?: ClientLogo[]
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null)

  const [itemsPerView, setItemsPerView] = useState(4)
  const [gap, setGap] = useState(24)
  const [containerW, setContainerW] = useState(1)

  // Index points to the first visible item in the extended array
  const [index, setIndex] = useState(0)
  const [enableTransition, setEnableTransition] = useState(true)

  // Drag state (use state for smooth live updates)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  // Refs for performance + velocity
  const pointerIdRef = useRef<number | null>(null)
  const startXRef = useRef(0)
  const lastXRef = useRef(0)
  const lastTRef = useRef(0)
  const velocityRef = useRef(0) // px/ms
  const rafRef = useRef<number | null>(null)
  const pendingOffsetRef = useRef(0)
  const draggedEnoughRef = useRef(false)

  const animatingRef = useRef(false)

  const baseClients = clients.length ? clients : CLIENTS
  const n = baseClients.length

  const extended = useMemo(() => {
    // Triple list for seamless looping
    return [...baseClients, ...baseClients, ...baseClients]
  }, [baseClients])

  const startIndex = useMemo(() => {
    // Start in the middle copy
    return n
  }, [n])

  useEffect(() => {
    setIndex(startIndex)
  }, [startIndex])

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setItemsPerView(getItemsPerView(w))
      setGap(getGapPx(w))
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return

    const ro = new ResizeObserver(() => {
      setContainerW(el.clientWidth || 1)
    })

    ro.observe(el)
    setContainerW(el.clientWidth || 1)

    return () => ro.disconnect()
  }, [])

  const step = useMemo(() => {
    // Each item width + gap
    const items = Math.max(1, itemsPerView)
    const g = Math.max(0, gap)
    const w = Math.max(1, containerW)
    const itemW = (w - (items - 1) * g) / items
    return itemW + g
  }, [containerW, gap, itemsPerView])

  const normalizeIndex = useCallback(
    (raw: number) => {
      // Keep index inside the middle copy: [n, 2n)
      if (n === 0) return 0
      if (raw < n) return raw + n
      if (raw >= 2 * n) return raw - n
      return raw
    },
    [n]
  )

  const hardResetIfNeeded = useCallback(
    (nextIndex: number) => {
      const fixed = normalizeIndex(nextIndex)
      if (fixed !== nextIndex) {
        setEnableTransition(false)
        setIndex(fixed)
        requestAnimationFrame(() => setEnableTransition(true))
      }
    },
    [normalizeIndex]
  )

  const snapTo = useCallback(
    (nextIndex: number) => {
      if (n === 0) return
      if (animatingRef.current) return

      animatingRef.current = true
      setEnableTransition(true)
      setIndex(nextIndex)

      window.setTimeout(() => {
        hardResetIfNeeded(nextIndex)
        animatingRef.current = false
      }, 320)
    },
    [hardResetIfNeeded, n]
  )

  const prev = useCallback(() => {
    if (n === 0) return
    snapTo(index - itemsPerView)
  }, [index, itemsPerView, n, snapTo])

  const next = useCallback(() => {
    if (n === 0) return
    snapTo(index + itemsPerView)
  }, [index, itemsPerView, n, snapTo])

  const commitOffsetRaf = useCallback(() => {
    if (rafRef.current != null) return
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null
      setDragOffset(pendingOffsetRef.current)
    })
  }, [])

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = viewportRef.current
    if (!el) return

    pointerIdRef.current = e.pointerId
    el.setPointerCapture(e.pointerId)

    setIsDragging(true)
    setEnableTransition(false)

    startXRef.current = e.clientX
    lastXRef.current = e.clientX
    lastTRef.current = performance.now()
    velocityRef.current = 0
    pendingOffsetRef.current = 0
    draggedEnoughRef.current = false

    // Prevent text selection during drag
    document.body.style.userSelect = "none"
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return

      const now = performance.now()
      const dx = e.clientX - startXRef.current

      // Track velocity for flick feel
      const dt = Math.max(1, now - lastTRef.current)
      const vx = (e.clientX - lastXRef.current) / dt // px/ms
      velocityRef.current = vx
      lastXRef.current = e.clientX
      lastTRef.current = now

      if (Math.abs(dx) > 6) draggedEnoughRef.current = true

      pendingOffsetRef.current = dx
      commitOffsetRaf()
    },
    [commitOffsetRaf, isDragging]
  )

  const endDrag = useCallback(() => {
    if (!isDragging) return

    setIsDragging(false)
    document.body.style.userSelect = ""

    const delta = pendingOffsetRef.current
    pendingOffsetRef.current = 0
    setDragOffset(0)

    // Project movement with a small flick component (pleasant drag)
    // Negative delta = dragged left => move forward
    const v = velocityRef.current // px/ms
    const projected = delta + v * 220 // "inertia" projection
    const threshold = step * 0.18

    let moved = 0
    if (Math.abs(projected) > threshold) {
      moved = Math.round(-projected / step)
    }

    setEnableTransition(true)
    snapTo(index + moved)

    // Release pointer capture
    const el = viewportRef.current
    if (el && pointerIdRef.current != null) {
      try {
        el.releasePointerCapture(pointerIdRef.current)
      } catch {
        // Ignore
      }
    }
    pointerIdRef.current = null
  }, [index, isDragging, snapTo, step])

  const onPointerUp = useCallback(() => {
    endDrag()
  }, [endDrag])

  const onPointerCancel = useCallback(() => {
    endDrag()
  }, [endDrag])

  const translateX = useMemo(() => {
    // Base translate + live drag offset
    return -(index * step) + dragOffset
  }, [dragOffset, index, step])

  return (
    <section className="section">
      <div className="content-container">
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>
          <p className="text-sm text-foreground/60 mt-1">{subtitle}</p>
        </div>

        <div className="relative">
          {/* Desktop arrows only */}
          <button
            type="button"
            onClick={prev}
            aria-label="Попередні клієнти"
            className="hidden md:grid absolute -left-5 top-1/2 -translate-y-1/2 z-10
                       h-11 w-11 place-items-center rounded-full
                       border border-foreground/10 bg-background/80 backdrop-blur
                       transition hover:border-primary/40 hover:text-primary"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={next}
            aria-label="Наступні клієнти"
            className="hidden md:grid absolute -right-5 top-1/2 -translate-y-1/2 z-10
                       h-11 w-11 place-items-center rounded-full
                       border border-foreground/10 bg-background/80 backdrop-blur
                       transition hover:border-primary/40 hover:text-primary"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Viewport */}
          <div
            ref={viewportRef}
            className="overflow-hidden select-none"
            style={{ touchAction: "pan-y" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
          >
            {/* Track */}
            <div
              className="flex"
              style={{
                gap: `${gap}px`,
                transform: `translate3d(${translateX}px, 0, 0)`,
                transition: enableTransition ? "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)" : "none",
                cursor: isDragging ? "grabbing" : "grab",
                willChange: "transform",
              }}
            >
              {extended.map((c, i) => (
                <div
                  key={`${c.name}-${i}`}
                  className="flex-none"
                  style={{
                    width: `calc((100% - ${(itemsPerView - 1) * gap}px) / ${itemsPerView})`,
                  }}
                >
                  <ClientLogoItem client={c} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ClientLogoItem({ client }: { client: ClientLogo }) {
  const inner = (
    <div className="h-[180px] md:h-[210px] flex items-center justify-center [--logo:0.85] md:[--logo:0.82]">
      <Image
        src={client.src}
        alt={client.name}
        width={520}
        height={260}
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        className="pointer-events-none select-none
           h-[52%] sm:h-[60%] md:h-[70%] lg:h-[74%]
           w-auto max-w-full object-contain"
      />
    </div>
  )

  return client.href ? (
    <a href={client.href} target="_blank" rel="noreferrer" aria-label={client.name} className="block">
      {inner}
    </a>
  ) : (
    inner
  )
}
