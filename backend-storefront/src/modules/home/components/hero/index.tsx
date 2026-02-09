"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

import CallbackRequestModal from "@modules/common/components/callback-request-modal"

import { Button } from "@modules/common/UI/button"

const sliderImages = [
  "/hero-bike.jpg",
  "/physical-therapy-rehabilitation-equipment.jpg",
  "/test.jpg",
]

export default function Hero() {
  const router = useRouter()
  const params = useParams<{ countryCode?: string }>()
  const countryCode = params?.countryCode || "ua"

  const [currentSlide, setCurrentSlide] = useState(0)
  const [consultOpen, setConsultOpen] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  const goToSlide = (index: number) => setCurrentSlide(index)
  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length)
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length)

  const handleViewProducts = () => {
    const el = document.getElementById("products")
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
      return
    }

    router.push(`/${countryCode}/store`)
  }

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 right-10 h-72 w-72 rounded-full bg-[#4BAF8C] opacity-5 blur-3xl" />
        <div className="absolute bottom-20 left-10 h-96 w-96 rounded-full bg-[#F6946F] opacity-5 blur-3xl" />
      </div>

      <CallbackRequestModal open={consultOpen} onClose={() => setConsultOpen(false)} />

      <div className="mx-auto w-full max-w-7xl px-6 py-20 md:px-8 md:py-24 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: copy */}
          <div className="flex flex-col gap-8">
            <div className="space-y-4">
              <span className="inline-flex items-center rounded-full bg-[#F7DDE2] px-4 py-2 text-sm font-semibold text-[#4BAF8C]">
                Сучасні реабілітаційні тренажери
              </span>

              <h1 className="text-balance text-5xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl">
                Повернись до руху{" "}
                <span className="text-[#4BAF8C]">без болю</span>
              </h1>
            </div>

            <p className="max-w-lg text-lg leading-relaxed text-muted-foreground md:text-xl">
              Професійні реабілітаційні тренажери для клінік, реабілітаційних центрів та домашнього
              використання. Продумана біомеханіка, мʼякий дизайн і підтримка на кожному етапі
              відновлення після травм та операцій.
            </p>

            <div className="flex flex-col gap-4 pt-2 sm:flex-row">
              <Button
                size="lg"
                variant="primary"
                className="px-8 text-base"
                onClick={handleViewProducts}
              >
                Переглянути тренажери
              </Button>

              <Button
                size="lg"
                variant="accentOutline"
                className="px-8 text-base"
                onClick={() => setConsultOpen(true)}
              >
                Отримати консультацію
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 pt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#4BAF8C]" />
                <span>Рішення для клінік, центрів і домашньої реабілітації</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#4BAF8C]" />
                <span>Підбір комплексу під вашу задачу</span>
              </div>
            </div>
          </div>

          {/* Right: slider */}
          <div className="group relative min-h-96 overflow-hidden rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] md:h-[500px] lg:h-full">
            <div className="relative h-full w-full">
              {sliderImages.map((src, index) => (
                <div
                  key={src}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === currentSlide ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Image
                    src={src}
                    alt={`Реабілітаційний тренажер — слайд ${index + 1}`}
                    fill
                    priority={index === 0}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={prevSlide}
              aria-label="Попередній слайд"
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 text-[#4BAF8C] opacity-0 transition-all duration-200 hover:bg-white group-hover:opacity-100"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              type="button"
              onClick={nextSlide}
              aria-label="Наступний слайд"
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 text-[#4BAF8C] opacity-0 transition-all duration-200 hover:bg-white group-hover:opacity-100"
            >
              <ChevronRight size={24} />
            </button>

            <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
              {sliderImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => goToSlide(index)}
                  aria-label={`Перейти до слайду ${index + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "h-3 w-3 bg-[#4BAF8C]"
                      : "h-2 w-2 bg-white/50 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
