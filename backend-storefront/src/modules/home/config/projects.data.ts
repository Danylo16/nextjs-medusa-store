// src/modules/home/components/gallery/projects.data.ts
export type Project = {
  id: string
  title: string
  category: string
  tags: string[]
  coverSrc: string
  gallerySrcs: string[]
  hasBeforeAfter: boolean
  beforeSrc?: string
  afterSrc?: string
}

export const projects: Project[] = [
  {
    id: "p1",
    title: "Сучасні ЛФК центри",
    category: "ЛФК",
    tags: ["Реабілітація", "Відновлення"],
    coverSrc: "/images/projects/p1-cover.jpg",
    gallerySrcs: ["/images/hero-categories/rehab-benches.jpg"],
    hasBeforeAfter: true,
    beforeSrc: "/images/projects/p1-before.jpg",
    afterSrc: "/images/projects/p1-after.jpg",
  },
  {
    id: "p2",
    title: "Old Rehab Center",
    category: "Центри відновлення",
    tags: ["Healthcare", "Professional"],
    coverSrc: "/images/projects/p2-cover.jpg",
    gallerySrcs: ["/images/hero-categories/rehab-benches.jpg"],
    hasBeforeAfter: false,
     
  }
   
]

export const categories = ["All", "ЛФК", "Центри відновлення", "Sports", "Coverings"] as const

export const INITIAL_COUNT = 9
export const LOAD_MORE_COUNT = 6
