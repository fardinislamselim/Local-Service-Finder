"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FolderTree, Plus, Edit, Trash2, ArrowLeft, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormInput } from "@/components/shared/form-field";
import { categoriesService } from "@/features/categories/services/categories.service";
import type { Category } from "@/types/api";

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [categoryName, setCategoryName] = React.useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => categoriesService.getAll(),
  });

  const categories: Category[] = Array.isArray(data) ? data : data?.results || [];

  const createMutation = useMutation({
    mutationFn: (name: string) => categoriesService.create({ name }),
    onSuccess: () => {
      toast.success("Category created successfully!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDialogOpen(false);
      setCategoryName("");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create category.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number | string; name: string }) =>
      categoriesService.update(data.id, { name: data.name }),
    onSuccess: () => {
      toast.success("Category updated!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDialogOpen(false);
      setEditingCategory(null);
      setCategoryName("");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update category.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => categoriesService.delete(id),
    onSuccess: () => {
      toast.success("Category deleted.");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete category.");
    },
  });

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setCategoryName("");
    setDialogOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setCategoryName(c.name);
    setDialogOpen(true);
  };

  const filtered = React.useMemo(() => {
    if (!search.trim()) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [categories, search]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/admin"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to admin overview
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Categories Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create, rename, and manage service categories on the marketplace.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2 shadow font-semibold">
          <Plus className="h-4 w-4" />
          Create Category
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          Total: {filtered.length} categories
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <FolderTree className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
          <h3 className="font-semibold text-base text-foreground">No categories found</h3>
          <p className="text-sm mt-1">Click &quot;Create Category&quot; to add your first one.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((cat) => (
            <Card key={cat.id} className="p-4 border-border/80 shadow-sm flex items-center justify-between gap-2">
              <div className="truncate">
                <h3 className="font-semibold text-sm truncate">{cat.name}</h3>
                <span className="text-xs text-muted-foreground">ID #{cat.id}</span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(cat)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    if (confirm(`Delete category "${cat.name}"?`)) {
                      deleteMutation.mutate(cat.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Create New Category"}
            </DialogTitle>
            <DialogDescription>
              Enter the descriptive name for the service classification.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <FormInput
              label="Category Name"
              required
              placeholder="e.g. Home Appliance Repair"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              disabled={isSubmitting || !categoryName.trim()}
              onClick={() => {
                if (editingCategory) {
                  updateMutation.mutate({ id: editingCategory.id, name: categoryName.trim() });
                } else {
                  createMutation.mutate(categoryName.trim());
                }
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : editingCategory ? (
                "Save Changes"
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

