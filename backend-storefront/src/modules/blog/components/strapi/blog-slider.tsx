// "use client"

// import * as React from "react"
// import Image, { type ImageProps } from "next/image"
// import { ChevronLeft, ChevronRight, X } from "lucide-react"
// import { createPortal } from "react-dom"

// type Slide = {
//   src: ImageProps["src"]
//   alt: string
//   caption?: string
//   sizes?: string
//   blurDataURL?: string
// }

// function clamp(n: number, min: number, max: number) {
//   return Math.max(min, Math.min(max, n))
// }

// function usePrefersReducedMotion() {
//   const [reduced, setReduced] = React.useState(false)

//   React.useEffect(() => {
//     const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
//     const update = () => setReduced(mq.matches)
//     update()

//     if (mq.addEventListener) mq.addEventListener("change", update)
//     else mq.addListener(update)

//     return () => {
//       if (mq.removeEventListener) mq.removeEventListener("change", update)
//       else mq.removeListener(update)
//     }
//   }, [])

//   return reduced
// }

// export default function BlogSlider({
//   slides,
//   className = "",
//   aspectClass = "aspect-[16/9]",
// }: {
//   slides: Slide[]
//   className?: string
//   aspectClass?: string
// }) {
//   const viewportRef = React.useRef<HTMLDivElement>(null)
//   const reducedMotion = usePrefersReducedMotion()

//   const [active, setActive] = React.useState(0)
//   const [canPrev, setCanPrev] = React.useState(false)
//   const [canNext, setCanNext] = React.useState(false)

//   const lastFocusRef = React.useRef<HTMLElement | null>(null)

//   const [viewer, setViewer] = React.useState<{ open: boolean; index: number }>({
//     open: false,
//     index: 0,
//   })

//   const drag = React.useRef({
//     active: false,
//     pointerId: -1,
//     startX: 0,
//     startScrollLeft: 0,
//     startIndex: 0,
//     moved: false,
//     justDraggedAt: 0,
//   })

//   const updateStateFromScroll = React.useCallback(() => {
//     const el = viewportRef.current
//     if (!el) return

//     const w = el.clientWidth || 1
//     const idx = clamp(Math.round(el.scrollLeft / w), 0, slides.length - 1)

//     const max = el.scrollWidth - el.clientWidth
//     setActive(idx)
//     setCanPrev(el.scrollLeft > 2)
//     setCanNext(el.scrollLeft < max - 2)
//   }, [slides.length])

//   React.useEffect(() => {
//     const el = viewportRef.current
//     if (!el) return

//     updateStateFromScroll()

//     let raf = 0
//     const onScroll = () => {
//       cancelAnimationFrame(raf)
//       raf = requestAnimationFrame(updateStateFromScroll)
//     }

//     el.addEventListener("scroll", onScroll, { passive: true })

//     const ro = new ResizeObserver(() => updateStateFromScroll())
//     ro.observe(el)

//     return () => {
//       cancelAnimationFrame(raf)
//       el.removeEventListener("scroll", onScroll)
//       ro.disconnect()
//     }
//   }, [updateStateFromScroll])

//   const scrollToIndex = React.useCallback(
//     (i: number) => {
//       const el = viewportRef.current
//       if (!el) return

//       const idx = clamp(i, 0, slides.length - 1)
//       const left = idx * el.clientWidth

//       el.scrollTo({
//         left,
//         behavior: reducedMotion ? "auto" : "smooth",
//       })
//     },
//     [slides.length, reducedMotion]
//   )

//   const snapToNearest = React.useCallback(() => {
//     const el = viewportRef.current
//     if (!el) return
//     const w = el.clientWidth || 1
//     const idx = clamp(Math.round(el.scrollLeft / w), 0, slides.length - 1)
//     scrollToIndex(idx)
//   }, [slides.length, scrollToIndex])

//   const prev = React.useCallback(() => scrollToIndex(active - 1), [active, scrollToIndex])
//   const next = React.useCallback(() => scrollToIndex(active + 1), [active, scrollToIndex])

