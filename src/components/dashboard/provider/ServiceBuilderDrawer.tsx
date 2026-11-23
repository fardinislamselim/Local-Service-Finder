"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Layers,
  Image as ImageIcon,
  Loader2,
  DollarSign,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichHtmlEditor } from "@/components/shared/RichHtmlEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoriesService } from "@/features/categories/services/categories.service";
import { servicesService } from "@/features/services/services/services.service";
import type { Category, Service } from "@/types/api";

interface ServiceBuilderDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceToEdit?: Service | null;
  onSuccess?: () => void;
}

export function ServiceBuilderDrawer({
  open,
  onOpenChange,
  serviceToEdit,
  onSuccess,
}: ServiceBuilderDrawerProps) {
  const queryClient = useQueryClient();
  const isEditing = !!serviceToEdit;

  // Form State
  const [name, setName] = React.useState("");
  const [categoryId, setCategoryId] = React.useState<string>("");
  const [pricingType, setPricingType] = React.useState<"fixed" | "hourly" | "quotation">("fixed");
  const [basePrice, setBasePrice] = React.useState<string>("");
  const [hourBasePrice, setHourBasePrice] = React.useState<string>("");
  const [shotDescription, setShotDescription] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  // Categories query
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories", "all_category"],
    queryFn: () => categoriesService.getAll(),
  });

  // Populate fields on edit or reset on create
  React.useEffect(() => {
    if (serviceToEdit && open) {
      setName(serviceToEdit.name || "");
      const catId =
        typeof serviceToEdit.category === "object" && serviceToEdit.category
          ? String((serviceToEdit.category as any).id)
          : String(serviceToEdit.category || "");
      setCategoryId(catId);
      const pt = String(serviceToEdit.pricing_type || "").toLowerCase();
      if (pt === "hourly") setPricingType("hourly");
      else if (pt === "quotation") setPricingType("quotation");
      else setPricingType("fixed");

      setBasePrice(serviceToEdit.base_price !== undefined ? String(serviceToEdit.base_price) : "");
      setHourBasePrice(
        serviceToEdit.hour_base_price !== undefined ? String(serviceToEdit.hour_base_price) : ""
      );
      setShotDescription(serviceToEdit.shot_description || "");
      setDescription(serviceToEdit.description || "");
      setIsActive(serviceToEdit.is_active ?? true);
      setImagePreview(serviceToEdit.image || null);
      setImageFile(null);
    } else if (!serviceToEdit && open) {
      setName("");
      setCategoryId("");
      setPricingType("fixed");
      setBasePrice("");
      setHourBasePrice("");
      setShotDescription("");
      setDescription("");
      setIsActive(true);
      setImageFile(null);
      setImagePreview(null);
    }
  }, [serviceToEdit, open]);

  // Handle file select
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Helper to insert simple allowed HTML tags into description
  const insertHtmlTag = (tag: string) => {
    if (tag === "br") {
      setDescription((prev) => prev + "<br/>");
      return;
    }
    setDescription((prev) => `${prev}<${tag}>Text</${tag}>`);
  };

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Service name is required.");
      if (!categoryId) throw new Error("Please select a category.");
      if (pricingType === "fixed" && !basePrice) {
        throw new Error("Base price is required for fixed pricing.");
      }
      if (pricingType === "hourly" && !hourBasePrice) {
        throw new Error("Hourly rate is required for hourly pricing.");
      }

      return servicesService.create({
        name: name.trim(),
        category: categoryId,
        pricing_type: pricingType,
        base_price: pricingType === "fixed" ? basePrice : undefined,
        hour_base_price: pricingType === "hourly" ? hourBasePrice : undefined,
        shot_description: shotDescription.trim() || undefined,
        description: description.trim() || undefined,
        is_active: isActive,
        image: imageFile,
      });
    },
    onSuccess: () => {
      toast.success("Service published successfully!");
      queryClient.invalidateQueries({ queryKey: ["services", "provider"] });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create service.");
    },
  });

  // Update Mutation (CRITICAL SERIALIZER CONSTRAINT: Only name, description, hour_base_price, and image can be updated)
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!serviceToEdit) return;
      if (!name.trim()) throw new Error("Service name is required.");

      return servicesService.update(serviceToEdit.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        hour_base_price: pricingType === "hourly" ? hourBasePrice : undefined,
        image: imageFile || undefined,
      });
    },
    onSuccess: () => {
      toast.success("Service updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["services", "provider"] });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update service.");
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6 bg-white border border-stone-200 rounded-3xl">
        <DialogHeader className="pb-4 border-b border-stone-100">
          <DialogTitle className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Layers className="h-5 w-5 text-teal-800" />
            {isEditing ? "Edit Service Listing" : "Create New Service"}
          </DialogTitle>
          <DialogDescription className="text-xs text-stone-500">
            {isEditing
              ? "Update service details. Note: Category and pricing model are locked after publication to preserve customer agreements."
              : "List a new local craft or home service with clear pricing to attract local customers."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-3">
          {/* Service Name */}
          <div className="space-y-1.5">
            <Label htmlFor="srv-name" className="text-xs font-semibold text-stone-800">
              Service Name <span className="text-orange-600">*</span>
            </Label>
            <Input
              id="srv-name"
              placeholder="e.g. Master Electrician Circuit & Wiring Inspection"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={200}
              required
              className="rounded-xl border-stone-200 text-sm focus-visible:ring-teal-700"
            />
            <span className="text-[11px] text-stone-400 block text-right">
              {name.length}/200 characters
            </span>
          </div>

          {/* Category Selector */}
          <div className="space-y-1.5">
            <Label htmlFor="srv-cat" className="text-xs font-semibold text-stone-800">
              Category <span className="text-orange-600">*</span>
            </Label>
            {isEditing ? (
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 flex items-center justify-between">
                <span>
                  {categories.find((c) => String(c.id) === categoryId)?.name ||
                    serviceToEdit?.category_name ||
                    "Category locked"}
                </span>
                <span className="text-[11px] font-semibold text-stone-400">Locked</span>
              </div>
            ) : (
              <Select value={categoryId} onValueChange={(val) => setCategoryId(val)} required>
                <SelectTrigger id="srv-cat" className="rounded-xl border-stone-200 text-sm">
                  <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-stone-200 max-h-60">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Pricing Model Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-stone-800 block">
              Pricing Model <span className="text-orange-600">*</span>
            </Label>
            {isEditing ? (
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 flex items-center justify-between">
                <span className="capitalize font-semibold text-stone-800">
                  {pricingType} Pricing
                </span>
                <span className="text-[11px] font-semibold text-stone-400">Locked</span>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPricingType("fixed")}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                    pricingType === "fixed"
                      ? "border-teal-700 bg-teal-50/50 text-teal-900 font-semibold"
                      : "border-stone-200 hover:border-stone-300 text-stone-700"
                  }`}
                >
                  <DollarSign className="h-4 w-4 text-teal-800" />
                  <span className="text-xs">Fixed Price</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPricingType("hourly")}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                    pricingType === "hourly"
                      ? "border-teal-700 bg-teal-50/50 text-teal-900 font-semibold"
                      : "border-stone-200 hover:border-stone-300 text-stone-700"
                  }`}
                >
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-xs">Hourly Rate</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPricingType("quotation")}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                    pricingType === "quotation"
                      ? "border-teal-700 bg-teal-50/50 text-teal-900 font-semibold"
                      : "border-stone-200 hover:border-stone-300 text-stone-700"
                  }`}
                >
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  <span className="text-xs">Custom Quote</span>
                </button>
              </div>
            )}
          </div>

          {/* Conditional Pricing Inputs */}
          {pricingType === "fixed" && !isEditing && (
            <div className="space-y-1.5 p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <Label htmlFor="srv-base" className="text-xs font-semibold text-stone-800">
                Fixed Base Price (৳ BDT) <span className="text-orange-600">*</span>
              </Label>
              <Input
                id="srv-base"
                type="number"
                placeholder="e.g. 1500"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                required
                className="rounded-xl border-stone-200 bg-white"
              />
            </div>
          )}

          {pricingType === "hourly" && (
            <div className="space-y-1.5 p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <Label htmlFor="srv-hourly" className="text-xs font-semibold text-stone-800">
                Hourly Rate (৳ / hour) <span className="text-orange-600">*</span>
              </Label>
              <Input
                id="srv-hourly"
                type="number"
                placeholder="e.g. 350"
                value={hourBasePrice}
                onChange={(e) => setHourBasePrice(e.target.value)}
                required
                className="rounded-xl border-stone-200 bg-white"
              />
            </div>
          )}

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-stone-800 block">
              Showcase Image
            </Label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative h-20 w-28 rounded-xl overflow-hidden border border-stone-200 shrink-0 bg-stone-100">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-1 right-1 h-5 w-5 bg-black/60 rounded-full text-white flex items-center justify-center hover:bg-black/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="h-20 w-28 rounded-xl border border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400 bg-stone-50 shrink-0">
                  <ImageIcon className="h-6 w-6" />
                  <span className="text-[10px] mt-1">No Image</span>
                </div>
              )}

              <div className="flex-1">
                <input
                  type="file"
                  id="srv-file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("srv-file")?.click()}
                  className="rounded-xl text-xs"
                >
                  <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                  {imagePreview ? "Change Photo" : "Upload Photo"}
                </Button>
                <p className="text-[11px] text-stone-500 mt-1">
                  High-res photo uploaded directly to Cloudinary. JPG, PNG, WebP up to 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Short Description (Only on Create) */}
          {!isEditing && (
            <div className="space-y-1.5">
              <Label htmlFor="srv-short" className="text-xs font-semibold text-stone-800">
                Short Tagline
              </Label>
              <Input
                id="srv-short"
                placeholder="Brief 1-line summary displayed on search cards"
                value={shotDescription}
                onChange={(e) => setShotDescription(e.target.value)}
                maxLength={255}
                className="rounded-xl border-stone-200 text-sm"
              />
              <span className="text-[11px] text-stone-400 block text-right">
                {shotDescription.length}/255 characters
              </span>
            </div>
          )}

          {/* Full Rich Description with Tiptap HTML Editor */}
          <div className="space-y-1.5">
            <Label htmlFor="srv-desc" className="text-xs font-semibold text-stone-800">
              Detailed Scope & Work Description
            </Label>
            <RichHtmlEditor
              value={description}
              onChange={(html) => setDescription(html)}
              placeholder="Explain the process, tools provided, exclusions, and warranty..."
            />
            <p className="text-[11px] text-stone-500">
              Permitted tags: <code className="text-teal-900 font-mono">&lt;strong&gt;, &lt;em&gt;, &lt;u&gt;, &lt;h2&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;blockquote&gt;</code> (all attributes stripped).
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold text-xs rounded-xl shadow-tactile"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Publish Service"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
