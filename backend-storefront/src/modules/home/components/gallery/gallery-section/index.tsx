"use client"

import { useCallback, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import dynamic from "next/dynamic"

import { projects, categories, INITIAL_COUNT, LOAD_MORE_COUNT } from "../../../config/projects.data"
import type { Project } from "../../../config/projects.data"

type ProjectModalProps = {
  project: Project
  onClose: () => void
}

const ProjectModal = dynamic<ProjectModalProps>(
  () => import("../project-modal").then((mod) => mod.ProjectModal),
  { ssr: false, loading: () => null }
)

export function GallerySection() {
  const [activeFilter, setActiveFilter] = useState<string>("All")
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_COUNT)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const filteredProjects = useMemo(() => {
    if (activeFilter === "All") return projects
    return projects.filter((p) => p.category === activeFilter)
  }, [activeFilter])

  const visibleProjects = useMemo(
    () => filteredProjects.slice(0, visibleCount),
    [filteredProjects, visibleCount]
  )

  const hasMore = visibleCount < filteredProjects.length

  const handleFilterChange = useCallback((category: string) => {
    setActiveFilter(category)
    setVisibleCount(INITIAL_COUNT)
  }, [])

  const handleShowMore = useCallback(() => {
    setVisibleCount((prev) => prev + LOAD_MORE_COUNT)
  }, [])

  const handleCardClick = useCallback((project: Project) => {
    setSelectedProject(project)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedProject(null)
  }, [])

  return (
    <section id="gallery" className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-10 md:mb-14">
        <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-3 text-balance">
        Галерея наших робіт
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto text-pretty">
        Вибір проектів для здоров'я та активного відпочинку
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {categories.map((category) => {
        const isActive = activeFilter === category
        return (
          <button
          key={category}
          type="button"
          onClick={() => handleFilterChange(category)}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 ${
            isActive
            ? "bg-primary text-primary-foreground"
            : "border border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground"
          }`}
          aria-pressed={isActive}
          >
          {category}
          </button>
        )
        })}
      </div>

      {/* Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
        {visibleProjects.map((project, index) => (
        <button
          key={project.id}
          type="button"
          onClick={() => handleCardClick(project)}
          className="break-inside-avoid block w-full group cursor-pointer text-left"
        >
          <div
          className={`relative overflow-hidden rounded-xl transition-all duration-300 ease-out group-hover:scale-[1.02] group-focus:scale-[1.02] ${
            hoveredId === project.id ? "shadow-medium" : "shadow-soft"
          }`}
          onMouseEnter={() => setHoveredId(project.id)}
          onMouseLeave={() => setHoveredId(null)}
          >
          <Image
            src={project.coverSrc || "/placeholder.svg"}
            alt={project.title}
            width={600}
            height={index % 3 === 0 ? 450 : index % 3 === 1 ? 350 : 400}
            className="w-full h-auto object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={index < 2}
          />

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <span className="text-xs text-white/80 uppercase tracking-wide">
            {project.category}
            </span>
            <h3 className="text-white font-medium mt-1">{project.title}</h3>
          </div>

          {project.hasBeforeAfter && (
            <span className="absolute top-3 right-3 bg-secondary text-secondary-foreground text-xs font-medium px-2.5 py-1 rounded-full">
            До / Після
            </span>
          )}
          </div>
        </button>
        ))}
      </div>

      {/* Show More */}
      {hasMore && (
        <div className="flex justify-center mt-10">
        <button
          type="button"
          onClick={handleShowMore}
          className="px-8 py-3 rounded-full text-sm font-medium border border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
        >
          Показати більше
        </button>
        </div>
      )}

      {/* CTA */}
       
      </div>

      {/* Modal */}
      {selectedProject && <ProjectModal project={selectedProject} onClose={handleCloseModal} />}
    </section>
  )
}
