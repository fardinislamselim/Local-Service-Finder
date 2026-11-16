"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Edit, Trash2, ArrowLeft, Compass, Navigation } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormInput, FieldWrapper } from "@/components/shared/form-field";
import { locationsService } from "@/features/locations/services/locations.service";
import type { Division, District, Upazila } from "@/types/api";

export default function AdminLocationsPage() {
  const queryClient = useQueryClient();

  // Dialog states
  const [divisionDialogOpen, setDivisionDialogOpen] = React.useState(false);
  const [districtDialogOpen, setDistrictDialogOpen] = React.useState(false);
  const [upazilaDialogOpen, setUpazilaDialogOpen] = React.useState(false);

  // Form values
  const [divName, setDivName] = React.useState("");
  const [distName, setDistName] = React.useState("");
  const [distDivisionId, setDistDivisionId] = React.useState("");
  const [upaName, setUpaName] = React.useState("");
  const [upaDistrictId, setUpaDistrictId] = React.useState("");

  // Queries
  const { data: divData, isLoading: divLoading } = useQuery({
    queryKey: ["locations", "divisions"],
    queryFn: () => locationsService.getDivisions(),
  });

  const { data: distData, isLoading: distLoading } = useQuery({
    queryKey: ["locations", "districts"],
    queryFn: () => locationsService.getDistricts(),
  });

  const { data: upaData, isLoading: upaLoading } = useQuery({
    queryKey: ["locations", "upazilas"],
    queryFn: () => locationsService.getUpazilas(),
  });

  const divisions: Division[] = divData || [];
  const districts: District[] = distData || [];
  const upazilas: Upazila[] = upaData || [];

  // Mutations
  const createDivMutation = useMutation({
    mutationFn: (name: string) => locationsService.createDivision({ name }),
    onSuccess: () => {
      toast.success("Division created!");
      queryClient.invalidateQueries({ queryKey: ["locations", "divisions"] });
      setDivisionDialogOpen(false);
      setDivName("");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to create division"),
  });

  const deleteDivMutation = useMutation({
    mutationFn: (id: number | string) => locationsService.deleteDivision(id),
    onSuccess: () => {
      toast.success("Division deleted");
      queryClient.invalidateQueries({ queryKey: ["locations", "divisions"] });
    },
  });

  const createDistMutation = useMutation({
    mutationFn: (data: { name: string; division: string }) =>
      locationsService.createDistrict({ name: data.name, division: data.division }),
    onSuccess: () => {
      toast.success("District created!");
      queryClient.invalidateQueries({ queryKey: ["locations", "districts"] });
      setDistrictDialogOpen(false);
      setDistName("");
      setDistDivisionId("");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to create district"),
  });

  const deleteDistMutation = useMutation({
    mutationFn: (id: number | string) => locationsService.deleteDistrict(id),
    onSuccess: () => {
      toast.success("District deleted");
      queryClient.invalidateQueries({ queryKey: ["locations", "districts"] });
    },
  });

  const createUpaMutation = useMutation({
    mutationFn: (data: { name: string; district: string }) =>
      locationsService.createUpazila({ name: data.name, district: data.district }),
    onSuccess: () => {
      toast.success("Upazila created!");
      queryClient.invalidateQueries({ queryKey: ["locations", "upazilas"] });
      setUpazilaDialogOpen(false);
      setUpaName("");
      setUpaDistrictId("");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to create upazila"),
  });

  const deleteUpaMutation = useMutation({
    mutationFn: (id: number | string) => locationsService.deleteUpazila(id),
    onSuccess: () => {
      toast.success("Upazila deleted");
      queryClient.invalidateQueries({ queryKey: ["locations", "upazilas"] });
    },
  });

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/admin"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to admin overview
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Geographic Territories</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage administrative divisions, districts, and upazilas/thanas used for service matching.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Divisions Column */}
        <Card className="border-border/80 shadow-sm flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Compass className="h-4 w-4 text-primary" />
                Divisions ({divisions.length})
              </CardTitle>
            </div>
            <Button size="sm" variant="outline" onClick={() => setDivisionDialogOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {divLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : divisions.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No divisions added.</p>
            ) : (
              divisions.map((d) => (
                <div
                  key={d.id}
                  className="p-2.5 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-between text-sm"
                >
                  <span className="font-medium">{d.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if (confirm(`Delete division "${d.name}"?`)) deleteDivMutation.mutate(d.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Districts Column */}
        <Card className="border-border/80 shadow-sm flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Navigation className="h-4 w-4 text-primary" />
                Districts ({districts.length})
              </CardTitle>
            </div>
            <Button size="sm" variant="outline" onClick={() => setDistrictDialogOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {distLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : districts.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No districts added.</p>
            ) : (
              districts.map((d) => (
                <div
                  key={d.id}
                  className="p-2.5 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-between text-sm"
                >
                  <div>
                    <span className="font-medium block">{d.name}</span>
                    <span className="text-[11px] text-muted-foreground">Div ID: #{String(d.division)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if (confirm(`Delete district "${d.name}"?`)) deleteDistMutation.mutate(d.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upazilas Column */}
        <Card className="border-border/80 shadow-sm flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Upazilas / Thanas ({upazilas.length})
              </CardTitle>
            </div>
            <Button size="sm" variant="outline" onClick={() => setUpazilaDialogOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {upaLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : upazilas.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No upazilas added.</p>
            ) : (
              upazilas.map((u) => (
                <div
                  key={u.id}
                  className="p-2.5 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-between text-sm"
                >
                  <div>
                    <span className="font-medium block">{u.name}</span>
                    <span className="text-[11px] text-muted-foreground">Dist ID: #{String(u.district)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if (confirm(`Delete upazila "${u.name}"?`)) deleteUpaMutation.mutate(u.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Division Dialog */}
      <Dialog open={divisionDialogOpen} onOpenChange={setDivisionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Division</DialogTitle>
            <DialogDescription>Create a top-level administrative division.</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <FormInput
              label="Division Name"
              required
              placeholder="e.g. Dhaka"
              value={divName}
              onChange={(e) => setDivName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDivisionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={createDivMutation.isPending || !divName.trim()}
              onClick={() => createDivMutation.mutate(divName.trim())}
            >
              Save Division
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* District Dialog */}
      <Dialog open={districtDialogOpen} onOpenChange={setDistrictDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add District</DialogTitle>
            <DialogDescription>Attach a new district under an existing division.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <FormInput
              label="District Name"
              required
              placeholder="e.g. Dhaka"
              value={distName}
              onChange={(e) => setDistName(e.target.value)}
            />
            <FieldWrapper label="Parent Division" required>
              <select
                value={distDivisionId}
                onChange={(e) => setDistDivisionId(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">-- Select Division --</option>
                {divisions.map((d) => (
                  <option key={d.id} value={String(d.id)}>
                    {d.name}
                  </option>
                ))}
              </select>
            </FieldWrapper>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDistrictDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={createDistMutation.isPending || !distName.trim() || !distDivisionId}
              onClick={() =>
                createDistMutation.mutate({ name: distName.trim(), division: distDivisionId })
              }
            >
              Save District
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upazila Dialog */}
      <Dialog open={upazilaDialogOpen} onOpenChange={setUpazilaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Upazila / Thana</DialogTitle>
            <DialogDescription>Attach a new local upazila under a district.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <FormInput
              label="Upazila / Thana Name"
              required
              placeholder="e.g. Dhanmondi"
              value={upaName}
              onChange={(e) => setUpaName(e.target.value)}
            />
            <FieldWrapper label="Parent District" required>
              <select
                value={upaDistrictId}
                onChange={(e) => setUpaDistrictId(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">-- Select District --</option>
                {districts.map((d) => (
                  <option key={d.id} value={String(d.id)}>
                    {d.name}
                  </option>
                ))}
              </select>
            </FieldWrapper>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpazilaDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={createUpaMutation.isPending || !upaName.trim() || !upaDistrictId}
              onClick={() => createUpaMutation.mutate({ name: upaName.trim(), district: upaDistrictId })}
            >
              Save Upazila
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