//   const openViewer = React.useCallback((index: number) => {
//     lastFocusRef.current = document.activeElement as HTMLElement | null
//     setViewer({ open: true, index })
//   }, [])

//   const closeViewer = React.useCallback(() => {
//     setViewer((v) => ({ ...v, open: false }))
//     queueMicrotask(() => lastFocusRef.current?.focus?.())
//   }, [])

//   // Drag handling
//   const onPointerDown = (e: React.PointerEvent) => {
//     const el = viewportRef.current
//     if (!el) return
//     if (e.pointerType === "mouse" && e.button !== 0) return

//     drag.current.active = true
//     drag.current.pointerId = e.pointerId
//     drag.current.startX = e.clientX
//     drag.current.startScrollLeft = el.scrollLeft
//     drag.current.startIndex = active
//     drag.current.moved = false

//     el.setPointerCapture(e.pointerId)
//   }

//   const onPointerMove = (e: React.PointerEvent) => {
//     const el = viewportRef.current
//     if (!el) return
//     if (!drag.current.active) return

//     const dx = e.clientX - drag.current.startX
//     if (Math.abs(dx) > 6) drag.current.moved = true

//     el.scrollLeft = drag.current.startScrollLeft - dx
//   }

//   const endDrag = (e?: React.PointerEvent) => {
//     const el = viewportRef.current
//     if (!el) return
//     if (!drag.current.active) return

//     drag.current.active = false
//     drag.current.pointerId = -1

//     const w = el.clientWidth || 1
//     const dx = e ? e.clientX - drag.current.startX : 0
//     const ratio = dx / w

//     if (drag.current.moved) {
//       drag.current.justDraggedAt = performance.now()

//       const threshold = 0.18
//       if (ratio > threshold) scrollToIndex(drag.current.startIndex - 1)
//       else if (ratio < -threshold) scrollToIndex(drag.current.startIndex + 1)
//       else snapToNearest()
//     } else {
//       snapToNearest()
//     }
//   }

//   const onKeyDownCarousel = (e: React.KeyboardEvent) => {
//     if (e.key === "ArrowLeft") {
//       e.preventDefault()
//       prev()
//     } else if (e.key === "ArrowRight") {
//       e.preventDefault()
//       next()
//     } else if (e.key === "Enter" || e.key === " ") {
//       e.preventDefault()
//       openViewer(active)
//     }
//   }

//   const onViewportClick = () => {
//     // після drag — не відкривати
//     if (performance.now() - drag.current.justDraggedAt < 250) return
//     openViewer(active)
//   }

//   if (!slides?.length) return null
//   const activeSlide = slides[active]

//   return (
//     <section
//       className={["relative", className].join(" ")}
//       aria-roledescription="carousel"
//       aria-label="Галерея зображень"
//     >
//       <div className="group relative">
//         <div
//           ref={viewportRef}
//           tabIndex={0}
//           onKeyDown={onKeyDownCarousel}
//           onClick={onViewportClick}
//           onPointerDown={onPointerDown}
//           onPointerMove={onPointerMove}
//           onPointerUp={endDrag}
//           onPointerCancel={endDrag}
//           onPointerLeave={() => endDrag()}
//           className={[
//             "relative overflow-x-auto overflow-y-hidden",
//             "snap-x snap-mandatory",
//             "no-scrollbar",
//             "cursor-grab active:cursor-grabbing select-none focus:outline-none",
//             // чистий “преміум” контейнер без білої картки
//             "rounded-2xl ring-1 ring-foreground/10 bg-foreground/[0.02]",
//           ].join(" ")}
//           style={{ touchAction: "pan-y" }}
//         >
//           <div className="flex w-full">
//             {slides.map((s, i) => (
//               <figure
//                 key={i}
//                 className="w-full shrink-0 snap-center"
//                 aria-label={`Слайд ${i + 1} з ${slides.length}`}
//               >
//                 <div className={["relative w-full", aspectClass].join(" ")}>
//                   <Image
//                     src={s.src}
//                     alt={s.alt}
//                     fill
//                     draggable={false}
//                     priority={i === 0}
//                     sizes={s.sizes ?? "100vw"}
//                     placeholder={s.blurDataURL ? "blur" : "empty"}
//                     blurDataURL={s.blurDataURL}
//                     className="object-cover"
//                   />

