"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Save, Layers, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FormInput, FormTextarea, FieldWrapper } from "@/components/shared/form-field";
import { servicesService } from "@/features/services/services/services.service";
import { categoriesService } from "@/features/categories/services/categories.service";
import type { Category, PricingType, Service } from "@/types/api";

export default function EditServicePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const serviceId = params?.id as string;

  // Form states
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [pricingType, setPricingType] = React.useState<PricingType>("FIXED");
  const [price, setPrice] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  // Queries
  const { data: service, isLoading: serviceLoading } = useQuery({
    queryKey: ["service", serviceId],
    queryFn: () => servicesService.getById(serviceId),
    enabled: !!serviceId,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => categoriesService.getAll(),
  });

  const categories: Category[] = categoriesData || [];

  // Populate form with existing service data
  React.useEffect(() => {
    if (service) {
      setName(service.name || "");
      const catId = typeof service.category === "object" ? String(service.category?.id) : String(service.category || "");
      setCategory(catId);
      setDescription(service.description || "");
      const isHourly = String(service.pricing_type).toUpperCase() === "HOURLY";
      setPricingType(isHourly ? "HOURLY" : "FIXED");
      const p = isHourly ? service.hour_base_price : service.base_price;
      setPrice(String(p || "0"));
      setIsActive(Boolean(service.is_active));
      setImagePreview(service.image || null);
    }
  }, [service]);

  const updateMutation = useMutation({
    mutationFn: () => {
      const isHourly = pricingType === "HOURLY";
      return servicesService.update(serviceId, {
        name: name.trim(),
        category: category,
        description: description.trim(),
        pricing_type: pricingType,
        base_price: !isHourly ? price : "0.00",
        hour_base_price: isHourly ? price : "0.00",
        is_active: isActive ? "true" : "false",
        image: imageFile,
      });
    },
    onSuccess: () => {
      toast.success("Service changes saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["service", serviceId] });
      router.push("/dashboard/provider/services");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update service.");
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  if (serviceLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <h2 className="text-xl font-bold">Service Not Found</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          The requested service could not be located in your catalog.
        </p>
        <Button asChild>
          <Link href="/dashboard/provider/services">Back to My Services</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/dashboard/provider/services"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to my services
      </Link>

      <Card className="border-border/80 shadow-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Edit Service Details</CardTitle>
            <Badge variant="outline" className="text-xs font-mono">
              Service #{serviceId}
            </Badge>
          </div>
          <CardDescription>
            Modify service descriptions, pricing model, active availability, and gallery photo.
          </CardDescription>
        </CardHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateMutation.mutate();
          }}
        >
          <CardContent className="space-y-5">
            {/* Title */}
            <FormInput
              label="Service Title"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {/* Category */}
            <FieldWrapper label="Category" required>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">-- Choose Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </FieldWrapper>

            {/* Pricing Model */}
            <FieldWrapper label="Pricing Structure" required>
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setPricingType("FIXED")}
                  className={`p-3 rounded-lg border text-xs font-semibold transition-all ${
                    pricingType === "FIXED"
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                      : "border-input hover:bg-accent text-muted-foreground"
                  }`}
                >
                  Fixed Price
                </button>

                <button
                  type="button"
                  onClick={() => setPricingType("HOURLY")}
                  className={`p-3 rounded-lg border text-xs font-semibold transition-all ${
                    pricingType === "HOURLY"
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                      : "border-input hover:bg-accent text-muted-foreground"
                  }`}
                >
                  Hourly Rate
                </button>
              </div>
            </FieldWrapper>

            {/* Price */}
            <FormInput
              label={`Rate (${pricingType === "HOURLY" ? "per hour in BDT ৳" : "total price in BDT ৳"})`}
              type="number"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            {/* Description */}
            <FormTextarea
              label="Service Details & Scope"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />

            {/* Status toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/70 bg-muted/20">
              <div>
                <p className="font-semibold text-sm">Service Availability</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  When enabled, customers can discover and book this service in the public catalog.
                </p>
              </div>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-5 w-5 rounded border-border accent-primary cursor-pointer"
              />
            </div>

            {/* Service Banner Image */}
            <FieldWrapper label="Service Banner Image">
              <div className="space-y-3">
                {imagePreview && (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border shadow-sm bg-muted/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Service preview"
                      className="object-cover w-full h-full"
                    />
                    <Badge variant="secondary" className="absolute bottom-2 left-2 text-[10px] bg-background/90">
                      {imageFile ? "New file selected (pending save)" : "Current published image"}
                    </Badge>
                  </div>
                )}

                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-xs cursor-pointer"
                />
                <p className="text-[11px] text-muted-foreground">
                  Leave empty to retain your current banner image. Select a new file to update it.
                </p>
              </div>
            </FieldWrapper>
          </CardContent>

          <CardFooter className="flex justify-between items-center pt-5 border-t border-border">
            <Button variant="outline" type="button" asChild>
              <Link href="/dashboard/provider/services">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending || !name.trim() || !description.trim() || !price}
              className="gap-2 font-semibold shadow"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
