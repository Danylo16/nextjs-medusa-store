"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

type HeaderSearchProps = {
  className?: string
}

export default function HeaderSearch({ className = "" }: HeaderSearchProps) {
  const [value, setValue] = useState("")
  const router = useRouter()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const q = value.trim()
    if (!q) return

    router.push(`search?q=${encodeURIComponent(q)}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative w-full ${className}`}
    >
      <input
        type="search"
        placeholder="Search..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="
          w-full
          h-10 md:h-11
          rounded-full
          px-4 pl-10
          text-sm text-foreground
          placeholder:text-muted-foreground
          bg-[oklch(0.94_0_0)]     
          border border-transparent
          shadow-sm
          focus:outline-none
          focus:ring-2 focus:ring-primary focus:ring-offset-0
        "
      />
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
      />
    </form>
  )
}