//                   {/* легкий градієнт */}
//                   <div
//                     aria-hidden="true"
//                     className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10"
//                   />

//                   {/* лічильник зверху (без навігації знизу) */}
//                   {slides.length > 1 && (
//                     <div className="pointer-events-none absolute left-3 top-3">
//                       <div className="rounded-full bg-black/35 px-3 py-1 text-[11px] tabular-nums text-white/85 backdrop-blur">
//                         {i + 1}/{slides.length}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </figure>
//             ))}
//           </div>
//         </div>

//         {/* Стрілки тільки на desktop, і тільки коли наведено */}
//         {slides.length > 1 && (
//           <>
//             <button
//               type="button"
//               aria-label="Попередній слайд"
//               onClick={(e) => {
//                 e.stopPropagation()
//                 prev()
//               }}
//               disabled={!canPrev}
//               className={[
//                 "absolute left-3 top-1/2 -translate-y-1/2",
//                 "hidden md:flex items-center justify-center",
//                 "h-11 w-11 rounded-full",
//                 "border border-white/15 bg-black/35 text-white backdrop-blur",
//                 "shadow-medium transition",
//                 "opacity-0 group-hover:opacity-100",
//                 "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/35",
//                 "disabled:opacity-0 disabled:group-hover:opacity-30 disabled:cursor-not-allowed",
//               ].join(" ")}
//             >
//               <ChevronLeft size={20} />
//             </button>

//             <button
//               type="button"
//               aria-label="Наступний слайд"
//               onClick={(e) => {
//                 e.stopPropagation()
//                 next()
//               }}
//               disabled={!canNext}
//               className={[
//                 "absolute right-3 top-1/2 -translate-y-1/2",
//                 "hidden md:flex items-center justify-center",
//                 "h-11 w-11 rounded-full",
//                 "border border-white/15 bg-black/35 text-white backdrop-blur",
//                 "shadow-medium transition",
//                 "opacity-0 group-hover:opacity-100",
//                 "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/35",
//                 "disabled:opacity-0 disabled:group-hover:opacity-30 disabled:cursor-not-allowed",
//               ].join(" ")}
//             >
//               <ChevronRight size={20} />
//             </button>
//           </>
//         )}
//       </div>

//       {/* Підпис знизу — ТІЛЬКИ активного слайда */}
//       {activeSlide?.caption ? (
//         <div className="mt-2 text-center text-xs text-black/45">{activeSlide.caption}</div>
//       ) : null}

//       <Lightbox
//         slides={slides}
//         open={viewer.open}
//         index={viewer.index}
//         onChangeIndex={(idx) => setViewer((v) => ({ ...v, index: idx }))}
//         onClose={closeViewer}
//         aspectClass={aspectClass}
//       />
//     </section>
//   )
// }

// function Lightbox({
//   slides,
//   open,
//   index,
//   onChangeIndex,
//   onClose,
//   aspectClass,
// }: {
//   slides: Slide[]
//   open: boolean
//   index: number
//   onChangeIndex: (i: number) => void
//   onClose: () => void
//   aspectClass: string
// }) {
//   const closeBtnRef = React.useRef<HTMLButtonElement>(null)
//   const [mounted, setMounted] = React.useState(false)

//   React.useEffect(() => setMounted(true), [])

//   React.useEffect(() => {
//     if (!open) return
//     const prev = document.body.style.overflow
//     document.body.style.overflow = "hidden"
//     closeBtnRef.current?.focus()
//     return () => {
//       document.body.style.overflow = prev
//     }
//   }, [open])

//   React.useEffect(() => {
//     if (!open) return
//     const onKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose()
//       if (e.key === "ArrowLeft") onChangeIndex(clamp(index - 1, 0, slides.length - 1))
//       if (e.key === "ArrowRight") onChangeIndex(clamp(index + 1, 0, slides.length - 1))
//     }
//     window.addEventListener("keydown", onKeyDown)
//     return () => window.removeEventListener("keydown", onKeyDown)
//   }, [open, index, slides.length, onClose, onChangeIndex])

