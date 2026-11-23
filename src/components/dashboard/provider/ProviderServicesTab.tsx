"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Layers,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  Search,
  DollarSign,
  Clock,
  Sparkles,
  AlertCircle,
  Loader2,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { ServiceBuilderDrawer } from "@/components/dashboard/provider/ServiceBuilderDrawer";
import { servicesService } from "@/features/services/services/services.service";
import { formatCurrency } from "@/lib/utils";
import type { Service } from "@/types/api";

export function ProviderServicesTab() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = React.useState("");

  // Drawer / Dialog states
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedServiceToEdit, setSelectedServiceToEdit] = React.useState<Service | null>(null);
  const [deleteDialogService, setDeleteDialogService] = React.useState<Service | null>(null);

  // Fetch provider's listed services
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services", "provider"],
    queryFn: () => servicesService.getProviderServices(),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => servicesService.delete(id),
    onSuccess: () => {
      toast.success("Service removed from your catalog.");
      setDeleteDialogService(null);
      queryClient.invalidateQueries({ queryKey: ["services", "provider"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete service.");
    },
  });

  // Filter services
  const filteredServices = React.useMemo(() => {
    if (!searchQuery.trim()) return services;
    const q = searchQuery.toLowerCase();
    return services.filter((s) => {
      const name = (s.name || "").toLowerCase();
      const cat = (s.category_name || "").toLowerCase();
      return name.includes(q) || cat.includes(q);
    });
  }, [services, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Catalog Header & Action Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search catalog by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-stone-800 placeholder:text-stone-400"
          />
        </div>

        <Button
          onClick={() => {
            setSelectedServiceToEdit(null);
            setDrawerOpen(true);
          }}
          className="bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold text-xs rounded-xl shadow-tactile self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create New Service
        </Button>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 bg-white rounded-2xl border border-stone-200 space-y-4">
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-5 w-3/4 rounded" />
              <Skeleton className="h-4 w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-stone-300">
          <div className="h-14 w-14 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400 mb-4">
            <Layers className="h-7 w-7 text-stone-400" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-1">
            {searchQuery ? "No matching services found" : "No services listed yet"}
          </h3>
          <p className="text-sm text-stone-500 max-w-sm mx-auto mb-6">
            {searchQuery
              ? "Try searching for a different keyword or clear your filter."
              : "Create your first local service listing so customers in your upazila can discover and book you."}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => {
                setSelectedServiceToEdit(null);
                setDrawerOpen(true);
              }}
              className="bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-tactile"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Create First Service
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((service) => {
            const pricingType = String(service.pricing_type || "").toLowerCase();
            const isFixed = pricingType === "fixed";
            const isHourly = pricingType === "hourly";
            const price = isFixed
              ? service.base_price
              : isHourly
              ? service.hour_base_price
              : null;

            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Image & Badges */}
                <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-[#FAF9F6]">
                      <Layers className="h-8 w-8 text-stone-300 mb-1" />
                      <span className="text-xs">No Photo Available</span>
                    </div>
                  )}

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-white/95 text-stone-800 backdrop-blur-sm shadow-xs border-stone-200 text-[11px] font-semibold">
                      {service.category_name || "Craft Service"}
                    </Badge>
                  </div>

                  {/* Pricing Pill */}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-teal-900/90 text-white backdrop-blur-sm text-[11px] font-medium">
                      {isFixed ? "Fixed Price" : isHourly ? "Hourly Rate" : "Custom Quote"}
                    </Badge>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-stone-900 line-clamp-1 text-base tracking-tight mb-1">
                      {service.name}
                    </h3>

                    {service.shot_description ? (
                      <p className="text-xs text-stone-500 line-clamp-2">
                        {service.shot_description}
                      </p>
                    ) : (
                      <p className="text-xs text-stone-400 italic">No tagline provided</p>
                    )}
                  </div>

                  {/* Price Tag Strip */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-stone-400 block">Rate Model</span>
                      <span className="text-sm font-extrabold text-stone-900 tabular-nums">
                        {price !== null && price !== undefined ? (
                          <>
                            ৳{Number(price).toLocaleString()}
                            {isHourly ? <span className="text-xs font-normal text-stone-500"> / hr</span> : ""}
                          </>
                        ) : (
                          "Quote on inspection"
                        )}
                      </span>
                    </div>

                    <Link
                      href={`/services/${service.id}`}
                      target="_blank"
                      className="text-xs text-teal-800 hover:text-teal-950 font-semibold inline-flex items-center gap-1"
                    >
                      Public View <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                {/* Action Card Footer */}
                <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedServiceToEdit(service);
                      setDrawerOpen(true);
                    }}
                    className="flex-1 text-xs rounded-xl border-stone-200 hover:bg-white hover:text-teal-900"
                  >
                    <Edit3 className="h-3.5 w-3.5 mr-1" />
                    Edit Service
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteDialogService(service)}
                    className="text-xs rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Service Builder / Edit Drawer */}
      <ServiceBuilderDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        serviceToEdit={selectedServiceToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteDialogService}
        onOpenChange={(open) => !open && setDeleteDialogService(null)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl border-stone-200">
          <DialogHeader>
            <DialogTitle className="text-stone-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-600" />
              Remove Service from Catalog?
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-600">
              Are you sure you want to delete{" "}
              <strong>"{deleteDialogService?.name}"</strong>? Customers will no longer be able to discover or book this service.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogService(null)}
              disabled={deleteMutation.isPending}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => deleteDialogService && deleteMutation.mutate(deleteDialogService.id)}
              disabled={deleteMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Service"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
