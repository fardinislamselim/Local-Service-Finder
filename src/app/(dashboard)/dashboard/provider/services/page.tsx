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
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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

export default function ProviderServicesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = React.useState("");

  // Edit Drawer & Delete Dialog states
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedServiceToEdit, setSelectedServiceToEdit] = React.useState<Service | null>(null);
  const [deleteDialogService, setDeleteDialogService] = React.useState<Service | null>(null);

  // 1. Fetch provider's listed services: GET /api/v1/service/services/
  const {
    data: services = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["services", "provider"],
    queryFn: () => servicesService.getProviderServices(),
  });

  // 2. Delete Mutation: DELETE /api/v1/service/service_modify/{id}/
  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => servicesService.delete(id),
    onSuccess: () => {
      toast.success("Service removed from your catalog.");
      setDeleteDialogService(null);
      queryClient.invalidateQueries({ queryKey: ["services", "provider"] });
      queryClient.invalidateQueries({ queryKey: ["services", "provider_catalog_lookup"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete service.");
    },
  });

  const handleEditClick = (srv: Service) => {
    setSelectedServiceToEdit(srv);
    setDrawerOpen(true);
  };

  const handleDeleteClick = (srv: Service) => {
    setDeleteDialogService(srv);
  };

  const handleConfirmDelete = () => {
    if (!deleteDialogService) return;
    deleteMutation.mutate(deleteDialogService.id);
  };

  // Filter services by title or category
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
    <ProtectedRoute allowedRoles={["SERVICE_PROVIDER"]}>
      <div className="space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <Link href="/dashboard/provider" className="hover:text-teal-800 transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-stone-800 dark:text-stone-200 font-medium">My Services</span>
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
                My published services
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-teal-50 text-teal-900 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-200 dark:border-teal-800">
                {services.length} active
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Manage your craft listings, update descriptions, adjust hourly rates, or publish new offerings.
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
              asChild
              className="h-9 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold rounded-xl shadow-tactile gap-1.5"
            >
              <Link href="/dashboard/provider/services/new">
                <Plus className="h-4 w-4" />
                <span>Create New Service</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Search Bar Strip */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 shadow-sm">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search catalog by title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#115E59]/20 focus:border-[#115E59] text-stone-800 dark:text-stone-200 placeholder:text-stone-400 transition-all"
            />
          </div>
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-4"
              >
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-5 w-3/4 rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-6 w-20 rounded" />
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-stone-900 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800">
            <div className="h-14 w-14 rounded-2xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center mx-auto text-teal-800 mb-4">
              <Layers className="h-7 w-7 text-teal-800" />
            </div>
            <h3 className="mb-1 text-sm font-semibold text-stone-900 dark:text-stone-100">
              No services found
            </h3>
            <p className="mx-auto max-w-sm text-xs text-stone-500 dark:text-stone-400 mb-6">
              {searchQuery
                ? `No services match "${searchQuery}".`
                : "You haven't published any service offerings yet. Add a service to begin accepting jobs from local clients."}
            </p>
            <Button
              asChild
              className="bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold text-xs rounded-xl shadow-tactile gap-1.5"
            >
              <Link href="/dashboard/provider/services/new">
                <Plus className="h-4 w-4" />
                <span>Create New Service</span>
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredServices.map((srv) => {
              const pt = String(srv.pricing_type || "").toLowerCase();
              const priceDisplay =
                pt === "fixed" && srv.base_price !== undefined && srv.base_price !== null
                  ? `৳${Number(srv.base_price).toLocaleString()} fixed`
                  : pt === "hourly" && srv.hour_base_price !== undefined && srv.hour_base_price !== null
                  ? `৳${Number(srv.hour_base_price).toLocaleString()} / hr`
                  : "Custom quotation";

              return (
                <div
                  key={String(srv.id)}
                  className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm hover:border-stone-300 dark:hover:border-stone-700 transition-colors flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    {/* Image Banner */}
                    <div className="relative h-44 w-full rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200/60 dark:border-stone-800">
                      {srv.image ? (
                        <img
                          src={srv.image}
                          alt={srv.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center text-stone-400 gap-1.5">
                          <Layers className="h-8 w-8 stroke-[1.5]" />
                          <span className="text-[11px] font-medium">Standard listing photo</span>
                        </div>
                      )}
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                        <Badge
                          variant="secondary"
                          className="bg-white/95 dark:bg-stone-900/95 backdrop-blur text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-[10px] font-semibold"
                        >
                          {srv.category_name || "Service"}
                        </Badge>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm tracking-tight line-clamp-1">
                          {srv.name}
                        </h3>
                        <Link
                          href={`/services/${srv.id}`}
                          target="_blank"
                          className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors shrink-0"
                          title="View public page"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>

                      {srv.shot_description && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                          {srv.shot_description}
                        </p>
                      )}
                    </div>

                    {/* Price Tag Strip */}
                    <div className="pt-2 flex items-center justify-between border-t border-stone-100 dark:border-stone-800 text-xs">
                      <span className="text-stone-500 dark:text-stone-400 font-medium">Pricing model:</span>
                      <span className="font-semibold text-teal-900 dark:text-teal-300 tabular-nums">
                        {priceDisplay}
                      </span>
                    </div>
                  </div>

                  {/* Actions Strip */}
                  <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(srv)}
                      className="h-8 px-2.5 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      <span>Delete</span>
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleEditClick(srv)}
                      className="h-8 px-3 text-xs bg-[#115E59] hover:bg-teal-800 text-white font-medium rounded-lg shadow-sm"
                    >
                      <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                      <span>Edit listing</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={!!deleteDialogService}
          onOpenChange={(open) => !open && setDeleteDialogService(null)}
        >
          <DialogContent className="sm:max-w-md p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl">
            <DialogHeader className="pb-3 border-b border-stone-100 dark:border-stone-800">
              <DialogTitle className="text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                <span>Remove service listing?</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-500 dark:text-stone-400">
                Are you sure you want to delete{" "}
                <strong className="text-stone-800 dark:text-stone-200">
                  {deleteDialogService?.name}
                </strong>
                ? This listing will no longer appear in search results. Existing bookings will remain unaffected.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="pt-4 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteDialogService(null)}
                disabled={deleteMutation.isPending}
                className="text-xs rounded-xl"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs rounded-xl font-medium"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete listing</span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Service Modal Drawer */}
        <ServiceBuilderDrawer
          open={drawerOpen}
          onOpenChange={(open) => {
            setDrawerOpen(open);
            if (!open) setSelectedServiceToEdit(null);
          }}
          serviceToEdit={selectedServiceToEdit}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["services", "provider"] });
            queryClient.invalidateQueries({ queryKey: ["services", "provider_catalog_lookup"] });
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
