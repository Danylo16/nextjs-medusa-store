"use client"

import { Button } from "../../../common/UI/button"

import Image from "next/image"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const sliderImages = [
  "/hero-bike.jpg",
  "/physical-therapy-rehabilitation-equipment.jpg",
  "/test.jpg",
]

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length)
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#4BAF8C] opacity-5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#F6946F] opacity-5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-20 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column - Content */}
          <div className="flex flex-col gap-8">
            <div className="space-y-4">
              <span className="inline-block px-4 py-2 bg-[#F7DDE2] text-[#4BAF8C] text-sm font-semibold rounded-full">
                Сучасні реабілітаційні тренажери
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-balance leading-tight text-foreground">
                Повернись до руху{" "}
                <span className="text-[#4BAF8C]">без болю</span>
              </h1>
            </div>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
              Професійні реабілітаційні тренажери для клінік, реабілітаційних центрів та домашнього використання.
              Продумана біомеханіка, мʼякий дизайн і підтримка на кожному етапі відновлення після травм та операцій.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              {/* Primary CTA — великий кнопка, як у Vercel */}
              <Button
                size="lg"
                variant="primary"
                className="px-8 text-base"
              >
                Переглянути тренажери
              </Button>

              {/* Secondary CTA — помаранчевий outline, як у Vercel */}
              <Button
                size="lg"
                variant="accentOutline"
                className="px-8 text-base"
              >
                Отримати консультацію
              </Button>
            </div>
 

            <div className="flex flex-wrap gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#4BAF8C] rounded-full" />
                <span>Рішення для клінік, центрів і домашньої реабілітації</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#4BAF8C] rounded-full" />
                <span>Індивідуальний підбір комплексу під ваші задачі</span>
              </div>
            </div>
          </div>

          {/* Right column - Slider */}
          <div className="relative h-96 md:h-[500px] lg:h-full min-h-96 rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.12)] group">
            <div className="relative w-full h-full">
              {sliderImages.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === currentSlide ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`Слайд реабілітаційного тренажера ${index + 1}`}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-[#4BAF8C] p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
              aria-label="Попередній слайд"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-[#4BAF8C] p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
              aria-label="Наступний слайд"
            >
              <ChevronRight size={24} />
            </button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
              {sliderImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentSlide ? "bg-[#4BAF8C] w-3 h-3" : "bg-white/50 hover:bg-white/70 w-2 h-2"
                  }`}
                  aria-label={`Перейти до слайду ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
