"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  MapPin,
  Building,
  Navigation,
  Plus,
  Edit3,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Search,
  Check,
  ChevronRight,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { locationsService } from "@/features/locations/services/locations.service";
import type { Division, District, Upazila } from "@/types/api";

export default function AdminLocationsPage() {
  const queryClient = useQueryClient();

  // Queries
  const {
    data: divisions = [],
    isLoading: divLoading,
    refetch: refetchDiv,
    isRefetching: isDivRefetching,
  } = useQuery({
    queryKey: ["locations", "divisions"],
    queryFn: () => locationsService.getDivisions(),
  });

  const {
    data: districts = [],
    isLoading: distLoading,
    refetch: refetchDist,
    isRefetching: isDistRefetching,
  } = useQuery({
    queryKey: ["locations", "districts"],
    queryFn: () => locationsService.getDistricts(),
  });

  const {
    data: upazilas = [],
    isLoading: upaLoading,
    refetch: refetchUpa,
    isRefetching: isUpaRefetching,
  } = useQuery({
    queryKey: ["locations", "upazilas"],
    queryFn: () => locationsService.getUpazilas(),
  });

  // State for active selections
  const [selectedDivId, setSelectedDivId] = React.useState<number | null>(null);
  const [selectedDistId, setSelectedDistId] = React.useState<number | null>(null);

  // Search filters
  const [divSearch, setDivSearch] = React.useState("");
  const [distSearch, setDistSearch] = React.useState("");
  const [upaSearch, setUpaSearch] = React.useState("");

  // Auto-select first division if available
  React.useEffect(() => {
    if (divisions.length > 0 && selectedDivId === null) {
      setSelectedDivId(divisions[0].id);
    }
  }, [divisions, selectedDivId]);

  // Auto-select first district of chosen division
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

  // Modal State for Add / Edit
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

  // Modal State for Delete
  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean;
    mode: "division" | "district" | "upazila";
    item?: any;
  }>({
    open: false,
    mode: "division",
  });

  // Mutations
  const createDivMutation = useMutation({
    mutationFn: (name: string) => locationsService.createDivision({ name }),
    onSuccess: () => {
      toast.success("Division created successfully.");
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setDialogState((prev) => ({ ...prev, open: false }));
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create division.");
    },
  });

  const updateDivMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      locationsService.updateDivision(id, { name }),
    onSuccess: () => {
      toast.success("Division renamed successfully.");
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setDialogState((prev) => ({ ...prev, open: false }));
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update division.");
    },
  });

  const deleteDivMutation = useMutation({
    mutationFn: (id: number) => locationsService.deleteDivision(id),
    onSuccess: () => {
      toast.success("Division removed.");
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setDeleteDialog((prev) => ({ ...prev, open: false }));
      setSelectedDivId(null);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete division.");
    },
  });

  // District Mutations
  const createDistMutation = useMutation({
    mutationFn: ({ name, division }: { name: string; division: number }) =>
      locationsService.createDistrict({ name, division }),
    onSuccess: () => {
      toast.success("District created successfully.");
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setDialogState((prev) => ({ ...prev, open: false }));
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create district.");
    },
  });

  const updateDistMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      locationsService.updateDistrict(id, { name }),
    onSuccess: () => {
      toast.success("District renamed successfully.");
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setDialogState((prev) => ({ ...prev, open: false }));
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update district.");
    },
  });

  const deleteDistMutation = useMutation({
    mutationFn: (id: number) => locationsService.deleteDistrict(id),
    onSuccess: () => {
      toast.success("District removed.");
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setDeleteDialog((prev) => ({ ...prev, open: false }));
      setSelectedDistId(null);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete district.");
    },
  });

  // Upazila Mutations
  const createUpaMutation = useMutation({
    mutationFn: ({ name, district }: { name: string; district: number }) =>
      locationsService.createUpazila({ name, district }),
    onSuccess: () => {
      toast.success("Upazila created successfully.");
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setDialogState((prev) => ({ ...prev, open: false }));
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create upazila.");
    },
  });

  const updateUpaMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      locationsService.updateUpazila(id, { name }),
    onSuccess: () => {
      toast.success("Upazila renamed successfully.");
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setDialogState((prev) => ({ ...prev, open: false }));
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update upazila.");
    },
  });

  const deleteUpaMutation = useMutation({
    mutationFn: (id: number) => locationsService.deleteUpazila(id),
    onSuccess: () => {
      toast.success("Upazila removed.");
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setDeleteDialog((prev) => ({ ...prev, open: false }));
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete upazila.");
    },
  });

  const isSaving =
    createDivMutation.isPending ||
    updateDivMutation.isPending ||
    createDistMutation.isPending ||
    updateDistMutation.isPending ||
    createUpaMutation.isPending ||
    updateUpaMutation.isPending;

  const isDeleting =
    deleteDivMutation.isPending || deleteDistMutation.isPending || deleteUpaMutation.isPending;

  // Handlers
  const openAddModal = (mode: "division" | "district" | "upazila") => {
    if (mode === "district" && !selectedDivId) {
      toast.error("Please select a Division first.");
      return;
    }
    if (mode === "upazila" && !selectedDistId) {
      toast.error("Please select a District first.");
      return;
    }
    setDialogName("");
    setDialogState({ open: true, mode, action: "create" });
  };

  const openEditModal = (mode: "division" | "district" | "upazila", item: any) => {
    setDialogName(item.name || "");
    setDialogState({ open: true, mode, action: "edit", item });
  };

  const openDeleteModal = (mode: "division" | "district" | "upazila", item: any) => {
    setDeleteDialog({ open: true, mode, item });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const name = dialogName.trim();
    if (!name) return;

    if (dialogState.mode === "division") {
      if (dialogState.action === "create") createDivMutation.mutate(name);
      else updateDivMutation.mutate({ id: dialogState.item.id, name });
    } else if (dialogState.mode === "district") {
      if (dialogState.action === "create") {
        if (!selectedDivId) return;
        createDistMutation.mutate({ name, division: selectedDivId });
      } else {
        updateDistMutation.mutate({ id: dialogState.item.id, name });
      }
    } else if (dialogState.mode === "upazila") {
      if (dialogState.action === "create") {
        if (!selectedDistId) return;
        createUpaMutation.mutate({ name, district: selectedDistId });
      } else {
        updateUpaMutation.mutate({ id: dialogState.item.id, name });
      }
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteDialog.item) return;
    const id = deleteDialog.item.id;
    if (deleteDialog.mode === "division") deleteDivMutation.mutate(id);
    else if (deleteDialog.mode === "district") deleteDistMutation.mutate(id);
    else if (deleteDialog.mode === "upazila") deleteUpaMutation.mutate(id);
  };

  // Filtered views for each column
  const filteredDivisions = React.useMemo(() => {
    if (!divSearch.trim()) return divisions;
    const q = divSearch.toLowerCase();
    return divisions.filter((d) => (d.name || "").toLowerCase().includes(q));
  }, [divisions, divSearch]);

  const filteredDistricts = React.useMemo(() => {
    const list = selectedDivId ? districts.filter((d) => d.division === selectedDivId) : [];
    if (!distSearch.trim()) return list;
    const q = distSearch.toLowerCase();
    return list.filter((d) => (d.name || "").toLowerCase().includes(q));
  }, [districts, selectedDivId, distSearch]);

  const filteredUpazilas = React.useMemo(() => {
    const list = selectedDistId ? upazilas.filter((u) => u.district === selectedDistId) : [];
    if (!upaSearch.trim()) return list;
    const q = upaSearch.toLowerCase();
    return list.filter((u) => (u.name || "").toLowerCase().includes(q));
  }, [upazilas, selectedDistId, upaSearch]);

  const activeDivision = divisions.find((d) => d.id === selectedDivId);
  const activeDistrict = districts.find((d) => d.id === selectedDistId);

  const handleRefreshAll = () => {
    refetchDiv();
    refetchDist();
    refetchUpa();
  };

  const isAnyRefetching = isDivRefetching || isDistRefetching || isUpaRefetching;

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <Link href="/dashboard/admin" className="hover:text-teal-800 transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-stone-800 dark:text-stone-200 font-medium">Location Manager</span>
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
                Location Hierarchy Manager
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-teal-50 text-teal-900 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-200 dark:border-teal-800 tabular-nums">
                3-Tier Cascading
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Manage Bangladesh regional hierarchy (Divisions → Districts → Upazilas). Location IDs are integer numbers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              disabled={isAnyRefetching}
              className="h-9 px-3 text-xs border-stone-200 dark:border-stone-800 gap-1.5 rounded-xl font-medium"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isAnyRefetching ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* 3-Column Cascading Location Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* COLUMN 1: DIVISIONS */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-800 dark:text-teal-300">
                    <Building className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      1. Divisions
                    </h3>
                    <span className="text-[11px] text-stone-400 tabular-nums">
                      {divisions.length} total
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => openAddModal("division")}
                  className="h-7 px-2.5 text-xs bg-[#115E59] hover:bg-teal-800 text-white font-medium rounded-lg shadow-sm gap-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add</span>
                </Button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter divisions..."
                  value={divSearch}
                  onChange={(e) => setDivSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-1 focus:ring-[#115E59] text-stone-800 dark:text-stone-200 placeholder:text-stone-400"
                />
              </div>

              {/* List */}
              <div className="max-h-[460px] overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
                {divLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-10 w-full rounded-xl" />
                    ))}
                  </div>
                ) : filteredDivisions.length === 0 ? (
                  <div className="py-8 text-center text-xs text-stone-400 border border-dashed border-stone-200 dark:border-stone-800 rounded-xl">
                    No divisions found
                  </div>
                ) : (
                  filteredDivisions.map((div) => {
                    const isSelected = selectedDivId === div.id;
                    const childDistCount = districts.filter((d) => d.division === div.id).length;

                    return (
                      <div
                        key={div.id}
                        onClick={() => setSelectedDivId(div.id)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                          isSelected
                            ? "bg-teal-50/60 dark:bg-teal-950/40 border-teal-600/40 text-teal-900 dark:text-teal-200 shadow-sm"
                            : "bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800 text-stone-800 dark:text-stone-300 hover:border-stone-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-mono text-stone-400 tabular-nums">
                            #{div.id}
                          </span>
                          <span className="text-xs font-semibold truncate">{div.name}</span>
                          <span className="text-[10px] text-stone-400 tabular-nums">
                            ({childDistCount})
                          </span>
                        </div>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal("division", div);
                            }}
                            className="p-1 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                            title="Rename"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteModal("division", div);
                            }}
                            className="p-1 hover:text-rose-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* COLUMN 2: DISTRICTS */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-800 dark:text-teal-300">
                    <Navigation className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      2. Districts
                    </h3>
                    <span className="text-[11px] text-stone-400">
                      {activeDivision ? `In ${activeDivision.name}` : "Select a Division"}
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => openAddModal("district")}
                  disabled={!selectedDivId}
                  className="h-7 px-2.5 text-xs bg-[#115E59] hover:bg-teal-800 text-white font-medium rounded-lg shadow-sm gap-1 disabled:opacity-50"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add</span>
                </Button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter districts..."
                  value={distSearch}
                  onChange={(e) => setDistSearch(e.target.value)}
                  disabled={!selectedDivId}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-1 focus:ring-[#115E59] text-stone-800 dark:text-stone-200 placeholder:text-stone-400"
                />
              </div>

              {/* List */}
              <div className="max-h-[460px] overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
                {distLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-10 w-full rounded-xl" />
                    ))}
                  </div>
                ) : !selectedDivId ? (
                  <div className="py-12 text-center text-xs text-stone-400 border border-dashed border-stone-200 dark:border-stone-800 rounded-xl">
                    Select a division on the left
                  </div>
                ) : filteredDistricts.length === 0 ? (
                  <div className="py-8 text-center text-xs text-stone-400 border border-dashed border-stone-200 dark:border-stone-800 rounded-xl">
                    No districts in {activeDivision?.name || "this division"}
                  </div>
                ) : (
                  filteredDistricts.map((dist) => {
                    const isSelected = selectedDistId === dist.id;
                    const childUpaCount = upazilas.filter((u) => u.district === dist.id).length;

                    return (
                      <div
                        key={dist.id}
                        onClick={() => setSelectedDistId(dist.id)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                          isSelected
                            ? "bg-teal-50/60 dark:bg-teal-950/40 border-teal-600/40 text-teal-900 dark:text-teal-200 shadow-sm"
                            : "bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800 text-stone-800 dark:text-stone-300 hover:border-stone-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-mono text-stone-400 tabular-nums">
                            #{dist.id}
                          </span>
                          <span className="text-xs font-semibold truncate">{dist.name}</span>
                          <span className="text-[10px] text-stone-400 tabular-nums">
                            ({childUpaCount})
                          </span>
                        </div>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal("district", dist);
                            }}
                            className="p-1 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                            title="Rename"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteModal("district", dist);
                            }}
                            className="p-1 hover:text-rose-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* COLUMN 3: UPAZILAS */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-800 dark:text-teal-300">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      3. Upazilas
                    </h3>
                    <span className="text-[11px] text-stone-400">
                      {activeDistrict ? `In ${activeDistrict.name}` : "Select a District"}
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => openAddModal("upazila")}
                  disabled={!selectedDistId}
                  className="h-7 px-2.5 text-xs bg-[#115E59] hover:bg-teal-800 text-white font-medium rounded-lg shadow-sm gap-1 disabled:opacity-50"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add</span>
                </Button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter upazilas..."
                  value={upaSearch}
                  onChange={(e) => setUpaSearch(e.target.value)}
                  disabled={!selectedDistId}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-1 focus:ring-[#115E59] text-stone-800 dark:text-stone-200 placeholder:text-stone-400"
                />
              </div>

              {/* List */}
              <div className="max-h-[460px] overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
                {upaLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-10 w-full rounded-xl" />
                    ))}
                  </div>
                ) : !selectedDistId ? (
                  <div className="py-12 text-center text-xs text-stone-400 border border-dashed border-stone-200 dark:border-stone-800 rounded-xl">
                    Select a district in the middle column
                  </div>
                ) : filteredUpazilas.length === 0 ? (
                  <div className="py-8 text-center text-xs text-stone-400 border border-dashed border-stone-200 dark:border-stone-800 rounded-xl">
                    No upazilas registered in {activeDistrict?.name || "this district"}
                  </div>
                ) : (
                  filteredUpazilas.map((upa) => {
                    return (
                      <div
                        key={upa.id}
                        className="p-2.5 rounded-xl border bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800 text-stone-800 dark:text-stone-300 hover:border-stone-300 transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-mono text-stone-400 tabular-nums">
                            #{upa.id}
                          </span>
                          <span className="text-xs font-semibold truncate">{upa.name}</span>
                        </div>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => openEditModal("upazila", upa)}
                            className="p-1 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                            title="Rename"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteModal("upazila", upa)}
                            className="p-1 hover:text-rose-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal for Create / Rename */}
        <Dialog
          open={dialogState.open}
          onOpenChange={(open) => setDialogState((prev) => ({ ...prev, open }))}
        >
          <DialogContent className="sm:max-w-md p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl">
            <DialogHeader className="pb-3 border-b border-stone-100 dark:border-stone-800">
              <DialogTitle className="text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-teal-800 shrink-0" />
                <span>
                  {dialogState.action === "create" ? "Add New " : "Rename "}
                  {dialogState.mode === "division"
                    ? "Division"
                    : dialogState.mode === "district"
                    ? "District"
                    : "Upazila"}
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-500 dark:text-stone-400">
                {dialogState.mode === "district" && activeDivision
                  ? `Parent Division: ${activeDivision.name} (ID: ${activeDivision.id})`
                  : dialogState.mode === "upazila" && activeDistrict
                  ? `Parent District: ${activeDistrict.name} (ID: ${activeDistrict.id})`
                  : "Regional territory used for local provider clustering and client search."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="loc-name" className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                  Location Name <span className="text-orange-600">*</span>
                </Label>
                <Input
                  id="loc-name"
                  placeholder="e.g. Dhaka, Gazipur, Uttara..."
                  value={dialogName}
                  onChange={(e) => setDialogName(e.target.value)}
                  maxLength={50}
                  required
                  autoFocus
                  className="rounded-xl border-stone-200 dark:border-stone-700 text-sm focus-visible:ring-[#115E59]"
                />
              </div>

              <DialogFooter className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDialogState((prev) => ({ ...prev, open: false }))}
                  disabled={isSaving}
                  className="text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSaving || !dialogName.trim()}
                  className="bg-[#115E59] hover:bg-teal-800 text-white text-xs rounded-xl font-medium"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Location</span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal for Delete Confirmation */}
        <Dialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
        >
          <DialogContent className="sm:max-w-md p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl">
            <DialogHeader className="pb-3 border-b border-stone-100 dark:border-stone-800">
              <DialogTitle className="text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                <span>Delete this {deleteDialog.mode}?</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-500 dark:text-stone-400">
                Are you sure you want to remove{" "}
                <strong className="text-stone-800 dark:text-stone-200">
                  {deleteDialog.item?.name} (ID: #{deleteDialog.item?.id})
                </strong>
                ? Deleting this location will affect any dependent locations and provider registrations.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="pt-4 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteDialog((prev) => ({ ...prev, open: false }))}
                disabled={isDeleting}
                className="text-xs rounded-xl"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs rounded-xl font-medium"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, delete location</span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
