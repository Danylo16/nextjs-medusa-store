"use client"

export type SortOptions = "price_asc" | "price_desc" | "created_at"

type SortProductsProps = {
  sortBy: SortOptions
  setQueryParams: (name: string, value: SortOptions) => void
  "data-testid"?: string
}

const sortOptions: { value: SortOptions; label: string; hint?: string }[] = [
  { value: "created_at", label: "Новинки", hint: "Нові надходження" },
  { value: "price_asc", label: "Ціна: від дешевих", hint: "Зростання" },
  { value: "price_desc", label: "Ціна: від дорогих", hint: "Спадання" },
]

const SortProducts = ({
  "data-testid": dataTestId,
  sortBy,
  setQueryParams,
}: SortProductsProps) => {
  return (
    <div data-testid={dataTestId}>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-foreground">Сортування</div>
      </div>

      <div className="space-y-2">
        {sortOptions.map((opt) => {
          const checked = sortBy === opt.value

          return (
            <label
              key={opt.value}
              className={[
                "group flex items-center gap-3 rounded-xl px-3 py-2 cursor-pointer",
                "ring-1 ring-black/5 bg-muted/30 hover:bg-muted/60 transition-colors",
                checked ? "bg-primary/5 ring-primary/25" : "",
              ].join(" ")}
            >
              <input
                type="radio"
                name="sort"
                checked={checked}
                onChange={() => setQueryParams("sortBy", opt.value)}
                className="h-4 w-4 accent-primary"
              />

              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground/90">
                  {opt.label}
                </div>
                {opt.hint ? (
                  <div className="text-xs text-foreground/55">{opt.hint}</div>
                ) : null}
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}

export default SortProducts
