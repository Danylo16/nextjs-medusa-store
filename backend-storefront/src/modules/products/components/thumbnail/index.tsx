import React from "react"
import Image from "next/image"
import { clx } from "@medusajs/ui"
import PlaceholderImage from "@modules/common/icons/placeholder-image"

type ThumbnailProps = {
  thumbnail?: string | null
  images?: { url?: string | null }[] | null
  size?: "small" | "medium" | "large" | "full" | "square"
  isFeatured?: boolean
  className?: string
  fit?: "contain" | "cover"
  priority?: boolean
  "data-testid"?: string
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = "small",
  isFeatured,
  className,
  fit = "contain",
  priority = false,
  "data-testid": dataTestid,
}) => {
  const initialImage = thumbnail || images?.[0]?.url || undefined
  const isFill = size === "full"

  const aspectClass =
    size === "square" ? "aspect-square" : isFeatured ? "aspect-[4/5]" : "aspect-[4/5]"

  const widthClass =
    size === "small"
      ? "w-[180px]"
      : size === "medium"
        ? "w-[290px]"
        : size === "large"
          ? "w-[440px]"
          : "w-full"

  const sizes =
    size === "small"
      ? "180px"
      : size === "medium"
        ? "290px"
        : size === "large"
          ? "440px"
          : "(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 360px"

  return (
    <div
      className={clx(
        "relative overflow-hidden",
        isFill
          ? "w-full h-full" // parent already defines aspect/size
          : clx("rounded-2xl bg-white ring-1 ring-black/5", aspectClass, widthClass),
        !isFill && "transition-transform duration-200 ease-out group-hover:scale-[1.01]",
        className
      )}
      data-testid={dataTestid}
    >
      {initialImage ? (
        <Image
          src={initialImage}
          alt="Product image"
          fill
          draggable={false}
          priority={priority}
          quality={85}
          sizes={sizes}
          className={clx(
            "absolute inset-0",
            fit === "contain"
              ? "object-contain object-center p-2"
              : "object-cover object-center"
          )}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <PlaceholderImage size={size === "small" ? 16 : 24} />
        </div>
      )}
    </div>
  )
}

export default Thumbnail