//   // swipe
//   const swipe = React.useRef({ x: 0, active: false })
//   const onPointerDown = (e: React.PointerEvent) => {
//     swipe.current.active = true
//     swipe.current.x = e.clientX
//     ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
//   }
//   const onPointerUp = (e: React.PointerEvent) => {
//     if (!swipe.current.active) return
//     swipe.current.active = false
//     const dx = e.clientX - swipe.current.x
//     const threshold = 60
//     if (dx > threshold) onChangeIndex(clamp(index - 1, 0, slides.length - 1))
//     if (dx < -threshold) onChangeIndex(clamp(index + 1, 0, slides.length - 1))
//   }

//   if (!open || !mounted) return null
//   const s = slides[index]

//   const ui = (
//     <div
//       role="dialog"
//       aria-modal="true"
//       aria-label="Перегляд зображення"
//       className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm"
//       onMouseDown={(e) => {
//         if (e.target === e.currentTarget) onClose()
//       }}
//     >
//       {/* Top bar */}
//       <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-4 py-4">
//         <div className="text-[11px] tabular-nums text-white/75">
//           {index + 1}/{slides.length}
//         </div>

//         <button
//           ref={closeBtnRef}
//           type="button"
//           aria-label="Закрити"
//           onClick={onClose}
//           className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/35"
//         >
//           <X size={18} />
//         </button>
//       </div>

//       {/* Arrows */}
//       <button
//         type="button"
//         aria-label="Попереднє"
//         onClick={() => onChangeIndex(clamp(index - 1, 0, slides.length - 1))}
//         disabled={index === 0}
//         className="absolute left-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur hover:bg-white/15 disabled:opacity-30 md:flex"
//       >
//         <ChevronLeft size={22} />
//       </button>

//       <button
//         type="button"
//         aria-label="Наступне"
//         onClick={() => onChangeIndex(clamp(index + 1, 0, slides.length - 1))}
//         disabled={index === slides.length - 1}
//         className="absolute right-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur hover:bg-white/15 disabled:opacity-30 md:flex"
//       >
//         <ChevronRight size={22} />
//       </button>

//       {/* Content */}
//       <div
//         className="flex h-full w-full items-center justify-center px-3 py-16"
//         onPointerDown={onPointerDown}
//         onPointerUp={onPointerUp}
//         style={{ touchAction: "none" }}
//       >
//         <div className="w-full max-w-6xl">
//           <div className="relative overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
//             <div className={["relative w-full", aspectClass].join(" ")}>
//               <Image
//                 src={s.src}
//                 alt={s.alt}
//                 fill
//                 sizes="100vw"
//                 placeholder={s.blurDataURL ? "blur" : "empty"}
//                 blurDataURL={s.blurDataURL}
//                 className="object-contain"
//               />
//             </div>
//           </div>

//           {s.caption ? (
//             <div className="mt-3 px-1 text-center text-xs text-white/70">
//               {s.caption}
//             </div>
//           ) : null}
//         </div>
//       </div>
//     </div>
//   )

//   return createPortal(ui, document.body)
// }
"use client"

import * as React from "react"
import Image, { type ImageProps } from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { createPortal } from "react-dom"

type Slide = {
    src: ImageProps["src"]
    alt: string
    caption?: string
    sizes?: string
    blurDataURL?: string
}

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n))
}

function usePrefersReducedMotion() {
    const [reduced, setReduced] = React.useState(false)

    React.useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        const update = () => setReduced(mq.matches)
        update()

        if (mq.addEventListener) mq.addEventListener("change", update)
        else mq.addListener(update)

        return () => {
            if (mq.removeEventListener) mq.removeEventListener("change", update)
            else mq.removeListener(update)
        }
    }, [])

    return reduced
}

