"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles, Layers } from "lucide-react";
import { categoriesService } from "@/features/categories/services/categories.service";
import type { Category } from "@/types/api";

export function CategoryShowcase() {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => categoriesService.getAll(),
    staleTime: 1000 * 60 * 15,
  });

  return (
    <section className="py-16 sm:py-20 bg-[#FAF9F6] border-b border-stone-200">
      <div className="container mx-auto px-4 sm:px-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Explore Categories</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-heading">
              Popular Home & Trade Services
            </h2>
          </div>

          <Link
            href="/services"
            className="text-xs font-bold text-teal-800 hover:text-teal-900 inline-flex items-center gap-1 group"
          >
            <span>Browse All Services</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Category Bento Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-36 rounded-2xl bg-stone-200 animate-pulse border border-stone-200"
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-stone-500 bg-white rounded-2xl border border-stone-200 text-xs">
            No service categories found.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 12).map((cat: Category) => {
              const hasCloudinaryImg = Boolean(cat.image && cat.image.startsWith("http"));

              return (
                <Link
                  key={cat.id}
                  href={`/services?category=${cat.id}`}
                  className="group relative p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:shadow-tactile hover:-translate-y-1 transition-all duration-200 flex flex-col items-center text-center justify-between min-h-[140px]"
                >
                  <div className="w-14 h-14 rounded-2xl bg-teal-50/70 border border-teal-100 flex items-center justify-center overflow-hidden mb-2 group-hover:scale-105 transition-transform">
                    {hasCloudinaryImg ? (
                      /* Render Cloudinary Category Image directly */
                      <img
                        src={cat.image as string}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Layers className="h-6 w-6 text-teal-800" />
                    )}
                  </div>
                  <h3 className="font-bold text-xs text-stone-800 group-hover:text-teal-900 transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] text-stone-400 font-medium">Explore pros →</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default CategoryShowcase;
