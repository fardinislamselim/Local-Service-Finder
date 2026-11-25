"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FolderTree,
  Plus,
  Edit3,
  Trash2,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  X,
  Search,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { categoriesService } from "@/features/categories/services/categories.service";
import type { Category } from "@/types/api";

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = React.useState("");

  // Dialog states
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = React.useState<Category | null>(null);

  // Form states
  const [formName, setFormName] = React.useState("");
  const [formIsActive, setFormIsActive] = React.useState(true);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  // 1. Fetch Categories: GET /api/v1/categories/all_category/
  const {
    data: categories = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["categories", "all_category"],
    queryFn: () => categoriesService.getAll(),
  });

  const openCreateDialog = () => {
    setFormName("");
    setFormIsActive(true);
    setImageFile(null);
    setImagePreview(null);
    setEditingCategory(null);
    setDialogOpen(true);
  };

  const openEditDialog = (cat: Category) => {
    setFormName(cat.name || "");
    setFormIsActive(cat.is_active ?? true);
    setImageFile(null);
    setImagePreview(cat.image || null);
    setEditingCategory(cat);
    setDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 2. Create Mutation: POST /api/v1/categories/create_category/
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!formName.trim()) throw new Error("Category name is required.");
      return categoriesService.create({
        name: formName.trim(),
        is_active: formIsActive,
        image: imageFile,
      });
    },
    onSuccess: () => {
      toast.success("Category created successfully!");
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create category.");
    },
  });

  // 3. Update Mutation: PATCH /api/v1/categories/category_modify/{id}/ (id = UUID)
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingCategory) return;
      if (!formName.trim()) throw new Error("Category name is required.");
      return categoriesService.update(editingCategory.id, {
        name: formName.trim(),
        is_active: formIsActive,
        image: imageFile,
      });
    },
    onSuccess: () => {
      toast.success("Category updated successfully!");
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update category.");
    },
  });

  // 4. Delete Mutation: DELETE /api/v1/categories/category_modify/{id}/ (id = UUID)
  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => categoriesService.delete(id),
    onSuccess: () => {
      toast.success("Category deleted successfully.");
      setDeletingCategory(null);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete category.");
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const filteredCategories = React.useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter((c) => (c.name || "").toLowerCase().includes(q));
  }, [categories, searchQuery]);

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <Link href="/dashboard/admin" className="hover:text-teal-800 transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-stone-800 dark:text-stone-200 font-medium">Categories Manager</span>
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
                Categories Manager
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-teal-50 text-teal-900 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-200 dark:border-teal-800 tabular-nums">
                {categories.length} total
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Organize marketplace classifications. Providers attach these when creating local service listings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="h-9 px-3 text-xs border-stone-200 dark:border-stone-800 gap-1.5 rounded-xl font-medium"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
            <Button
              onClick={openCreateDialog}
              className="h-9 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold rounded-xl shadow-tactile gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add Category</span>
            </Button>
          </div>
        </div>

        {/* Search Bar Strip */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search service categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#115E59]/20 focus:border-[#115E59] text-stone-800 dark:text-stone-200 placeholder:text-stone-400 transition-all"
            />
          </div>

          <div className="text-xs text-stone-500 self-center">
            Showing <strong className="text-stone-900 dark:text-stone-100 tabular-nums">{filteredCategories.length}</strong> categories
          </div>
        </div>

        {/* Categories Feed */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 space-y-3"
              >
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-7 w-full rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-stone-900 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800">
            <div className="h-14 w-14 rounded-2xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center mx-auto text-teal-800 mb-4">
              <FolderTree className="h-7 w-7 text-teal-800" />
            </div>
            <h3 className="mb-1 text-sm font-semibold text-stone-900 dark:text-stone-100">
              No categories found
            </h3>
            <p className="mx-auto max-w-sm text-xs text-stone-500 dark:text-stone-400 mb-6">
              {searchQuery
                ? `No categories match "${searchQuery}".`
                : "You have not registered any service categories yet. Create your first category to get started."}
            </p>
            <Button
              onClick={openCreateDialog}
              className="bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold text-xs rounded-xl shadow-tactile gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add Category</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCategories.map((cat) => {
              const isActive = cat.is_active ?? true;

              return (
                <div
                  key={String(cat.id)}
                  className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 shadow-sm hover:border-stone-300 dark:hover:border-stone-700 transition-colors flex flex-col justify-between gap-3"
                >
                  <div className="space-y-3">
                    {/* Cloudinary Image or Geometric Fallback */}
                    <div className="relative h-32 w-full rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-800">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center text-stone-400 gap-1.5">
                          <FolderTree className="h-8 w-8 stroke-[1.5]" />
                          <span className="text-[10px] font-medium">No graphic uploaded</span>
                        </div>
                      )}

                      <div className="absolute top-2 right-2">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-semibold border ${
                            isActive
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-stone-100 text-stone-600 border-stone-300 dark:bg-stone-800 dark:text-stone-400"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm tracking-tight truncate">
                        {cat.name}
                      </h4>
                      <span className="text-[10px] font-mono text-stone-400 block truncate">
                        #{String(cat.id).slice(0, 8)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingCategory(cat)}
                      className="h-8 px-2 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      <span>Delete</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(cat)}
                      className="h-8 px-2.5 text-xs text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-50 rounded-lg"
                    >
                      <Edit3 className="h-3.5 w-3.5 mr-1" />
                      <span>Edit</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create / Edit Category Modal */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl">
            <DialogHeader className="pb-3 border-b border-stone-100 dark:border-stone-800">
              <DialogTitle className="text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <FolderTree className="h-5 w-5 text-teal-800 shrink-0" />
                <span>{editingCategory ? "Edit Category" : "Add Service Category"}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-500 dark:text-stone-400">
                {editingCategory
                  ? "Update category name, activation status, or banner photo."
                  : "Create a new classification for local service professionals."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="cat-name" className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                  Category Name <span className="text-orange-600">*</span>
                </Label>
                <Input
                  id="cat-name"
                  placeholder="e.g. Electrical & Wiring, Home Cleaning..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  maxLength={50}
                  required
                  className="rounded-xl border-stone-200 dark:border-stone-700 text-sm focus-visible:ring-[#115E59]"
                />
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">
                    Active Status
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 block">
                    Inactive categories are hidden from client search & service creation.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 text-teal-800 focus:ring-[#115E59]"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                  Category Banner Image <span className="text-stone-400 font-normal">(Optional)</span>
                </Label>
                {imagePreview ? (
                  <div className="relative h-32 w-full rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 group">
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                      title="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-28 border border-dashed border-stone-300 dark:border-stone-700 rounded-xl cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                    <ImageIcon className="h-6 w-6 text-stone-400 mb-1" />
                    <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
                      Upload category image
                    </span>
                    <span className="text-[10px] text-stone-400">PNG, JPG, or WEBP up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <DialogFooter className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDialogOpen(false)}
                  disabled={isSaving}
                  className="text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSaving || !formName.trim()}
                  className="bg-[#115E59] hover:bg-teal-800 text-white text-xs rounded-xl font-medium"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingCategory ? "Update Category" : "Create Category"}</span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={!!deletingCategory}
          onOpenChange={(open) => !open && setDeletingCategory(null)}
        >
          <DialogContent className="sm:max-w-md p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl">
            <DialogHeader className="pb-3 border-b border-stone-100 dark:border-stone-800">
              <DialogTitle className="text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                <span>Delete this category?</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-500 dark:text-stone-400">
                Are you sure you want to delete{" "}
                <strong className="text-stone-800 dark:text-stone-200">
                  {deletingCategory?.name}
                </strong>
                ? Associated services will lose their category association.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="pt-4 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingCategory(null)}
                disabled={deleteMutation.isPending}
                className="text-xs rounded-xl"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => deletingCategory && deleteMutation.mutate(deletingCategory.id)}
                disabled={deleteMutation.isPending}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs rounded-xl font-medium"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, delete category</span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
