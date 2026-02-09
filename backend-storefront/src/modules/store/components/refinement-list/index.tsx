"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"
import SortProducts, { SortOptions } from "./sort-products"

type CategoryFilter = { id: string; name: string }

type RefinementListProps = {
  sortBy: SortOptions
  categories?: CategoryFilter[]
  "data-testid"?: string
}

const PARAM_CATEGORIES = "categories" // comma-separated ids

const RefinementList = ({
  sortBy,
  categories = [],
  "data-testid": dataTestId,
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const selectedCategoryIds = useMemo(() => {
    const raw = searchParams.get(PARAM_CATEGORIES) || ""
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  }, [searchParams])

  const pushParams = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams)
      updater(params)
      params.delete("page") // будь-яка зміна фільтрів скидає пагінацію

      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    },
    [router, pathname, searchParams]
  )

  const setQueryParams = (name: string, value: string) => {
    pushParams((params) => params.set(name, value))
  }

  const toggleCategory = (id: string) => {
    pushParams((params) => {
      const set = new Set(selectedCategoryIds)
      set.has(id) ? set.delete(id) : set.add(id)
      const next = Array.from(set)
      next.length
        ? params.set(PARAM_CATEGORIES, next.join(","))
        : params.delete(PARAM_CATEGORIES)
    })
  }

  const resetAll = () => router.push(pathname)

  const hasAnyFilter =
    (searchParams.get(PARAM_CATEGORIES) || "").trim().length > 0 ||
    (searchParams.get("sortBy") || "").trim().length > 0 ||
    (searchParams.get("page") || "").trim().length > 0

  return (
    <div className="space-y-6" data-testid={dataTestId}>
      <SortProducts
        sortBy={sortBy}
        setQueryParams={(name, value) => setQueryParams(name, value)}
      />

      {categories.length > 0 && (
        <div className="pt-2 border-t border-black/5">
          <div className="mb-3 text-sm font-semibold text-foreground">
            Категорії
          </div>

          <div className="space-y-2">
            {categories.map((c) => {
              const checked = selectedCategoryIds.includes(c.id)

              return (
                <label
  key={c.id}
  className={[
    "flex items-center gap-3 rounded-xl px-3 py-2 cursor-pointer", // ✅ items-center
    "ring-1 ring-black/5 bg-muted/20 hover:bg-muted/60 transition-colors",
    checked ? "bg-primary/5 ring-primary/25" : "",
  ].join(" ")}
>
  {/* ✅ Consistent checkbox + centered checkmark */}
  <span className="relative h-5 w-5 shrink-0">
    <input
      type="checkbox"
      checked={checked}
      onChange={() => toggleCategory(c.id)}
      className={[
        "peer absolute inset-0",
        "appearance-none rounded-[6px]",
        "bg-white ring-1 ring-black/15",
        "transition-colors",
        "hover:ring-black/25",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        "checked:bg-primary checked:ring-primary/40",
      ].join(" ")}
    />

    <svg
      viewBox="0 0 24 24"
      className="pointer-events-none absolute inset-0 m-auto h-4 w-4 opacity-0 peer-checked:opacity-100"
      aria-hidden="true"
    >
      <path
        d="M6 12.5l4 4L18.5 8"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>

  <span className="text-sm text-foreground/90 leading-snug">
    {c.name}
  </span>
</label> 
              )
            })}
          </div>
        </div>
      )}

      {hasAnyFilter && (
        <button
          type="button"
          onClick={resetAll}
          className="w-full rounded-xl px-4 py-2 text-sm font-semibold ring-1 ring-black/10 hover:bg-muted/60 transition-colors"
        >
          Скинути
        </button>
      )}
    </div>
  )
}

export default RefinementList
