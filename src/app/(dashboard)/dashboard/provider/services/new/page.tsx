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
    onSuccess: () => {
      toast.success("Service created and published successfully.");
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
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Breadcrumb & Heading */}
        <div className="pb-4 border-b border-stone-200 dark:border-stone-800">
          <Link
            href="/dashboard/provider"
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to provider workspace</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
            Publish new service
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            List a trade service with transparent pricing and verified scope of work.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-5"
        >
          {/* CARD 1: Core Details & Classification */}
          <div className="p-5 sm:p-6 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100 dark:border-stone-800 text-stone-900 dark:text-stone-100 font-medium text-sm">
              <Tag className="h-4 w-4 text-stone-500" />
              <span>1. Service details</span>
            </div>

            <div className="space-y-4">
              {/* 1. name */}
              <form.Field name="name">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name} className="text-xs font-medium text-stone-700 dark:text-stone-300">
                      Service name <span className="text-[#EA580C]">*</span>
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="e.g. Master Electrician Circuit & Wiring Inspection"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      maxLength={200}
                      className="h-10 rounded-xl border-stone-200 text-xs focus-visible:border-stone-400 focus-visible:ring-stone-400/20"
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

              {/* 2. category */}
              <form.Field name="category">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name} className="text-xs font-medium text-stone-700 dark:text-stone-300">
                      Category <span className="text-[#EA580C]">*</span>
                    </Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(val) => field.handleChange(val)}
                    >
                      <SelectTrigger id={field.name} className="h-10 rounded-xl border-stone-200 text-xs bg-white dark:bg-stone-900">
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
          <div className="p-5 sm:p-6 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100 dark:border-stone-800 text-stone-900 dark:text-stone-100 font-medium text-sm">
              <DollarSign className="h-4 w-4 text-stone-500" />
              <span>2. Pricing model</span>
            </div>

            {/* pricing_type selector */}
            <form.Field name="pricing_type">
              {(field) => (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-stone-700 dark:text-stone-300 block">
                    Select pricing structure <span className="text-[#EA580C]">*</span>
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Fixed */}
                    <button
                      type="button"
                      onClick={() => field.handleChange("fixed")}
                      className={`p-3 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-between gap-2 ${
                        field.state.value === "fixed"
                          ? "bg-[#FAF9F6] border-stone-900 dark:border-stone-100 ring-1 ring-stone-900 dark:ring-stone-100 dark:bg-stone-800"
                          : "border-stone-200 hover:border-stone-300 bg-white dark:bg-stone-900 dark:border-stone-800"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="h-7 w-7 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center">
                          <DollarSign className="h-3.5 w-3.5" />
                        </div>
                        {field.state.value === "fixed" && (
                          <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">Selected</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-stone-900 dark:text-stone-100">Fixed price</p>
                        <p className="text-[11px] text-stone-500 mt-0.5">Fixed rate for entire scope</p>
                      </div>
                    </button>

                    {/* Hourly */}
                    <button
                      type="button"
                      onClick={() => field.handleChange("hourly")}
                      className={`p-3 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-between gap-2 ${
                        field.state.value === "hourly"
                          ? "bg-[#FAF9F6] border-stone-900 dark:border-stone-100 ring-1 ring-stone-900 dark:ring-stone-100 dark:bg-stone-800"
                          : "border-stone-200 hover:border-stone-300 bg-white dark:bg-stone-900 dark:border-stone-800"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="h-7 w-7 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center">
                          <Clock className="h-3.5 w-3.5" />
                        </div>
                        {field.state.value === "hourly" && (
                          <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">Selected</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-stone-900 dark:text-stone-100">Hourly rate</p>
                        <p className="text-[11px] text-stone-500 mt-0.5">Billed by appointment duration</p>
                      </div>
                    </button>

                    {/* Quotation */}
                    <button
                      type="button"
                      onClick={() => field.handleChange("quotation")}
                      className={`p-3 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-between gap-2 ${
                        field.state.value === "quotation"
                          ? "bg-[#FAF9F6] border-stone-900 dark:border-stone-100 ring-1 ring-stone-900 dark:ring-stone-100 dark:bg-stone-800"
                          : "border-stone-200 hover:border-stone-300 bg-white dark:bg-stone-900 dark:border-stone-800"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="h-7 w-7 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center">
                          <Sparkles className="h-3.5 w-3.5" />
                        </div>
                        {field.state.value === "quotation" && (
                          <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">Selected</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-stone-900 dark:text-stone-100">Custom quote</p>
                        <p className="text-[11px] text-stone-500 mt-0.5">Quoted after site inspection</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </form.Field>

            {/* base_price (Conditional: Only when fixed) */}
            {form.state.values.pricing_type === "fixed" && (
              <form.Field name="base_price">
                {(field) => (
                  <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 space-y-1.5">
                    <Label htmlFor={field.name} className="text-xs font-medium text-stone-700 dark:text-stone-300">
                      Fixed base price (৳ BDT) <span className="text-[#EA580C]">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-medium text-xs">
                        ৳
                      </span>
                      <Input
                        id={field.name}
                        type="number"
                        step="0.01"
                        placeholder="1000.00"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="pl-8 h-10 rounded-xl border-stone-200 bg-white dark:bg-stone-900 text-xs tabular-nums font-medium"
                      />
                    </div>
                    {serverErrors.base_price && (
                      <p className="text-[11px] text-rose-600 font-medium">{serverErrors.base_price}</p>
                    )}
                    <p className="text-[11px] text-stone-500">
                      Customers pay a 20% advance (৳{(Number(field.state.value || 0) * 0.2).toFixed(2)}) held in escrow upon booking confirmation.
                    </p>
                  </div>
                )}
              </form.Field>
            )}

            {/* hour_base_price (Conditional: Only when hourly) */}
            {form.state.values.pricing_type === "hourly" && (
              <form.Field name="hour_base_price">
                {(field) => (
                  <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 space-y-1.5">
                    <Label htmlFor={field.name} className="text-xs font-medium text-stone-700 dark:text-stone-300">
                      Hourly rate (৳ BDT / hour) <span className="text-[#EA580C]">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-medium text-xs">
                        ৳
                      </span>
                      <Input
                        id={field.name}
                        type="number"
                        step="0.01"
                        placeholder="250.00"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="pl-8 h-10 rounded-xl border-stone-200 bg-white dark:bg-stone-900 text-xs tabular-nums font-medium"
                      />
                    </div>
                    {serverErrors.hour_base_price && (
                      <p className="text-[11px] text-rose-600 font-medium">{serverErrors.hour_base_price}</p>
                    )}
                    <p className="text-[11px] text-stone-500">
                      Billed based on total appointment duration selected by the customer.
                    </p>
                  </div>
                )}
              </form.Field>
            )}
          </div>

          {/* CARD 3: Descriptions & Scope of Work */}
          <div className="p-5 sm:p-6 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100 dark:border-stone-800 text-stone-900 dark:text-stone-100 font-medium text-sm">
              <AlignLeft className="h-4 w-4 text-stone-500" />
              <span>3. Description & scope of work</span>
            </div>

            {/* shot_description */}
            <form.Field name="shot_description">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-xs font-medium text-stone-700 dark:text-stone-300">
                    Short tagline (overview)
                  </Label>
                  <Textarea
                    id={field.name}
                    rows={2}
                    maxLength={255}
                    placeholder="Brief 1-2 sentence summary displayed on service cards..."
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="rounded-xl border-stone-200 text-xs focus-visible:border-stone-400 focus-visible:ring-stone-400/20"
                  />
                  <div className="flex justify-between items-center text-[11px]">
                    {serverErrors.shot_description ? (
                      <span className="text-rose-600 font-medium">{serverErrors.shot_description}</span>
                    ) : (
                      <span className="text-stone-400">Concise pitch for catalog search cards</span>
                    )}
                    <span className="text-stone-400 tabular-nums">{field.state.value.length}/255</span>
                  </div>
                </div>
              )}
            </form.Field>

            {/* description (Tiptap Rich-Text Editor) */}
            <form.Field name="description">
              {(field) => (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={field.name} className="text-xs font-medium text-stone-700 dark:text-stone-300">
                      Full detailed scope of work
                    </Label>
                    <span className="text-[11px] text-stone-400">Sanitized HTML</span>
                  </div>

                  <RichHtmlEditor
                    value={field.state.value}
                    onChange={(html) => field.handleChange(html)}
                  />

                  {serverErrors.description && (
                    <p className="text-[11px] text-rose-600 font-medium">{serverErrors.description}</p>
                  )}
                  <p className="text-[11px] text-stone-400">
                    Supports headings, bold, italic, underline, lists, and quotes.
                  </p>
                </div>
              )}
            </form.Field>
          </div>

          {/* CARD 4: Media & Availability */}
          <div className="p-5 sm:p-6 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100 dark:border-stone-800 text-stone-900 dark:text-stone-100 font-medium text-sm">
              <ImageIcon className="h-4 w-4 text-stone-500" />
              <span>4. Visuals & availability</span>
            </div>

            {/* image */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-stone-700 dark:text-stone-300 block">
                Cover banner
              </Label>

              {imagePreview ? (
                <div className="relative aspect-[16/9] w-full max-w-sm rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800">
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
                    className="absolute top-2.5 right-2.5 p-1 rounded-full bg-black/70 hover:bg-black text-white transition-colors"
                    title="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
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
                  className={`border border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                    dragOver
                      ? "border-stone-900 bg-stone-50 dark:bg-stone-800"
                      : "border-stone-300 dark:border-stone-700 hover:border-stone-400 bg-stone-50/50 dark:bg-stone-800/40"
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
                  <div className="h-10 w-10 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center mx-auto text-stone-500 mb-2">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-medium text-stone-800 dark:text-stone-200">
                    Click to select or drag and drop image
                  </p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    PNG, JPG, or WebP up to 5MB
                  </p>
                </div>
              )}
              {serverErrors.image && (
                <p className="text-[11px] text-rose-600 font-medium">{serverErrors.image}</p>
              )}
            </div>

            {/* is_active */}
            <form.Field name="is_active">
              {(field) => (
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800">
                  <div>
                    <Label htmlFor={field.name} className="text-xs font-medium text-stone-900 dark:text-stone-100 block cursor-pointer">
                      Publish immediately
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
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      field.state.value ? "bg-[#115E59]" : "bg-stone-300 dark:bg-stone-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                        field.state.value ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              )}
            </form.Field>
          </div>

          {/* Submit Action Strip */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              asChild
              className="rounded-lg h-9 text-xs border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300"
            >
              <Link href="/dashboard/provider">Cancel</Link>
            </Button>

            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="h-9 px-5 rounded-lg text-xs font-medium bg-[#EA580C] hover:bg-[#c2410c] text-white shadow-xs"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <span>Publish service</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