export default function BlogSlider({
    slides,
    className = "",
    aspectClass = "aspect-[16/9]",
}: {
    slides: Slide[]
    className?: string
    aspectClass?: string
}) {
    const viewportRef = React.useRef<HTMLDivElement>(null)
    const reducedMotion = usePrefersReducedMotion()

    const [active, setActive] = React.useState(0)
    const [canPrev, setCanPrev] = React.useState(false)
    const [canNext, setCanNext] = React.useState(false)

    const lastFocusRef = React.useRef<HTMLElement | null>(null)

    const [viewer, setViewer] = React.useState<{ open: boolean; index: number }>({
        open: false,
        index: 0,
    })

    const drag = React.useRef({
        active: false,
        pointerId: -1,
        startX: 0,
        startScrollLeft: 0,
        startIndex: 0,
        moved: false,
        justDraggedAt: 0,
    })

    const updateStateFromScroll = React.useCallback(() => {
        const el = viewportRef.current
        if (!el) return

        const w = el.clientWidth || 1
        const idx = clamp(Math.round(el.scrollLeft / w), 0, slides.length - 1)

        const max = el.scrollWidth - el.clientWidth
        setActive(idx)
        setCanPrev(el.scrollLeft > 2)
        setCanNext(el.scrollLeft < max - 2)
    }, [slides.length])

    React.useEffect(() => {
        const el = viewportRef.current
        if (!el) return

        updateStateFromScroll()

        let raf = 0
        const onScroll = () => {
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(updateStateFromScroll)
        }

        el.addEventListener("scroll", onScroll, { passive: true })

        const ro = new ResizeObserver(() => updateStateFromScroll())
        ro.observe(el)

        return () => {
            cancelAnimationFrame(raf)
            el.removeEventListener("scroll", onScroll)
            ro.disconnect()
        }
    }, [updateStateFromScroll])

    const scrollToIndex = React.useCallback(
        (i: number) => {
            const el = viewportRef.current
            if (!el) return

            const idx = clamp(i, 0, slides.length - 1)
            const left = idx * el.clientWidth

            el.scrollTo({
                left,
                behavior: reducedMotion ? "auto" : "smooth",
            })
        },
        [slides.length, reducedMotion]
    )

    const snapToNearest = React.useCallback(() => {
        const el = viewportRef.current
        if (!el) return
        const w = el.clientWidth || 1
        const idx = clamp(Math.round(el.scrollLeft / w), 0, slides.length - 1)
        scrollToIndex(idx)
    }, [slides.length, scrollToIndex])

    const prev = React.useCallback(() => scrollToIndex(active - 1), [active, scrollToIndex])
    const next = React.useCallback(() => scrollToIndex(active + 1), [active, scrollToIndex])

    const openViewer = React.useCallback(
        (index: number) => {
            lastFocusRef.current = document.activeElement as HTMLElement | null
            setViewer({ open: true, index })
        },
        []
    )

    const closeViewer = React.useCallback(() => {
        setViewer((v) => ({ ...v, open: false }))
        queueMicrotask(() => lastFocusRef.current?.focus?.())
    }, [])

    // Drag handling (carousel)
    const onPointerDown = (e: React.PointerEvent) => {
        const el = viewportRef.current
        if (!el) return
        if (e.pointerType === "mouse" && e.button !== 0) return

        drag.current.active = true
        drag.current.pointerId = e.pointerId
        drag.current.startX = e.clientX
        drag.current.startScrollLeft = el.scrollLeft
        drag.current.startIndex = active
        drag.current.moved = false

        el.setPointerCapture(e.pointerId)
    }

    const onPointerMove = (e: React.PointerEvent) => {
        const el = viewportRef.current
        if (!el) return
        if (!drag.current.active) return

        const dx = e.clientX - drag.current.startX
        if (Math.abs(dx) > 6) drag.current.moved = true

        el.scrollLeft = drag.current.startScrollLeft - dx
    }

    const endDrag = (e?: React.PointerEvent) => {
        const el = viewportRef.current
        if (!el) return
        if (!drag.current.active) return

        drag.current.active = false
        drag.current.pointerId = -1

        const w = el.clientWidth || 1
        const dx = e ? e.clientX - drag.current.startX : 0
        const ratio = dx / w

        if (drag.current.moved) {
            drag.current.justDraggedAt = performance.now()
            const threshold = 0.18
            if (ratio > threshold) scrollToIndex(drag.current.startIndex - 1)
            else if (ratio < -threshold) scrollToIndex(drag.current.startIndex + 1)
            else snapToNearest()
        } else {
            snapToNearest()
        }
    }

    const onKeyDownCarousel = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowLeft") {
            e.preventDefault()
            prev()
        } else if (e.key === "ArrowRight") {
            e.preventDefault()
            next()
        } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            openViewer(active)
        }
    }

    const onViewportClick = () => {
        // Don't open after drag
        if (performance.now() - drag.current.justDraggedAt < 250) return
        openViewer(active)
    }

    if (!slides?.length) return null
    const activeSlide = slides[active]

    return (
        <section
            className={["relative", className].join(" ")}
            aria-roledescription="carousel"
            aria-label="Image gallery"
        >
            <div className="group relative">
                <div
                    ref={viewportRef}
                    tabIndex={0}
                    onKeyDown={onKeyDownCarousel}
                    onClick={onViewportClick}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    onPointerLeave={() => endDrag()}
                    className={[
                        "relative overflow-x-auto overflow-y-hidden",
                        "snap-x snap-mandatory",
                        "no-scrollbar",
                        "cursor-grab active:cursor-grabbing select-none focus:outline-none",
                        "rounded-2xl ring-1 ring-foreground/10 bg-foreground/[0.02]",
                    ].join(" ")}
                    style={{ touchAction: "pan-y" }}
                >
                    <div className="flex w-full">
                        {slides.map((s, i) => (
                            <figure
                                key={i}
                                className="w-full shrink-0 snap-center"
                                aria-label={`Slide ${i + 1} of ${slides.length}`}
                            >
                                <div className={["relative w-full", aspectClass].join(" ")}>
                                    <Image
                                        src={s.src}
                                        alt={s.alt}
                                        fill
                                        draggable={false}
                                        priority={i === 0}
                                        sizes={s.sizes ?? "100vw"}
                                        placeholder={s.blurDataURL ? "blur" : "empty"}
                                        blurDataURL={s.blurDataURL}
                                        className="object-cover"
                                    />

                                    {/* Subtle gradient overlay */}
                                    <div
                                        aria-hidden="true"
                                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10"
                                    />

                                    {/* Slide counter (top left) */}
                                    {slides.length > 1 && (
                                        <div className="pointer-events-none absolute left-3 top-3">
                                            <div className="rounded-full bg-black/35 px-3 py-1 text-[11px] tabular-nums text-white/85 backdrop-blur">
                                                {i + 1}/{slides.length}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </figure>
                        ))}
                    </div>
                </div>

                {/* Navigation arrows (desktop only, visible on hover) */}
                {slides.length > 1 && (
                    <>
                        <button
                            type="button"
                            aria-label="Previous slide"
                            onClick={(e) => {
                                e.stopPropagation()
                                prev()
                            }}
                            disabled={!canPrev}
                            className={[
                                "absolute left-3 top-1/2 -translate-y-1/2",
                                "hidden md:flex items-center justify-center",
                                "h-11 w-11 rounded-full",
                                "border border-white/15 bg-black/35 text-white backdrop-blur",
                                "shadow-medium transition",
                                "opacity-0 group-hover:opacity-100",
                                "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/35",
                                "disabled:opacity-0 disabled:group-hover:opacity-30 disabled:cursor-not-allowed",
                            ].join(" ")}
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <button
                            type="button"
                            aria-label="Next slide"
                            onClick={(e) => {
                                e.stopPropagation()
                                next()
                            }}
                            disabled={!canNext}
                            className={[
                                "absolute right-3 top-1/2 -translate-y-1/2",
                                "hidden md:flex items-center justify-center",
                                "h-11 w-11 rounded-full",
                                "border border-white/15 bg-black/35 text-white backdrop-blur",
                                "shadow-medium transition",
                                "opacity-0 group-hover:opacity-100",
                                "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/35",
                                "disabled:opacity-0 disabled:group-hover:opacity-30 disabled:cursor-not-allowed",
                            ].join(" ")}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </>
                )}
            </div>

            {/* Caption below (active slide only) */}
            {activeSlide?.caption ? (
                <div className="mt-3 text-center text-sm sm:text-base leading-relaxed text-black/55">
                    {activeSlide.caption}
                </div>
            ) : null}

            <Lightbox
                slides={slides}
                open={viewer.open}
                index={viewer.index}
                onChangeIndex={(idx) => setViewer((v) => ({ ...v, index: idx }))}
                onClose={closeViewer}
            />
        </section>
    )
}

function Lightbox({
    slides,
    open,
    index,
    onChangeIndex,
    onClose,
}: {
    slides: Slide[]
    open: boolean
    index: number
    onChangeIndex: (i: number) => void
    onClose: () => void
}) {
    const closeBtnRef = React.useRef<HTMLButtonElement>(null)
    const frameRef = React.useRef<HTMLDivElement>(null)

    const [mounted, setMounted] = React.useState(false)
    React.useEffect(() => setMounted(true), [])

    // Zoom state
    const [zoom, setZoom] = React.useState(1) // 1 or >1
    const [offset, setOffset] = React.useState({ x: 0, y: 0 })
    const [origin, setOrigin] = React.useState({ x: 50, y: 50 }) // % %
    const [dragging, setDragging] = React.useState(false)

    const gesture = React.useRef({
        active: false,
        mode: "swipe" as "swipe" | "pan",
        startX: 0,
        startY: 0,
        startOffX: 0,
        startOffY: 0,
        moved: false,
    })

    const clampOffset = React.useCallback(
        (x: number, y: number) => {
            const el = frameRef.current
            if (!el) return { x, y }
            const r = el.getBoundingClientRect()

            // Half of the "excess" — sufficient for good UX
            const maxX = ((zoom - 1) * r.width) / 2
            const maxY = ((zoom - 1) * r.height) / 2

            return {
                x: clamp(x, -maxX, maxX),
                y: clamp(y, -maxY, maxY),
            }
        },
        [zoom]
    )

    const resetZoom = React.useCallback(() => {
        setZoom(1)
        setOffset({ x: 0, y: 0 })
        setOrigin({ x: 50, y: 50 })
    }, [])

    const toggleZoomAt = React.useCallback(
        (clientX: number, clientY: number) => {
            const el = frameRef.current
            if (!el) return

            if (zoom > 1) {
                resetZoom()
                return
            }

            const r = el.getBoundingClientRect()
            const px = ((clientX - r.left) / r.width) * 100
            const py = ((clientY - r.top) / r.height) * 100

            setOrigin({ x: clamp(px, 0, 100), y: clamp(py, 0, 100) })
            setOffset({ x: 0, y: 0 })
            setZoom(2.4) // Shop-style zoom level
        },
        [zoom, resetZoom]
    )

    React.useEffect(() => {
        if (!open) return
        const prev = document.body.style.overflow
        document.body.style.overflow = "hidden"
        closeBtnRef.current?.focus()
        return () => {
            document.body.style.overflow = prev
        }
    }, [open])

    React.useEffect(() => {
        if (!open) return
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
            if (e.key === "ArrowLeft") {
                resetZoom()
                onChangeIndex(clamp(index - 1, 0, slides.length - 1))
            }
            if (e.key === "ArrowRight") {
                resetZoom()
                onChangeIndex(clamp(index + 1, 0, slides.length - 1))
            }
        }
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [open, index, slides.length, onClose, onChangeIndex, resetZoom])

    React.useEffect(() => {
        if (!open) return
        resetZoom()
    }, [index, open, resetZoom])

    const onPointerDown = (e: React.PointerEvent) => {
        const el = frameRef.current
        if (!el) return

        setDragging(true)
        gesture.current.active = true
        gesture.current.startX = e.clientX
        gesture.current.startY = e.clientY
        gesture.current.startOffX = offset.x
        gesture.current.startOffY = offset.y
        gesture.current.moved = false
        gesture.current.mode = zoom > 1 ? "pan" : "swipe"

        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    }

    const onPointerMove = (e: React.PointerEvent) => {
        if (!gesture.current.active) return

        const dx = e.clientX - gesture.current.startX
        const dy = e.clientY - gesture.current.startY
        if (Math.abs(dx) > 6 || Math.abs(dy) > 6) gesture.current.moved = true

        if (gesture.current.mode === "pan") {
            const next = clampOffset(gesture.current.startOffX + dx, gesture.current.startOffY + dy)
            setOffset(next)
        }
    }

    const onPointerUp = (e: React.PointerEvent) => {
        if (!gesture.current.active) return
        gesture.current.active = false
        setDragging(false)

        const dx = e.clientX - gesture.current.startX

        // SWIPE (when not zoomed)
        if (zoom === 1 && gesture.current.moved) {
            const threshold = 70
            if (dx > threshold) {
                onChangeIndex(clamp(index - 1, 0, slides.length - 1))
                return
            }
            if (dx < -threshold) {
                onChangeIndex(clamp(index + 1, 0, slides.length - 1))
                return
            }
            return
        }

        // CLICK (without movement) => zoom like in stores
        if (!gesture.current.moved) {
            toggleZoomAt(e.clientX, e.clientY)
        }
    }

    if (!open || !mounted) return null
    const s = slides[index]

    const ui = (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm"
            onPointerDown={(e) => {
                // Click on black background — close
                if (e.target === e.currentTarget) onClose()
            }}
        >
            {/* Top bar */}
            <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-4 py-4">
                <div className="text-[11px] tabular-nums text-white/75">
                    {index + 1}/{slides.length}
                </div>

                <button
                    ref={closeBtnRef}
                    type="button"
                    aria-label="Close"
                    onClick={onClose}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/35"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Navigation arrows (desktop) */}
            <button
                type="button"
                aria-label="Previous"
                onClick={() => {
                    resetZoom()
                    onChangeIndex(clamp(index - 1, 0, slides.length - 1))
                }}
                disabled={index === 0}
                className="absolute left-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur hover:bg-white/15 disabled:opacity-30 md:flex"
            >
                <ChevronLeft size={22} />
            </button>

            <button
                type="button"
                aria-label="Next"
                onClick={() => {
                    resetZoom()
                    onChangeIndex(clamp(index + 1, 0, slides.length - 1))
                }}
                disabled={index === slides.length - 1}
                className="absolute right-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur hover:bg-white/15 disabled:opacity-30 md:flex"
            >
                <ChevronRight size={22} />
            </button>

            {/* Content */}
            <div className="flex h-full w-full items-center justify-center px-3 py-16">
                <div className="w-full max-w-6xl">
                    <div
                        ref={frameRef}
                        className={[
                            "relative overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10",
                            zoom === 1 ? "cursor-zoom-in" : "cursor-grab active:cursor-grabbing",
                        ].join(" ")}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerCancel={() => {
                            gesture.current.active = false
                            setDragging(false)
                        }}
                        style={{ touchAction: "none" }}
                    >
                        <div className="relative h-[78vh] w-full">
                            <div
                                className="absolute inset-0 will-change-transform"
                                style={{
                                    transformOrigin: `${origin.x}% ${origin.y}%`,
                                    transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
                                    transition: dragging ? "none" : "transform 160ms ease",
                                }}
                            >
                                <Image
                                    src={s.src}
                                    alt={s.alt}
                                    fill
                                    sizes="100vw"
                                    placeholder={s.blurDataURL ? "blur" : "empty"}
                                    blurDataURL={s.blurDataURL}
                                    className="object-contain"
                                    draggable={false}
                                />
                            </div>
                        </div>
                    </div>

                    {s.caption ? (
                        <div className="mt-4 px-1 text-center text-sm sm:text-base leading-relaxed text-white/75">
                            {s.caption}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    )

    return createPortal(ui, document.body)
}
