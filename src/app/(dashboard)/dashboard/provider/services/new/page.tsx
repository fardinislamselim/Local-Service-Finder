"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import { ArrowLeft, Loader2, PlusCircle, Layers, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormInput, FormTextarea, FieldWrapper, getFieldError } from "@/components/shared/form-field";
import { servicesService } from "@/features/services/services/services.service";
import { categoriesService } from "@/features/categories/services/categories.service";
import type { Category, PricingType } from "@/types/api";

const createServiceSchema = z.object({
  name: z.string().min(2, "Service name is required").max(100),
  category: z.string().min(1, "Please select a category"),
  description: z.string().min(10, "Please provide a detailed description (at least 10 chars)"),
  pricing_type: z.enum(["FIXED", "HOURLY"]),
  price: z.string().min(1, "Price is required"),
  is_active: z.boolean(),
});

export default function NewServicePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [imageFile, setImageFile] = React.useState<File | null>(null);

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => categoriesService.getAll(),
  });

  const categories: Category[] = categoriesData || [];

  const createMutation = useMutation({
    mutationFn: (values: {
      name: string;
      category: string;
      description: string;
      pricing_type: PricingType;
      price: string;
      is_active: boolean;
    }) =>
      servicesService.create({
        name: values.name,
        category: values.category,
        description: values.description,
        pricing_type: values.pricing_type,
        base_price: values.pricing_type === "FIXED" ? values.price : "0.00",
        hour_base_price: values.pricing_type === "HOURLY" ? values.price : "0.00",
        is_active: values.is_active ? "true" : "false",
        image: imageFile,
      }),
    onSuccess: () => {
      toast.success("New service created and published!");
      queryClient.invalidateQueries({ queryKey: ["services"] });
      router.push("/dashboard/provider/services");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create service.");
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      category: "",
      description: "",
      pricing_type: "FIXED" as PricingType,
      price: "1000",
      is_active: true,
    },
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync(value);
    },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/dashboard/provider/services"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to my services
      </Link>

      <Card className="border-border/80 shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <PlusCircle className="h-6 w-6 text-primary" />
            Add New Service Offering
          </CardTitle>
          <CardDescription>
            Publish a service to make it bookable by customers in your area.
          </CardDescription>
        </CardHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <CardContent className="space-y-4">
            {/* Service Title */}
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) => {
                  const res = createServiceSchema.shape.name.safeParse(value);
                  return res.success ? undefined : res.error.errors[0]?.message;
                },
              }}
            >
              {(field) => (
                <FormInput
                  label="Service Title"
                  required
                  placeholder="e.g. Air Conditioner Deep Master Cleaning"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={getFieldError(field.state.meta.errors)}
                />
              )}
            </form.Field>

            {/* Category */}
            <form.Field
              name="category"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return "Please choose a category";
                  return undefined;
                },
              }}
            >
              {(field) => (
                <FieldWrapper
                  label="Category"
                  required
                  error={getFieldError(field.state.meta.errors)}
                >
                  <select
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </FieldWrapper>
              )}
            </form.Field>

            {/* Pricing Type */}
            <form.Field name="pricing_type">
              {(field) => (
                <FieldWrapper label="Pricing Structure" required>
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => field.handleChange("FIXED")}
                      className={`p-3 rounded-lg border text-xs font-semibold transition-all ${
                        field.state.value === "FIXED"
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                          : "border-input hover:bg-accent text-muted-foreground"
                      }`}
                    >
                      Fixed Price
                    </button>

                    <button
                      type="button"
                      onClick={() => field.handleChange("HOURLY")}
                      className={`p-3 rounded-lg border text-xs font-semibold transition-all ${
                        field.state.value === "HOURLY"
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                          : "border-input hover:bg-accent text-muted-foreground"
                      }`}
                    >
                      Hourly Rate
                    </button>
                  </div>
                </FieldWrapper>
              )}
            </form.Field>

            {/* Price */}
            <form.Field
              name="price"
              validators={{
                onChange: ({ value }) => {
                  const res = createServiceSchema.shape.price.safeParse(value);
                  return res.success ? undefined : res.error.errors[0]?.message;
                },
              }}
            >
              {(field) => (
                <FormInput
                  label="Rate (in BDT ৳)"
                  type="number"
                  step="0.01"
                  required
                  placeholder="1200.00"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={getFieldError(field.state.meta.errors)}
                />
              )}
            </form.Field>

            {/* Description */}
            <form.Field
              name="description"
              validators={{
                onChange: ({ value }) => {
                  const res = createServiceSchema.shape.description.safeParse(value);
                  return res.success ? undefined : res.error.errors[0]?.message;
                },
              }}
            >
              {(field) => (
                <FormTextarea
                  label="Service Details & Scope"
                  required
                  placeholder="Explain what tools are provided, what tasks are covered, warranty, etc."
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={getFieldError(field.state.meta.errors)}
                  rows={4}
                />
              )}
            </form.Field>

            {/* Banner Image */}
            <FieldWrapper label="Banner Image (Optional)">
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e.target.files?.[0]) setImageFile(e.target.files[0]);
                  }}
                  className="cursor-pointer file:cursor-pointer"
                />
              </div>
            </FieldWrapper>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" type="button" asChild>
              <Link href="/dashboard/provider/services">Cancel</Link>
            </Button>
            <Button type="submit" disabled={createMutation.isPending} className="gap-2">
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Service...
                </>
              ) : (
                "Publish Service"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
