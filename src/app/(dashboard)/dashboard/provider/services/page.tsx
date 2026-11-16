"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Calendar,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormInput, FormTextarea, FieldWrapper } from "@/components/shared/form-field";
import { ServiceImage } from "@/components/shared/service-image";
import { servicesService } from "@/features/services/services/services.service";
import { categoriesService } from "@/features/categories/services/categories.service";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Service, Category, PricingType } from "@/types/api";

export default function ProviderServicesPage() {
  const queryClient = useQueryClient();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [pricingFilter, setPricingFilter] = React.useState<string>("ALL");
  const [sortBy, setSortBy] = React.useState<string>("newest");
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 6;

  // Edit Service State
  const [editingService, setEditingService] = React.useState<Service | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editCategory, setEditCategory] = React.useState("");
  const [editDesc, setEditDesc] = React.useState("");
  const [editPricingType, setEditPricingType] = React.useState<PricingType>("FIXED");
  const [editPrice, setEditPrice] = React.useState("");
  const [editIsActive, setEditIsActive] = React.useState(true);
  const [editImageFile, setEditImageFile] = React.useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = React.useState<string | null>(null);

  // Queries
  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ["services", "provider_services"],
    queryFn: () => servicesService.getProviderServices(),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => categoriesService.getAll(),
  });

  const services: Service[] = servicesData || [];
  const categories: Category[] = categoriesData || [];

  // Category map for quick lookup
  const categoryMap = React.useMemo(() => {
    const map = new Map<number | string, string>();
    for (const c of categories) {
      map.set(c.id, c.name);
      map.set(String(c.id), c.name);
    }
    return map;
  }, [categories]);

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (data: {
      id: number | string;
      name: string;
      category: string;
      description: string;
      pricing_type: PricingType;
      price: string;
      is_active: boolean;
      image?: File | null;
    }) => {
      const isHourly = data.pricing_type === "HOURLY";
      return servicesService.update(data.id, {
        name: data.name,
        category: data.category,
        description: data.description,
        pricing_type: data.pricing_type,
        base_price: !isHourly ? data.price : "0.00",
        hour_base_price: isHourly ? data.price : "0.00",
        is_active: data.is_active ? "true" : "false",
        image: data.image,
      });
    },
    onSuccess: () => {
      toast.success("Service updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setEditingService(null);
      setEditImageFile(null);
      setEditImagePreview(null);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update service.");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, currentStatus }: { id: number | string; currentStatus: boolean }) =>
      servicesService.update(id, {
        is_active: (!currentStatus).toString(),
      }),
    onSuccess: (_, variables) => {
      toast.success(
        variables.currentStatus ? "Service deactivated" : "Service activated and visible to customers!"
      );
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to toggle service status.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => servicesService.delete(id),
    onSuccess: () => {
      toast.success("Service deleted.");
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete service.");
    },
  });

  // Filter & Search Logic
  const filteredServices = React.useMemo(() => {
    let list = [...services];

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          categoryMap.get(typeof s.category === "object" ? s.category?.id : s.category)?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== "ALL") {
      list = list.filter((s) => {
        const catId = typeof s.category === "object" ? String(s.category?.id) : String(s.category);
        return catId === selectedCategory;
      });
    }

    // Status filter
    if (statusFilter !== "ALL") {
      const active = statusFilter === "ACTIVE";
      list = list.filter((s) => Boolean(s.is_active) === active);
    }

    // Pricing type filter
    if (pricingFilter !== "ALL") {
      list = list.filter(
        (s) => String(s.pricing_type).toUpperCase() === pricingFilter
      );
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === "price_asc") {
        const pA = Number(a.base_price || a.hour_base_price || 0);
        const pB = Number(b.base_price || b.hour_base_price || 0);
        return pA - pB;
      }
      if (sortBy === "price_desc") {
        const pA = Number(a.base_price || a.hour_base_price || 0);
        const pB = Number(b.base_price || b.hour_base_price || 0);
        return pB - pA;
      }
      if (sortBy === "name_asc") {
        return (a.name || "").localeCompare(b.name || "");
      }
      // default: newest first by id
      return Number(b.id) - Number(a.id);
    });

    return list;
  }, [services, searchTerm, selectedCategory, statusFilter, pricingFilter, sortBy, categoryMap]);

  // Pagination calculation
  const totalItems = filteredServices.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedServices = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredServices.slice(start, start + itemsPerPage);
  }, [filteredServices, currentPage, itemsPerPage]);

  const handleOpenEdit = (s: Service) => {
    setEditingService(s);
    setEditName(s.name || "");
    const catId = typeof s.category === "object" ? String(s.category?.id) : String(s.category || "");
    setEditCategory(catId);
    setEditDesc(s.description || "");
    const isHourly = String(s.pricing_type).toUpperCase() === "HOURLY";
    setEditPricingType(isHourly ? "HOURLY" : "FIXED");
    const p = isHourly ? s.hour_base_price : s.base_price;
    setEditPrice(String(p || "0"));
    setEditIsActive(Boolean(s.is_active));
    setEditImageFile(null);
    setEditImagePreview(s.image || null);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("ALL");
    setStatusFilter("ALL");
    setPricingFilter("ALL");
    setSortBy("newest");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner - identical to Customer Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">My Services Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Publish, edit rates, upload gallery images, and manage service availability.
          </p>
        </div>

        <Button asChild className="gap-2 shadow font-semibold">
          <Link href="/dashboard/provider/services/new">
            <Plus className="h-4 w-4" />
            Add New Service
          </Link>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border-border/80 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by service name or description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 text-sm"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>

          {/* Sort By & Reset */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>

            {(searchTerm || selectedCategory !== "ALL" || statusFilter !== "ALL" || pricingFilter !== "ALL" || sortBy !== "newest") && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleResetFilters}
                title="Reset Filters"
                className="shrink-0 h-9 w-9 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Services List / Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>
            Showing <strong className="text-foreground">{paginatedServices.length}</strong> of{" "}
            <strong className="text-foreground">{totalItems}</strong> published services
          </span>
          {totalPages > 1 && (
            <span>
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>

        {servicesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <Card className="p-12 text-center max-w-lg mx-auto border-border/80 shadow-sm">
            <Layers className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
            <h3 className="font-semibold text-base">No services found</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {services.length === 0
                ? "You haven't created any service offerings yet. Publish your first service to start receiving bookings."
                : "No services match your active search and filter criteria."}
            </p>
            {services.length === 0 ? (
              <Button asChild className="font-semibold">
                <Link href="/dashboard/provider/services/new">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Publish First Service
                </Link>
              </Button>
            ) : (
              <Button variant="outline" onClick={handleResetFilters}>
                Clear Filters
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedServices.map((service) => {
              const isHourly = String(service.pricing_type).toUpperCase() === "HOURLY";
              const price = isHourly ? service.hour_base_price : service.base_price;
              const categoryName =
                service.category_name ||
                categoryMap.get(typeof service.category === "object" ? service.category?.id : service.category) ||
                "General Service";

              return (
                <Card
                  key={service.id}
                  className="flex flex-col justify-between overflow-hidden border-border/80 shadow-sm hover:shadow-md transition-shadow group bg-card"
                >
                  {/* Service Image Banner with graceful fallback */}
                  <div className="relative">
                    <ServiceImage
                      src={service.image}
                      alt={service.name}
                      containerClassName="w-full aspect-video bg-muted/60 relative overflow-hidden"
                    />

                    {/* Category pill on image */}
                    <Badge
                      variant="secondary"
                      className="absolute top-3 left-3 bg-background/90 backdrop-blur text-[11px] font-semibold shadow-sm"
                    >
                      {categoryName}
                    </Badge>

                    {/* Status pill on image */}
                    <div className="absolute top-3 right-3">
                      {service.is_active ? (
                        <Badge variant="success" className="text-[10px] shadow-sm">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] bg-background/90 text-muted-foreground shadow-sm">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-mono">ID: #{service.id}</span>
                        <span>{isHourly ? "Hourly Rate" : "Fixed Price"}</span>
                      </div>

                      <h3 className="font-bold text-base line-clamp-1 group-hover:text-primary transition-colors">
                        {service.name}
                      </h3>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {service.description || "No description provided."}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border/50 flex items-baseline justify-between">
                      <div>
                        <span className="text-2xl font-extrabold text-foreground">
                          {formatCurrency(price)}
                        </span>
                        {isHourly && <span className="text-xs text-muted-foreground"> / hour</span>}
                      </div>

                      {/* Quick Active Toggle */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                        title={service.is_active ? "Click to deactivate" : "Click to activate"}
                        disabled={toggleStatusMutation.isPending}
                        onClick={() =>
                          toggleStatusMutation.mutate({
                            id: service.id,
                            currentStatus: Boolean(service.is_active),
                          })
                        }
                      >
                        {service.is_active ? (
                          <>
                            <ToggleRight className="h-4 w-4 text-emerald-600" />
                            <span className="text-[11px]">Enabled</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                            <span className="text-[11px]">Disabled</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>

                  {/* Actions Footer */}
                  <div className="p-4 pt-0 border-t border-border/40 bg-muted/10 flex items-center justify-between gap-2">
                    <Button variant="ghost" size="sm" asChild className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground">
                      <Link href={`/services/${service.id}`} target="_blank">
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        Preview
                      </Link>
                    </Button>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2.5 text-xs gap-1"
                        onClick={() => handleOpenEdit(service)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          if (confirm(`Are you sure you want to permanently delete "${service.name}"?`)) {
                            deleteMutation.mutate(service.id);
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              Page <strong className="text-foreground">{currentPage}</strong> of{" "}
              <strong className="text-foreground">{totalPages}</strong>
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Comprehensive Edit Service Dialog with Image Upload */}
      <Dialog open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Service Offering</DialogTitle>
            <DialogDescription>
              Update your service details, pricing structure, and display image.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
            {/* Service Title */}
            <FormInput
              label="Service Title"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />

            {/* Category */}
            <FieldWrapper label="Category" required>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
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

            {/* Pricing Structure */}
            <FieldWrapper label="Pricing Structure" required>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditPricingType("FIXED")}
                  className={`p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                    editPricingType === "FIXED"
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                      : "border-input hover:bg-accent text-muted-foreground"
                  }`}
                >
                  Fixed Price
                </button>
                <button
                  type="button"
                  onClick={() => setEditPricingType("HOURLY")}
                  className={`p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                    editPricingType === "HOURLY"
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                      : "border-input hover:bg-accent text-muted-foreground"
                  }`}
                >
                  Hourly Rate
                </button>
              </div>
            </FieldWrapper>

            {/* Rate */}
            <FormInput
              label={`Rate (${editPricingType === "HOURLY" ? "per hour in BDT ৳" : "total price in BDT ৳"})`}
              type="number"
              step="0.01"
              required
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
            />

            {/* Description */}
            <FormTextarea
              label="Service Description"
              required
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              rows={3}
            />

            {/* Service Image with preview & replacement */}
            <FieldWrapper label="Service Image">
              <div className="space-y-3">
                {editImagePreview && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border/80 bg-muted/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={editImagePreview}
                      alt="Current service preview"
                      className="object-cover w-full h-full"
                    />
                    <Badge variant="secondary" className="absolute bottom-2 left-2 text-[10px] bg-background/90">
                      {editImageFile ? "New file selected" : "Current image"}
                    </Badge>
                  </div>
                )}

                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e.target.files?.[0]) {
                      const file = e.target.files[0];
                      setEditImageFile(file);
                      setEditImagePreview(URL.createObjectURL(file));
                    }
                  }}
                  className="cursor-pointer text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  Leave empty to keep the existing image. Select a new JPG/PNG file to replace it.
                </p>
              </div>
            </FieldWrapper>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setEditingService(null)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              disabled={updateMutation.isPending || !editName.trim() || !editDesc.trim() || !editPrice}
              onClick={() => {
                if (editingService) {
                  updateMutation.mutate({
                    id: editingService.id,
                    name: editName,
                    category: editCategory,
                    description: editDesc,
                    pricing_type: editPricingType,
                    price: editPrice,
                    is_active: editIsActive,
                    image: editImageFile,
                  });
                }
              }}
              className="font-semibold gap-1.5"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
