"use client"

import * as React from "react"

type ClassValue =
  | string
  | number
  | null
  | false
  | undefined
  | ClassValue[]
  | { [key: string]: boolean | undefined | null }

function cn(...inputs: ClassValue[]): string {
  const classes: string[] = []

  const push = (value: ClassValue) => {
    if (!value && value !== 0) return
    if (typeof value === "string" || typeof value === "number") {
      classes.push(String(value))
    } else if (Array.isArray(value)) {
      value.forEach(push)
    } else if (typeof value === "object") {
      for (const [key, cond] of Object.entries(value)) {
        if (cond) classes.push(key)
      }
    }
  }

  inputs.forEach(push)
  return classes.join(" ")
}

/* ——————————————————————————————————————————— */
/* Твіки для тіней — м'які, майже непомітні     */
/* ——————————————————————————————————————————— */

const softShadow = "shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
const softShadowHover = "hover:shadow-[0_0px_10px_rgba(0,0,0,0.06)]"


/* ——————————————————————————————————————————— */
/* БАЗОВІ СТИЛІ КНОПКИ                          */
/* ——————————————————————————————————————————— */

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap " +
  "transition-all duration-200 ease-out cursor-pointer select-none " + // <— плавна анімація + pointer
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary " +
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"

/* ——————————————————————————————————————————— */
/* ВАРІАНТИ                                     */
/* ——————————————————————————————————————————— */

const variantClasses = {
  primary: `
    bg-primary text-primary-foreground
    hover:brightness-90
    shadow-[0_1px_4px_rgba(0,0,0,0.05)]
    hover:shadow-[0_2px_8px_rgba(0,0,0,0.10)]
  `,
  outline: `
    border border-primary text-primary bg-transparent
    hover:bg-primary-light
  `,
  accentOutline: `
    border border-accent text-accent bg-transparent
    hover:bg-accent hover:text-primary-foreground
    shadow-[0_1px_4px_rgba(0,0,0,0.05)]
    hover:shadow-[0_2px_8px_rgba(0,0,0,0.10)]
  `,
  ghost: `
    text-primary bg-transparent hover:bg-primary-light
  `,
  subtle: `
    bg-secondary-light text-foreground hover:bg-secondary
  `,
  link: `
    text-primary underline-offset-4 hover:underline bg-transparent
  `,
} as const


/* ——————————————————————————————————————————— */
/* РОЗМІРИ                                      */
/* ——————————————————————————————————————————— */

const sizeClasses = {
  sm: "h-9 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base", // було h-11 — зробив більш преміально
  icon: "h-10 w-10 p-0",
} as const

export type ButtonVariant = keyof typeof variantClasses
export type ButtonSize = keyof typeof sizeClasses

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"
