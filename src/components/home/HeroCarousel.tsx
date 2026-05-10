"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ApiBanner } from "@/lib/api";

interface Props {
  banners?: ApiBanner[];
}

export default function HeroCarousel({ banners = [] }: Props) {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = banners.length;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % count);
  }, [count]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + count) % count);
  }, [count]);

  const startAuto = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(next, 5000);
  }, [next]);

  const stopAuto = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (count === 0) return;
    startAuto();
    return stopAuto;
  }, [startAuto, stopAuto, count]);

  if (count === 0) return null;

  return (
    <section
      className="relative overflow-hidden h-[60vh] min-h-[420px]"
      onMouseEnter={stopAuto}
      onMouseLeave={startAuto}
      aria-roledescription="carousel"
    >
      {/* Slide track */}
      <div
        className="flex h-full will-change-transform transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner, i) => (
          <div
            key={banner.id}
            className="relative flex-shrink-0 w-full h-full"
            aria-hidden={i !== current}
          >
            <Image
              src={banner.imageUrl}
              alt={banner.title}
              fill
              className="object-cover"
              priority={i === 0}
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight max-w-3xl">
                {banner.title}
              </h1>
            </div>
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          {/* Prev arrow */}
          <button
            onClick={() => { prev(); startAuto(); }}
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 bg-black/25 hover:bg-black/45 text-white rounded-full p-2 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Next arrow */}
          <button
            onClick={() => { next(); startAuto(); }}
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 bg-black/25 hover:bg-black/45 text-white rounded-full p-2 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {Array.from({ length: count }).map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); startAuto(); }}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "bg-white w-6 h-2.5"
                    : "bg-white/50 hover:bg-white/75 w-2.5 h-2.5"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
