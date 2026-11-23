"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import {
  ArrowLeft,
  DollarSign,
  Clock,
  Sparkles,
  Layers,
  Image as ImageIcon,
  X,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tag,
  AlignLeft,
  FileText,
  Eye,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichHtmlEditor } from "@/components/shared/RichHtmlEditor";
import { categoriesService } from "@/features/categories/services/categories.service";
import { servicesService } from "@/features/services/services/services.service";
import type { Category } from "@/types/api";

export default function CreateServicePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [serverErrors, setServerErrors] = React.useState<Record<string, string>>({});

  // 1. Fetch categories for category dropdown (UUID string)
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories", "all_category"],
    queryFn: () => categoriesService.getAll(),
  });

  // 2. TanStack Form setup matching exact 9 keys from schema:
  // name, category, pricing_type, base_price, hour_base_price, shot_description, description, is_active, image
  const form = useForm({
    defaultValues: {
      name: "",
      category: "",
      pricing_type: "fixed" as "fixed" | "hourly" | "quotation",
      base_price: "",
      hour_base_price: "",
      shot_description: "",
      description: "",
      is_active: true,
    },
    onSubmit: async ({ value }) => {
      setServerErrors({});

      // Client validations
      const errs: Record<string, string> = {};
      if (!value.name.trim()) errs.name = "Service name is required.";
      if (!value.category) errs.category = "Please choose a category.";

      if (value.pricing_type === "fixed" && (!value.base_price || Number(value.base_price) <= 0)) {
        errs.base_price = "Please provide a valid fixed base price.";
      }
      if (value.pricing_type === "hourly" && (!value.hour_base_price || Number(value.hour_base_price) <= 0)) {
        errs.hour_base_price = "Please provide a valid hourly rate.";
      }

      if (Object.keys(errs).length > 0) {
        setServerErrors(errs);
        toast.error("Please fill in all required fields properly.");
        return;
      }

      createMutation.mutate(value);
    },
  });

  // 3. Create Mutation via servicesService (multipart/form-data)
  const createMutation = useMutation({
    mutationFn: async (values: {
      name: string;
      category: string;
      pricing_type: "fixed" | "hourly" | "quotation";
      base_price: string;
      hour_base_price: string;
      shot_description: string;
      description: string;
      is_active: boolean;
    }) => {
      return servicesService.create({
        name: values.name.trim(),
        category: values.category,
        pricing_type: values.pricing_type,
        base_price: values.pricing_type === "fixed" ? values.base_price : undefined,
        hour_base_price: values.pricing_type === "hourly" ? values.hour_base_price : undefined,
        shot_description: values.shot_description.trim() || undefined,
        description: values.description.trim() || undefined,
        is_active: values.is_active,
        image: imageFile,
      });
    },
    onSuccess: (data) => {
      toast.success("Service created and published successfully!");
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "provider"] });
      router.push("/dashboard/provider");
    },
    onError: (err: any) => {
      const errData = err?.errors || err?.response?.data || err?.raw;
      if (errData && typeof errData === "object") {
        const parsed: Record<string, string> = {};
        for (const [k, v] of Object.entries(errData)) {
          parsed[k] = Array.isArray(v) ? v[0] : String(v);
        }
        setServerErrors(parsed);
      }
      toast.error(err?.message || "Failed to create service. Please review the highlighted fields.");
    },
  });

  // Handle image drag & drop / selection
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be under 5MB.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  return (
    <ProtectedRoute allowedRoles={["SERVICE_PROVIDER"]}>
      <main className="min-h-screen bg-[#FAF9F6] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Top Breadcrumb & Heading */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <Link
                href="/dashboard/provider"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-teal-900 transition-colors mb-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Provider Workspace
              </Link>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-serif flex items-center gap-2.5">
                <Sparkles className="h-7 w-7 text-orange-600" />
                Publish New Service
              </h1>
              <p className="text-sm text-stone-600 mt-1">
                List a professional home or craft trade service. All fields match our verified marketplace contract.
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-8"
          >
            {/* CARD 1: Core Details & Classification */}
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                <Tag className="h-5 w-5 text-teal-800" />
                <h2 className="text-lg font-bold text-stone-900">1. Service Basics</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* 1. name */}
                <form.Field name="name">
                  {(field) => (
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor={field.name} className="text-xs font-bold text-stone-800">
                        Service Name <span className="text-orange-600">*</span>
                      </Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        placeholder="e.g. Master Electrician Circuit & Wiring Inspection"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        maxLength={200}
                        className="rounded-xl border-stone-200 text-sm focus-visible:ring-teal-700"
                      />
                      <div className="flex justify-between items-center text-[11px]">
                        {serverErrors.name ? (
                          <span className="text-rose-600 font-medium">{serverErrors.name}</span>
                        ) : (
                          <span className="text-stone-400">Clear, descriptive title for search indexing</span>
                        )}
                        <span className="text-stone-400 tabular-nums">{field.state.value.length}/200</span>
                      </div>
                    </div>
                  )}
                </form.Field>

                {/* 2. category (UUID string from GET /api/v1/categories/all_category/) */}
                <form.Field name="category">
                  {(field) => (
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor={field.name} className="text-xs font-bold text-stone-800">
                        Category <span className="text-orange-600">*</span>
                      </Label>
                      <Select
                        value={field.state.value}
                        onValueChange={(val) => field.handleChange(val)}
                      >
                        <SelectTrigger id={field.name} className="rounded-xl border-stone-200 text-sm bg-white">
                          <SelectValue
                            placeholder={categoriesLoading ? "Loading categories..." : "Select craft category"}
                          />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-stone-200 max-h-64">
                          {categories.map((cat: Category) => (
                            <SelectItem key={cat.id} value={String(cat.id)}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {serverErrors.category && (
                        <p className="text-[11px] text-rose-600 font-medium">{serverErrors.category}</p>
                      )}
                    </div>
                  )}
                </form.Field>
              </div>
            </div>

            {/* CARD 2: Pricing Model & Financials */}
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                <DollarSign className="h-5 w-5 text-teal-800" />
                <h2 className="text-lg font-bold text-stone-900">2. Pricing Architecture</h2>
              </div>

              {/* 3. pricing_type radio selector */}
              <form.Field name="pricing_type">
                {(field) => (
                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-stone-800 block">
                      Select Pricing Model <span className="text-orange-600">*</span>
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Fixed */}
                      <button
                        type="button"
                        onClick={() => field.handleChange("fixed")}
                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                          field.state.value === "fixed"
                            ? "border-teal-700 bg-teal-50/60 ring-2 ring-teal-700/20 shadow-xs"
                            : "border-stone-200 hover:border-stone-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="h-9 w-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                            <DollarSign className="h-5 w-5" />
                          </div>
                          {field.state.value === "fixed" && (
                            <Badge className="bg-teal-800 text-white text-[10px]">Active</Badge>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-stone-900">Fixed Price</p>
                          <p className="text-xs text-stone-500 mt-0.5">Fixed package fee for entire service</p>
                        </div>
                      </button>

                      {/* Hourly */}
                      <button
                        type="button"
                        onClick={() => field.handleChange("hourly")}
                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                          field.state.value === "hourly"
                            ? "border-orange-600 bg-orange-50/60 ring-2 ring-orange-600/20 shadow-xs"
                            : "border-stone-200 hover:border-stone-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="h-9 w-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                            <Clock className="h-5 w-5" />
                          </div>
                          {field.state.value === "hourly" && (
                            <Badge className="bg-orange-600 text-white text-[10px]">Active</Badge>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-stone-900">Hourly Rate</p>
                          <p className="text-xs text-stone-500 mt-0.5">Billed based on time spent on site</p>
                        </div>
                      </button>

                      {/* Quotation */}
                      <button
                        type="button"
                        onClick={() => field.handleChange("quotation")}
                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                          field.state.value === "quotation"
                            ? "border-amber-600 bg-amber-50/60 ring-2 ring-amber-600/20 shadow-xs"
                            : "border-stone-200 hover:border-stone-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                            <Sparkles className="h-5 w-5" />
                          </div>
                          {field.state.value === "quotation" && (
                            <Badge className="bg-amber-600 text-white text-[10px]">Active</Badge>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-stone-900">Custom Quote</p>
                          <p className="text-xs text-stone-500 mt-0.5">Custom quotation upon inspection</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </form.Field>

              {/* 4. base_price (Conditional: Only when fixed) */}
              {form.state.values.pricing_type === "fixed" && (
                <form.Field name="base_price">
                  {(field) => (
                    <div className="p-4 rounded-2xl bg-teal-50/40 border border-teal-200/80 space-y-1.5 animate-in fade-in-50">
                      <Label htmlFor={field.name} className="text-xs font-bold text-stone-800">
                        Fixed Base Price (৳ BDT) <span className="text-orange-600">*</span>
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-sm">
                          ৳
                        </span>
                        <Input
                          id={field.name}
                          type="number"
                          step="0.01"
                          placeholder="e.g. 1000.00"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="pl-8 rounded-xl border-stone-200 bg-white text-sm tabular-nums font-semibold"
                        />
                      </div>
                      {serverErrors.base_price && (
                        <p className="text-[11px] text-rose-600 font-medium">{serverErrors.base_price}</p>
                      )}
                      <p className="text-[11px] text-stone-500">
                        Customers will pay a 20% online advance (৳{(Number(field.state.value || 0) * 0.2).toFixed(2)}) upon booking confirmation.
                      </p>
                    </div>
                  )}
                </form.Field>
              )}

              {/* 5. hour_base_price (Conditional: Only when hourly) */}
              {form.state.values.pricing_type === "hourly" && (
                <form.Field name="hour_base_price">
                  {(field) => (
                    <div className="p-4 rounded-2xl bg-orange-50/40 border border-orange-200/80 space-y-1.5 animate-in fade-in-50">
                      <Label htmlFor={field.name} className="text-xs font-bold text-stone-800">
                        Hourly Rate (৳ BDT / Hour) <span className="text-orange-600">*</span>
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-sm">
                          ৳
                        </span>
                        <Input
                          id={field.name}
                          type="number"
                          step="0.01"
                          placeholder="e.g. 250.00"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="pl-8 rounded-xl border-stone-200 bg-white text-sm tabular-nums font-semibold"
                        />
                      </div>
                      {serverErrors.hour_base_price && (
                        <p className="text-[11px] text-rose-600 font-medium">{serverErrors.hour_base_price}</p>
                      )}
                      <p className="text-[11px] text-stone-500">
                        Calculated based on appointment duration selected by customer during checkout.
                      </p>
                    </div>
                  )}
                </form.Field>
              )}
            </div>

            {/* CARD 3: Editorial Content (Tiptap Rich-Text & Short Description) */}
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                <AlignLeft className="h-5 w-5 text-teal-800" />
                <h2 className="text-lg font-bold text-stone-900">3. Descriptions & Scope of Work</h2>
              </div>

              {/* 6. shot_description (Exact key: shot_description, max 255 chars) */}
              <form.Field name="shot_description">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name} className="text-xs font-bold text-stone-800">
                      Short Tagline (Overview)
                    </Label>
                    <Textarea
                      id={field.name}
                      rows={2}
                      maxLength={255}
                      placeholder="Brief 1-2 sentence overview shown on search cards and mobile discovery grids..."
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="rounded-xl border-stone-200 text-sm focus-visible:ring-teal-700"
                    />
                    <div className="flex justify-between items-center text-[11px]">
                      {serverErrors.shot_description ? (
                        <span className="text-rose-600 font-medium">{serverErrors.shot_description}</span>
                      ) : (
                        <span className="text-stone-400">Concise pitch for marketplace catalog cards</span>
                      )}
                      <span className="text-stone-400 tabular-nums">{field.state.value.length}/255</span>
                    </div>
                  </div>
                )}
              </form.Field>

              {/* 7. description (Tiptap HTML Editor) */}
              <form.Field name="description">
                {(field) => (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={field.name} className="text-xs font-bold text-stone-800">
                        Full Detailed Scope of Work (Rich-Text HTML)
                      </Label>
                      <span className="text-[11px] text-stone-400">Bleach sanitized tags only</span>
                    </div>

                    <RichHtmlEditor
                      value={field.state.value}
                      onChange={(html) => field.handleChange(html)}
                    />

                    {serverErrors.description && (
                      <p className="text-[11px] text-rose-600 font-medium">{serverErrors.description}</p>
                    )}
                    <p className="text-[11px] text-stone-500">
                      Supports headings (H2, H3), bold, italic, underline, bullet lists, numbered lists, and blockquotes.
                    </p>
                  </div>
                )}
              </form.Field>
            </div>

            {/* CARD 4: Media Showcase & Publication Status */}
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                <ImageIcon className="h-5 w-5 text-teal-800" />
                <h2 className="text-lg font-bold text-stone-900">4. Visuals & Availability</h2>
              </div>

              {/* 9. image (File upload with Cloudinary preview) */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-stone-800 block">
                  Showcase Cover Banner
                </Label>

                {imagePreview ? (
                  <div className="relative aspect-[16/9] w-full max-w-lg rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 shadow-xs">
                    <img
                      src={imagePreview}
                      alt="Service banner preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 hover:bg-black text-white shadow-md transition-colors"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("file-input")?.click()}
                    className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                      dragOver
                        ? "border-teal-700 bg-teal-50/50"
                        : "border-stone-300 hover:border-teal-700/60 bg-stone-50/60 hover:bg-stone-50"
                    }`}
                  >
                    <input
                      id="file-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file);
                      }}
                    />
                    <div className="h-14 w-14 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-center mx-auto text-teal-800 mb-3">
                      <UploadCloud className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-bold text-stone-900">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-stone-500 mt-1">
                      PNG, JPG, or WebP up to 5MB (Uploaded directly to Cloudinary)
                    </p>
                  </div>
                )}
                {serverErrors.image && (
                  <p className="text-[11px] text-rose-600 font-medium">{serverErrors.image}</p>
                )}
              </div>

              {/* 8. is_active (Publish immediate toggle switch) */}
              <form.Field name="is_active">
                {(field) => (
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-200">
                    <div>
                      <Label htmlFor={field.name} className="text-xs font-bold text-stone-900 block cursor-pointer">
                        Publish service immediately
                      </Label>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        When enabled, clients in your area can discover and book this service right away.
                      </p>
                    </div>

                    <button
                      type="button"
                      id={field.name}
                      role="switch"
                      aria-checked={field.state.value}
                      onClick={() => field.handleChange(!field.state.value)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2 ${
                        field.state.value ? "bg-teal-800" : "bg-stone-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          field.state.value ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                )}
              </form.Field>
            </div>

            {/* Submit Action Strip */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                asChild
                className="rounded-xl border-stone-300 text-stone-700 hover:bg-stone-100"
              >
                <Link href="/dashboard/provider">Cancel</Link>
              </Button>

              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-sm px-7 py-2.5 rounded-xl shadow-tactile transition-all"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Publishing Service...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Publish Service
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </ProtectedRoute>
  );
}
