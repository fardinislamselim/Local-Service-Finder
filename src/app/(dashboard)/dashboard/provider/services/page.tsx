"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layers, Plus, Edit, Trash2, ShieldCheck, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { FormInput, FormTextarea } from "@/components/shared/form-field";
import { servicesService } from "@/features/services/services/services.service";
import { formatCurrency } from "@/lib/utils";
import type { Service } from "@/types/api";

export default function ProviderServicesPage() {
  const queryClient = useQueryClient();
  const [editingService, setEditingService] = React.useState<Service | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editDesc, setEditDesc] = React.useState("");
  const [editPrice, setEditPrice] = React.useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["services", "provider_services"],
    queryFn: () => servicesService.getProviderServices(),
  });

  const services: Service[] = data || [];

  const updateMutation = useMutation({
    mutationFn: (data: { id: number | string; name: string; description: string; price: string }) =>
      servicesService.update(data.id, {
        name: data.name,
        description: data.description,
        hour_base_price: data.price,
        base_price: data.price,
      }),
    onSuccess: () => {
      toast.success("Service updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setEditingService(null);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update service.");
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

  const handleOpenEdit = (s: Service) => {
    setEditingService(s);
    setEditName(s.name || "");
    setEditDesc(s.description || "");
    const isHourly = String(s.pricing_type).toUpperCase() === "HOURLY";
    const p = isHourly ? s.hour_base_price : s.base_price;
    setEditPrice(String(p || "0"));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">My Services Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your service offerings, rates, descriptions, and availability.
          </p>
        </div>

        <Button asChild className="gap-2 shadow font-semibold">
          <Link href="/dashboard/provider/services/new">
            <Plus className="h-4 w-4" />
            Add New Service
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <Card className="p-12 text-center max-w-lg mx-auto">
          <Layers className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
          <h3 className="font-semibold text-base">No services published yet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Publish your first service to start receiving bookings from customers.
          </p>
          <Button asChild>
            <Link href="/dashboard/provider/services/new">Create a Service</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="flex flex-col justify-between border-border/80 shadow-sm">
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="text-xs uppercase font-semibold">
                    {String(service.pricing_type).toUpperCase() === "HOURLY" ? "Hourly" : "Fixed"}
                  </Badge>
                  {service.is_active ? (
                    <Badge variant="success" className="text-[10px]">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">
                      Inactive
                    </Badge>
                  )}
                </div>

                <CardTitle className="text-lg font-bold line-clamp-1">{service.name}</CardTitle>
                <CardDescription className="line-clamp-2">{service.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold">
                    {formatCurrency(
                      String(service.pricing_type).toUpperCase() === "HOURLY"
                        ? service.hour_base_price
                        : service.base_price
                    )}
                  </span>
                  {String(service.pricing_type).toUpperCase() === "HOURLY" && (
                    <span className="text-xs text-muted-foreground">/ hour</span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
                  <Button variant="outline" size="sm" onClick={() => handleOpenEdit(service)}>
                    <Edit className="h-4 w-4 mr-1.5" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${service.name}"?`)) {
                        deleteMutation.mutate(service.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Service Dialog */}
      <Dialog open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service Details</DialogTitle>
            <DialogDescription>
              Update service title, description, or rate.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <FormInput
              label="Service Title"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />

            <FormTextarea
              label="Service Description"
              required
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              rows={4}
            />

            <FormInput
              label="Price (BDT)"
              type="number"
              step="0.01"
              required
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingService(null)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              disabled={updateMutation.isPending || !editName || !editDesc}
              onClick={() => {
                if (editingService) {
                  updateMutation.mutate({
                    id: editingService.id,
                    name: editName,
                    description: editDesc,
                    price: editPrice,
                  });
                }
              }}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

