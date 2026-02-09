"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Image from "next/image"
import type { Project } from "../../../config/projects.data"

type ProjectModalProps = {
  project: Project
  onClose: () => void
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [splitPosition, setSplitPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const splitContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }

    document.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [onClose])

  useEffect(() => {
    modalRef.current?.focus()
  }, [])

  const handleDragStart = useCallback(() => setIsDragging(true), [])
  const handleDragEnd = useCallback(() => setIsDragging(false), [])

  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!isDragging || !splitContainerRef.current) return
      const rect = splitContainerRef.current.getBoundingClientRect()
      const x = clientX - rect.left
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
      setSplitPosition(percentage)
    },
    [isDragging]
  )

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      handleDragMove(e.clientX)
    }
    function handleTouchMove(e: TouchEvent) {
      handleDragMove(e.touches[0].clientX)
    }
    function handleUp() {
      handleDragEnd()
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleUp)
      document.addEventListener("touchmove", handleTouchMove)
      document.addEventListener("touchend", handleUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleUp)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleUp)
    }
  }, [isDragging, handleDragMove, handleDragEnd])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-card rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col outline-none"
        style={{ boxShadow: "var(--shadow-medium)" }}
      >
        <div className="p-5 border-b border-border flex items-start justify-between">
          <div>
            <h2 id="modal-title" className="text-xl font-semibold text-foreground">
              {project.title}
            </h2>
            <div className="flex flex-wrap gap-2 mt-2">
              {project.tags.map((tag) => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {project.hasBeforeAfter && project.beforeSrc && project.afterSrc && (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-3">Перетягніть, щоб порівняти до та після</p>

              <div
                ref={splitContainerRef}
                className="relative w-full aspect-[16/10] rounded-xl overflow-hidden cursor-ew-resize select-none"
              >
                <Image
                  src={project.afterSrc || "/placeholder.svg"}
                  alt={`${project.title} - After`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 700px"
                />

                <div className="absolute inset-0 overflow-hidden" style={{ width: `${splitPosition}%` }}>
                  <Image
                    src={project.beforeSrc || "/placeholder.svg"}
                    alt={`${project.title} - Before`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 700px"
                  />
                </div>

                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
                  style={{ left: `${splitPosition}%`, transform: "translateX(-50%)" }}
                  onMouseDown={handleDragStart}
                  onTouchStart={handleDragStart}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </div>
                </div>

                <span className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded">Before</span>
                <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">After</span>
              </div>
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground mb-3">Project Gallery</p>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar" style={{ scrollSnapType: "x mandatory" }}>
              {project.gallerySrcs.map((src, index) => (
                <div
                  key={`${project.id}-${src}-${index}`}
                  className="flex-shrink-0 w-64 h-44 relative rounded-lg overflow-hidden"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <Image src={src || "/placeholder.svg"} alt={`${project.title} - Image ${index + 1}`} fill className="object-cover" sizes="256px" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
