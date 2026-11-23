"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Layers,
  Plus,
  Edit3,
  Trash2,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  X,
  Search,
  CheckCircle2,
} from "lucide-react";
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

export function AdminCategoriesTab() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = React.useState("");

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = React.useState<Category | null>(null);

  // Form states
  const [formName, setFormName] = React.useState("");
  const [formIsActive, setFormIsActive] = React.useState(true);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories", "all_category"],
    queryFn: () => categoriesService.getAll(),
  });

  const openCreateDialog = () => {
    setFormName("");
    setFormIsActive(true);
    setImageFile(null);
    setImagePreview(null);
    setEditingCategory(null);
    setCreateDialogOpen(true);
  };

  const openEditDialog = (cat: Category) => {
    setFormName(cat.name || "");
    setFormIsActive(cat.is_active ?? true);
    setImageFile(null);
    setImagePreview(cat.image || null);
    setEditingCategory(cat);
    setCreateDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Create Mutation
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
      setCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create category.");
    },
  });

  // Update Mutation
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
      setCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update category.");
    },
  });

  // Delete Mutation
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

  const filteredCategories = React.useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter((c) => (c.name || "").toLowerCase().includes(q));
  }, [categories, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Filter and Add Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search service categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-stone-800 placeholder:text-stone-400"
          />
        </div>

        <Button
          onClick={openCreateDialog}
          className="bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold text-xs rounded-xl shadow-tactile self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Category
        </Button>
      </div>

      {/* Grid of Categories */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 bg-white rounded-2xl border border-stone-200 space-y-3">
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-4 w-2/3 rounded" />
            </div>
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-stone-300">
          <Layers className="h-10 w-10 text-stone-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-stone-800">No categories found</h3>
          <p className="text-xs text-stone-500 mt-1">
            {searchQuery ? "No categories match your search." : "Create your first service category to organize listings."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-50">
                    <Layers className="h-7 w-7 text-stone-300" />
                    <span className="text-[10px] mt-1">No Image</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge className={`${cat.is_active ? "bg-emerald-600 text-white" : "bg-stone-500 text-white"} text-[10px]`}>
                    {cat.is_active ? "Active" : "Hidden"}
                  </Badge>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <h4 className="font-bold text-stone-900 text-sm">{cat.name}</h4>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(cat)}
                    className="flex-1 text-xs rounded-xl hover:text-teal-900"
                  >
                    <Edit3 className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingCategory(cat)}
                    className="text-xs rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-stone-200">
          <DialogHeader>
            <DialogTitle className="text-stone-900 flex items-center gap-2">
              <Layers className="h-5 w-5 text-teal-800" />
              {editingCategory ? "Edit Category" : "Create Service Category"}
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-500">
              Provide category details and high-resolution thumbnail icon.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editingCategory) updateMutation.mutate();
              else createMutation.mutate();
            }}
            className="space-y-4 pt-2"
          >
            <div className="space-y-1.5">
              <Label htmlFor="cat-name" className="text-xs font-semibold text-stone-800">
                Category Name <span className="text-orange-600">*</span>
              </Label>
              <Input
                id="cat-name"
                placeholder="e.g. Electrician, Plumbing, Cleaning"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                className="rounded-xl border-stone-200 text-sm"
              />
            </div>

            {/* Thumbnail Preview & Picker */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-stone-800 block">
                Category Image
              </Label>
              <div className="flex items-center gap-3">
                {imagePreview ? (
                  <div className="relative h-16 w-20 rounded-xl overflow-hidden border border-stone-200 shrink-0">
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-1 right-1 h-4 w-4 bg-black/60 rounded-full text-white flex items-center justify-center"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ) : (
                  <div className="h-16 w-20 rounded-xl border border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400 bg-stone-50 shrink-0">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                )}

                <div className="flex-1">
                  <input
                    type="file"
                    id="cat-file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("cat-file")?.click()}
                    className="rounded-xl text-xs"
                  >
                    <ImageIcon className="h-3.5 w-3.5 mr-1" />
                    {imagePreview ? "Change Photo" : "Upload Image"}
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2 flex gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateDialogOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold text-xs rounded-xl shadow-tactile"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : editingCategory ? (
                  "Save Changes"
                ) : (
                  "Create Category"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl border-stone-200">
          <DialogHeader>
            <DialogTitle className="text-stone-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-600" />
              Delete Category?
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-600">
              Are you sure you want to remove <strong>"{deletingCategory?.name}"</strong>? This may affect services tagged under this category.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingCategory(null)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => deletingCategory && deleteMutation.mutate(deletingCategory.id)}
              disabled={deleteMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
            >
              {deleteMutation.isPending ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
