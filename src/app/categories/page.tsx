"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search, FolderTree, ArrowRight, Wrench } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { categoriesService } from "@/features/categories/services/categories.service";
import type { Category } from "@/types/api";

export default function CategoriesPage() {
  const [search, setSearch] = React.useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => categoriesService.getAll(),
  });

  const categories: Category[] = data || [];

  const filtered = React.useMemo(() => {
    if (!search.trim()) return categories;
    return categories.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container max-w-6xl mx-auto py-10 px-4 sm:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Service Categories</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Browse all service sectors and industries available on the platform
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">
            No categories matching &quot;{search}&quot;.
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filtered.map((cat) => (
              <Link
                key={cat.id}
                href={`/services?search=${encodeURIComponent(cat.name)}`}
                className="group p-5 rounded-xl border border-border bg-card hover:bg-accent/40 transition-all hover:shadow-md hover:border-primary/50 flex flex-col justify-between min-h-[120px]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                  <FolderTree className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-xs text-muted-foreground inline-flex items-center gap-1 mt-1">
                    Explore services <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

