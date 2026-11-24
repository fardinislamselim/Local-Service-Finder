"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Layers } from "lucide-react";
import { categoriesService } from "@/features/categories/services/categories.service";
import type { Category } from "@/types/api";

export function CategoryShowcase() {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => categoriesService.getAll(),
    staleTime: 1000 * 60 * 15,
  });

  return (
    <section className="py-12 sm:py-16 bg-[#FAF9F6] border-b border-stone-200">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-stone-900 font-heading">
              Browse by service category
            </h2>
            <p className="text-xs text-stone-500">
              Select a specialized trade to see available local professionals
            </p>
          </div>

          <Link
            href="/services"
            className="text-xs font-medium text-stone-600 hover:text-stone-900 inline-flex items-center gap-1 group"
          >
            <span>All categories</span>
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Category Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-xl bg-stone-200/60 animate-pulse border border-stone-200"
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-stone-500 bg-white rounded-xl border border-stone-200 text-xs">
            No service categories found
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.slice(0, 12).map((cat: Category) => {
              const hasCloudinaryImg = Boolean(cat.image && cat.image.startsWith("http"));

              return (
                <Link
                  key={cat.id}
                  href={`/services?category=${cat.id}`}
                  className="group p-3.5 rounded-xl bg-white border border-stone-200 hover:border-stone-300 transition-colors flex flex-col items-center text-center justify-between min-h-[120px]"
                >
                  <div className="w-12 h-12 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-center overflow-hidden mb-2">
                    {hasCloudinaryImg ? (
                      <img
                        src={cat.image as string}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Layers className="h-5 w-5 text-stone-500 group-hover:text-stone-800 transition-colors" />
                    )}
                  </div>
                  <h3 className="font-medium text-xs text-stone-800 group-hover:text-[#115E59] transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] text-stone-400">View pros</span>
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
