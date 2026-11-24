"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ShieldAlert,
  Trash2,
  ExternalLink,
  Search,
  AlertCircle,
  Loader2,
  Layers,
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { servicesService } from "@/features/services/services/services.service";
import { adminService } from "@/features/admin/services/admin.service";
import type { Service } from "@/types/api";

export function AdminServiceModerationTab() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [deletingService, setDeletingService] = React.useState<Service | null>(null);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services", "all_admin_moderation"],
    queryFn: () => servicesService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => adminService.deleteService(id),
    onSuccess: () => {
      toast.success("Service listing removed by admin moderation.");
      setDeletingService(null);
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to remove service.");
    },
  });

  const filteredServices = React.useMemo(() => {
    if (!searchQuery.trim()) return services;
    const q = searchQuery.toLowerCase();
    return services.filter((s) => {
      const name = (s.name || "").toLowerCase();
      const cat = (s.category_name || "").toLowerCase();
      const prov = (s.provider_name || "").toLowerCase();
      return name.includes(q) || cat.includes(q) || prov.includes(q);
    });
  }, [services, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search all services by title, pro or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-stone-800 placeholder:text-stone-400"
          />
        </div>

        <div className="text-xs text-stone-500 font-medium self-center">
          Monitoring <strong>{filteredServices.length}</strong> active service listings
        </div>
      </div>

      {/* Services Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 bg-white rounded-xl border border-stone-200 space-y-2">
              <Skeleton className="h-5 w-1/3 rounded" />
              <Skeleton className="h-4 w-1/4 rounded" />
            </div>
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-stone-300">
          <Layers className="h-10 w-10 text-stone-300 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-stone-800">No services found</h3>
          <p className="text-xs text-stone-500 mt-1">
            {searchQuery ? "No service listings match your search term." : "No published services on the platform."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Pricing</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-stone-900">{service.name}</div>
                      <span className="text-[11px] font-mono text-stone-400">
                        #{String(service.id).slice(0, 8)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className="bg-stone-100 text-stone-700 border-stone-200 text-[10px]">
                        {service.category_name || "General"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 capitalize font-semibold text-stone-800">
                      {service.pricing_type}
                    </td>
                    <td className="py-3 px-4">
                      {service.provider_name || "Provider"}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link
                        href={`/services/${service.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-teal-800 hover:text-teal-950 font-semibold text-xs"
                      >
                        Inspect <ExternalLink className="h-3 w-3" />
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeletingService(service)}
                        className="h-7 text-xs border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="h-3 w-3 mr-1" /> Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!deletingService} onOpenChange={(open) => !open && setDeletingService(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl border-stone-200">
          <DialogHeader>
            <DialogTitle className="text-stone-900 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-600" />
              Remove Service from Platform?
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-600">
              Are you sure you want to delete <strong>"{deletingService?.name}"</strong>? This will permanently remove the listing from the customer marketplace.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingService(null)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => deletingService && deleteMutation.mutate(deletingService.id)}
              disabled={deleteMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
            >
              {deleteMutation.isPending ? "Removing..." : "Confirm Moderation Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
