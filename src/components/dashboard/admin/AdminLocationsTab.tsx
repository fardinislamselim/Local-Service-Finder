"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  MapPin,
  Plus,
  Edit3,
  Trash2,
  Loader2,
  AlertCircle,
  Building,
  Navigation,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { locationsService } from "@/features/locations/services/locations.service";
import type { Division, District, Upazila } from "@/types/api";

export function AdminLocationsTab() {
  const queryClient = useQueryClient();

  // Queries
  const { data: divisions = [], isLoading: divLoading } = useQuery({
    queryKey: ["locations", "divisions"],
    queryFn: () => locationsService.getDivisions(),
  });

  const { data: districts = [], isLoading: distLoading } = useQuery({
    queryKey: ["locations", "districts"],
    queryFn: () => locationsService.getDistricts(),
  });

  const { data: upazilas = [], isLoading: upaLoading } = useQuery({
    queryKey: ["locations", "upazilas"],
    queryFn: () => locationsService.getUpazilas(),
  });

  // State for active selections
  const [selectedDivId, setSelectedDivId] = React.useState<number | null>(null);
  const [selectedDistId, setSelectedDistId] = React.useState<number | null>(null);

  // Auto-select first division & district if available
  React.useEffect(() => {
    if (divisions.length > 0 && selectedDivId === null) {
      setSelectedDivId(divisions[0].id);
    }
  }, [divisions, selectedDivId]);

  React.useEffect(() => {
    if (selectedDivId !== null) {
      const filteredDist = districts.filter((d) => d.division === selectedDivId);
      if (filteredDist.length > 0) {
        setSelectedDistId(filteredDist[0].id);
      } else {
        setSelectedDistId(null);
      }
    }
  }, [selectedDivId, districts]);

  // Dialog state: mode = 'division' | 'district' | 'upazila', action = 'create' | 'edit'
  const [dialogState, setDialogState] = React.useState<{
    open: boolean;
    mode: "division" | "district" | "upazila";
    action: "create" | "edit";
    item?: any;
  }>({
    open: false,
    mode: "division",
    action: "create",
  });

  const [dialogName, setDialogName] = React.useState("");

  // Mutations
  const createDivMutation = useMutation({
    mutationFn: (name: string) => locationsService.createDivision({ name }),
    onSuccess: () => {
      toast.success("Division created successfully.");
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setDialogState((prev) => ({ ...prev, open: false }));
    },
    onError: (err: any) => toast.error(err?.message || "Failed to create division."),
  });

  const updateDivMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      locationsService.updateDivision(id, { name }),
    onSuccess: () => {
      toast.success("Division renamed successfully.");
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setDialogState((prev) => ({ ...prev, open: false }));
    },
    onError: (err: any) => toast.error(err?.message || "Failed to rename division."),
  });

  const deleteDivMutation = useMutation({
    mutationFn: (id: number) => locationsService.deleteDivision(id),
    onSuccess: () => {
      toast.success("Division deleted.");
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setSelectedDivId(null);
    },
    onError: (err: any) => toast.error(err?.message || "Failed to delete division."),
  });

  const createDistMutation = useMutation({
    mutationFn: ({ name, division }: { name: string; division: number }) =>
      locationsService.createDistrict({ name, division }),
    onSuccess: () => {
      toast.success("District created successfully.");
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setDialogState((prev) => ({ ...prev, open: false }));
    },
    onError: (err: any) => toast.error(err?.message || "Failed to create district."),
  });

  const updateDistMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      locationsService.updateDistrict(id, { name }),
    onSuccess: () => {
      toast.success("District renamed.");
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setDialogState((prev) => ({ ...prev, open: false }));
    },
    onError: (err: any) => toast.error(err?.message || "Failed to rename district."),
  });

  const deleteDistMutation = useMutation({
    mutationFn: (id: number) => locationsService.deleteDistrict(id),
    onSuccess: () => {
      toast.success("District deleted.");
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setSelectedDistId(null);
    },
    onError: (err: any) => toast.error(err?.message || "Failed to delete district."),
  });

  const createUpaMutation = useMutation({
    mutationFn: ({ name, district }: { name: string; district: number }) =>
      locationsService.createUpazila({ name, district }),
    onSuccess: () => {
      toast.success("Upazila created successfully.");
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setDialogState((prev) => ({ ...prev, open: false }));
    },
    onError: (err: any) => toast.error(err?.message || "Failed to create upazila."),
  });

  const updateUpaMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      locationsService.updateUpazila(id, { name }),
    onSuccess: () => {
      toast.success("Upazila renamed.");
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setDialogState((prev) => ({ ...prev, open: false }));
    },
    onError: (err: any) => toast.error(err?.message || "Failed to rename upazila."),
  });

  const deleteUpaMutation = useMutation({
    mutationFn: (id: number) => locationsService.deleteUpazila(id),
    onSuccess: () => {
      toast.success("Upazila deleted.");
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
    onError: (err: any) => toast.error(err?.message || "Failed to delete upazila."),
  });

  // Filtered districts for selected division
  const currentDistricts = React.useMemo(() => {
    if (!selectedDivId) return [];
    return districts.filter((d) => d.division === selectedDivId);
  }, [districts, selectedDivId]);

  // Filtered upazilas for selected district
  const currentUpazilas = React.useMemo(() => {
    if (!selectedDistId) return [];
    return upazilas.filter((u) => u.district === selectedDistId);
  }, [upazilas, selectedDistId]);

  const handleSubmitDialog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dialogName.trim()) return;

    if (dialogState.mode === "division") {
      if (dialogState.action === "create") createDivMutation.mutate(dialogName.trim());
      else updateDivMutation.mutate({ id: dialogState.item.id, name: dialogName.trim() });
    } else if (dialogState.mode === "district") {
      if (dialogState.action === "create") {
        if (!selectedDivId) return;
        createDistMutation.mutate({ name: dialogName.trim(), division: selectedDivId });
      } else {
        updateDistMutation.mutate({ id: dialogState.item.id, name: dialogName.trim() });
      }
    } else if (dialogState.mode === "upazila") {
      if (dialogState.action === "create") {
        if (!selectedDistId) return;
        createUpaMutation.mutate({ name: dialogName.trim(), district: selectedDistId });
      } else {
        updateUpaMutation.mutate({ id: dialogState.item.id, name: dialogName.trim() });
      }
    }
  };

  const isSaving =
    createDivMutation.isPending ||
    updateDivMutation.isPending ||
    createDistMutation.isPending ||
    updateDistMutation.isPending ||
    createUpaMutation.isPending ||
    updateUpaMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-stone-900 text-sm flex items-center gap-2">
            <Navigation className="h-4 w-4 text-teal-800" />
            3-Tier Hierarchical Location Architecture
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Select a Division to view its Districts, then select a District to view its Upazilas.
          </p>
        </div>
      </div>

      {/* 3-Column Manager */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Divisions */}
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col h-[380px] md:h-[520px]">
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-stone-900 text-xs">
                1. Divisions ({divisions.length})
              </h4>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setDialogName("");
                setDialogState({ open: true, mode: "division", action: "create" });
              }}
              className="h-7 text-xs rounded-lg"
            >
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {divLoading ? (
              <div className="p-4 space-y-2">
                <Skeleton className="h-8 w-full rounded" />
                <Skeleton className="h-8 w-full rounded" />
              </div>
            ) : divisions.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-400">No divisions registered</div>
            ) : (
              divisions.map((div) => (
                <div
                  key={div.id}
                  onClick={() => setSelectedDivId(div.id)}
                  className={`p-2.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-all ${
                    selectedDivId === div.id
                      ? "bg-teal-800 text-white font-semibold shadow-sm"
                      : "hover:bg-stone-100 text-stone-700"
                  }`}
                >
                  <span className="truncate">{div.name}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDialogName(div.name);
                        setDialogState({ open: true, mode: "division", action: "edit", item: div });
                      }}
                      className="p-1 hover:opacity-80 rounded"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete division ${div.name}?`)) deleteDivMutation.mutate(div.id);
                      }}
                      className="p-1 hover:opacity-80 rounded text-rose-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Districts */}
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col h-[380px] md:h-[520px]">
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-stone-900 text-xs">
                2. Districts ({currentDistricts.length})
              </h4>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={!selectedDivId}
              onClick={() => {
                setDialogName("");
                setDialogState({ open: true, mode: "district", action: "create" });
              }}
              className="h-7 text-xs rounded-lg"
            >
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {!selectedDivId ? (
              <div className="p-6 text-center text-xs text-stone-400">Select a division first</div>
            ) : distLoading ? (
              <div className="p-4 space-y-2">
                <Skeleton className="h-8 w-full rounded" />
                <Skeleton className="h-8 w-full rounded" />
              </div>
            ) : currentDistricts.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-400">No districts in this division</div>
            ) : (
              currentDistricts.map((dist) => (
                <div
                  key={dist.id}
                  onClick={() => setSelectedDistId(dist.id)}
                  className={`p-2.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-all ${
                    selectedDistId === dist.id
                      ? "bg-teal-800 text-white font-semibold shadow-sm"
                      : "hover:bg-stone-100 text-stone-700"
                  }`}
                >
                  <span className="truncate">{dist.name}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDialogName(dist.name);
                        setDialogState({ open: true, mode: "district", action: "edit", item: dist });
                      }}
                      className="p-1 hover:opacity-80 rounded"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete district ${dist.name}?`)) deleteDistMutation.mutate(dist.id);
                      }}
                      className="p-1 hover:opacity-80 rounded text-rose-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Upazilas */}
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col h-[380px] md:h-[520px]">
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-stone-900 text-xs">
                3. Upazilas ({currentUpazilas.length})
              </h4>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={!selectedDistId}
              onClick={() => {
                setDialogName("");
                setDialogState({ open: true, mode: "upazila", action: "create" });
              }}
              className="h-7 text-xs rounded-lg"
            >
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {!selectedDistId ? (
              <div className="p-6 text-center text-xs text-stone-400">Select a district first</div>
            ) : upaLoading ? (
              <div className="p-4 space-y-2">
                <Skeleton className="h-8 w-full rounded" />
                <Skeleton className="h-8 w-full rounded" />
              </div>
            ) : currentUpazilas.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-400">No upazilas in this district</div>
            ) : (
              currentUpazilas.map((upa) => (
                <div
                  key={upa.id}
                  className="p-2.5 rounded-xl text-xs flex items-center justify-between bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200/60"
                >
                  <span className="truncate">{upa.name}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setDialogName(upa.name);
                        setDialogState({ open: true, mode: "upazila", action: "edit", item: upa });
                      }}
                      className="p-1 hover:text-teal-900 rounded"
                    >
                      <Edit3 className="h-3 w-3 text-stone-500" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete upazila ${upa.name}?`)) deleteUpaMutation.mutate(upa.id);
                      }}
                      className="p-1 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="h-3 w-3 text-rose-500" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CRUD Dialog */}
      <Dialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="sm:max-w-md rounded-2xl border-stone-200">
          <DialogHeader>
            <DialogTitle className="text-stone-900 flex items-center gap-2 capitalize">
              <MapPin className="h-5 w-5 text-teal-800" />
              {dialogState.action} {dialogState.mode}
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-500">
              Enter name for this {dialogState.mode}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitDialog} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-stone-800">
                Name <span className="text-orange-600">*</span>
              </Label>
              <Input
                placeholder={`e.g. ${dialogState.mode === "division" ? "Dhaka" : dialogState.mode === "district" ? "Gazipur" : "Uttara"}`}
                value={dialogName}
                onChange={(e) => setDialogName(e.target.value)}
                required
                className="rounded-xl border-stone-200 text-sm"
              />
            </div>

            <DialogFooter className="pt-2 flex gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDialogState((prev) => ({ ...prev, open: false }))}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSaving}
                className="bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold text-xs rounded-xl shadow-tactile"
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
