"use client"

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Props = {
  title: string
  subtitle?: string
  children: React.ReactNode
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false

  return Boolean(
    target.closest(
      [
        "a",
        "button",
        "input",
        "textarea",
        "select",
        "option",
        "label",
        "[role='button']",
        "[data-no-drag]",
      ].join(",")
    )
  )
}

export default function RelatedProductsSlider({ title, subtitle, children }: Props) {
  const items = useMemo(() => React.Children.toArray(children), [children])
  const n = items.length

  const viewportRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLUListElement | null>(null)

  const [itemSize, setItemSize] = useState<number>(344) // fallback (width+gap)
  const [perPage, setPerPage] = useState<number>(1)

  const [index, setIndex] = useState<number>(() => (n ? n : 0)) // start in middle copy
  const [dragOffset, setDragOffset] = useState<number>(0)
  const [dragging, setDragging] = useState(false)
  const [jumping, setJumping] = useState(false)

  const loopItems = useMemo(() => {
    if (!n) return []
    // 3 copies to simulate infinite loop
    return [...items, ...items, ...items]
  }, [items, n])

  // Measure item width + gap to snap properly (responsive)
  useLayoutEffect(() => {
    if (!viewportRef.current || !trackRef.current || !n) return

    const measure = () => {
      const track = trackRef.current!
      const first = track.querySelector<HTMLElement>('[data-slide="0"]')
      if (!first) return

      const itemW = first.getBoundingClientRect().width
      const styles = window.getComputedStyle(track)
      // flex gap can be "gap" or "column-gap"
      const gapStr = styles.columnGap || styles.gap || "24px"
      const gap = Number.parseFloat(gapStr) || 24

      const nextItemSize = itemW + gap
      setItemSize(nextItemSize)

      const vpW = viewportRef.current!.getBoundingClientRect().width
      const nextPerPage = clamp(Math.floor((vpW + gap) / nextItemSize), 1, 6)
      setPerPage(nextPerPage)
    }

    measure()

    const ro = new ResizeObserver(() => measure())
    ro.observe(viewportRef.current)
    ro.observe(trackRef.current)
    return () => ro.disconnect()
  }, [n])

  // Keep index inside the middle copy (infinite illusion)
  useEffect(() => {
    if (!n) return
    if (index < n || index >= 2 * n) {
      const normalized = ((index % n) + n) % n
      const next = normalized + n

      setJumping(true)
      setIndex(next)
      // turn transitions back on next frame
      requestAnimationFrame(() => setJumping(false))
    }
  }, [index, n])

  const go = useCallback(
    (delta: number) => {
      if (!n) return
      setIndex((i) => i + delta)
    },
    [n]
  )

  const prev = useCallback(() => go(-perPage), [go, perPage])
  const next = useCallback(() => go(perPage), [go, perPage])

  // Drag handling (mouse + touch via pointer events)
  const dragStateRef = useRef<{
    startX: number
    startOffset: number
    active: boolean
    captured: boolean
    pointerId: number | null
    pendingFromInteractive: boolean
  }>({
    startX: 0,
    startOffset: 0,
    active: false,
    captured: false,
    pointerId: null,
    pendingFromInteractive: false,
  })

  const startCapture = useCallback((pointerId: number) => {
    const vp = viewportRef.current
    if (!vp) return
    try {
      vp.setPointerCapture(pointerId)
    } catch {
      // ігноруємо: деякі браузери/стани можуть кинути
    }
  }, [])

  const releaseCapture = useCallback((pointerId: number | null) => {
    const vp = viewportRef.current
    if (!vp || pointerId == null) return
    try {
      vp.releasePointerCapture(pointerId)
    } catch {
      // ігноруємо
    }
  }, [])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!viewportRef.current || n < 2) return
      // only left click / primary pointer
      if (e.pointerType === "mouse" && e.button !== 0) return

      const fromInteractive = isInteractiveTarget(e.target)

      dragStateRef.current = {
        startX: e.clientX,
        startOffset: dragOffset,
        active: true,
        captured: false,
        pointerId: e.pointerId,
        pendingFromInteractive: fromInteractive,
      }

      // Якщо старт НЕ з інтерактивного — поводимось як раніше (захоплюємо одразу).
      if (!fromInteractive) {
        startCapture(e.pointerId)
        dragStateRef.current.captured = true
        setDragging(true)
      }
      // Якщо старт з інтерактивного — НЕ захоплюємо одразу, щоб клік/тап працював.
      // Drag “ввімкнемо” тільки якщо реально потягнули більше порогу.
    },
    [dragOffset, n, startCapture]
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const st = dragStateRef.current
      if (!st.active) return

      const dx = e.clientX - st.startX

      // Якщо почали з лінка/кнопки — не ламаємо клік.
      // Вмикаємо drag тільки якщо реально потягнули.
      if (st.pendingFromInteractive && !st.captured) {
        const THRESHOLD = 6
        if (Math.abs(dx) < THRESHOLD) return

        // Тепер це точно drag — захоплюємо pointer і рухаємо слайдер.
        startCapture(e.pointerId)
        st.captured = true
        st.pendingFromInteractive = false
        setDragging(true)
      }

      if (!st.captured) return

      setDragOffset(st.startOffset + dx)
    },
    [startCapture]
  )

  const endDrag = useCallback(() => {
    const st = dragStateRef.current
    if (!st.active) return

    st.active = false

    // Якщо ми НЕ захопили pointer (тобто це був звичайний клік по a/button) —
    // нічого не “снапимо” і не чіпаємо.
    if (!st.captured) {
      st.pendingFromInteractive = false
      st.pointerId = null
      return
    }

    setDragging(false)

    // snap to nearest slide
    const moved = Math.round(-dragOffset / itemSize)
    setDragOffset(0)
    if (moved !== 0) setIndex((i) => i + moved)

    releaseCapture(st.pointerId)
    st.pointerId = null
    st.captured = false
    st.pendingFromInteractive = false
  }, [dragOffset, itemSize, releaseCapture])

  const onPointerUp = useCallback(() => endDrag(), [endDrag])
  const onPointerCancel = useCallback(() => endDrag(), [endDrag])

  const translateX = useMemo(() => {
    // index points to a slide in the 3x list; dragOffset is temporary
    return -(index * itemSize) + dragOffset
  }, [index, itemSize, dragOffset])

  if (!n) return null

  return (
    <section className="w-full">
      {/* Header: менший відступ + кнопки тут (бо вони клієнтські) */}
      <div className="flex items-end justify-between gap-4 mb-5">
        <div className="min-w-0">
          <div className="text-sm text-gray-600">{title}</div>
          {subtitle ? (
            <p className="mt-1 text-2xl font-semibold text-foreground leading-tight">{subtitle}</p>
          ) : null}
          <p className="mt-2 text-xs text-gray-500">Та йдіть ви в сраку</p>
        </div>

        {/* Controls */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={prev}
            aria-label="Попередні товари"
            className="h-10 w-10 rounded-full border border-muted bg-card shadow-soft hover:shadow-medium transition-shadow grid place-items-center"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Наступні товари"
            className="h-10 w-10 rounded-full border border-muted bg-card shadow-soft hover:shadow-medium transition-shadow grid place-items-center"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Edge fades (підказка що є продовження) */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent z-10" />

        <div
          ref={viewportRef}
          className="overflow-hidden rounded-xl"
          style={{ touchAction: "pan-y" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") prev()
            if (e.key === "ArrowRight") next()
          }}
        >
          <ul
            ref={trackRef}
            className={[
              "flex items-stretch gap-6 py-2 select-none",
              dragging ? "cursor-grabbing" : "cursor-grab",
              jumping || dragging ? "transition-none" : "transition-transform duration-300 ease-out",
            ].join(" ")}
            style={{ transform: `translate3d(${translateX}px, 0, 0)` }}
            aria-roledescription="carousel"
          >
            {loopItems.map((node, i) => (
              <li
                key={`slide-${i}`}
                data-slide={i % n}
                className="shrink-0 h-full
                           w-[260px] sm:w-[280px] md:w-[320px] lg:w-[340px]"
              >
                {/* легке “підняття” картки при hover, щоб було дорожче */}
                <div className="h-full rounded-xl transition-transform duration-200 hover:-translate-y-1">
                  {node}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile controls
        <div className="sm:hidden flex items-center justify-center gap-2 mt-4">
          <button
            type="button"
            onClick={prev}
            aria-label="Попередні товари"
            className="h-11 px-4 rounded-full border border-muted bg-card shadow-soft active:shadow-medium transition-shadow inline-flex items-center gap-2"
          >
            <ChevronLeft className="h-5 w-5" />
            Назад
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Наступні товари"
            className="h-11 px-4 rounded-full border border-muted bg-card shadow-soft active:shadow-medium transition-shadow inline-flex items-center gap-2"
          >
            Далі
            <ChevronRight className="h-5 w-5" />
          </button>
        </div> */}
      </div>
    </section>
  )
}
