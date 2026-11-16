"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Navigation, Compass, ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { locationsService } from "@/features/locations/services/locations.service";
import type { Division, District, Upazila } from "@/types/api";

export default function LocationsPage() {
  const { data: divisionsData, isLoading: divisionsLoading } = useQuery({
    queryKey: ["locations", "divisions"],
    queryFn: () => locationsService.getDivisions(),
  });

  const { data: districtsData, isLoading: districtsLoading } = useQuery({
    queryKey: ["locations", "districts"],
    queryFn: () => locationsService.getDistricts(),
  });

  const { data: upazilasData, isLoading: upazilasLoading } = useQuery({
    queryKey: ["locations", "upazilas"],
    queryFn: () => locationsService.getUpazilas(),
  });

  const divisions: Division[] = divisionsData || [];
  const districts: District[] = districtsData || [];
  const upazilas: Upazila[] = upazilasData || [];

  const isLoading = divisionsLoading || districtsLoading || upazilasLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container max-w-6xl mx-auto py-10 px-4 sm:px-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Service Coverage Locations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse covered divisions, districts, and upazilas across Bangladesh
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Divisions */}
            <Card className="border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Compass className="h-5 w-5 text-primary" />
                  Divisions ({divisions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {divisions.map((div) => (
                    <div
                      key={div.id}
                      className="p-3 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-between"
                    >
                      <span className="font-semibold text-sm">{div.name}</span>
                      <span className="text-xs text-muted-foreground">Division #{div.id}</span>
                    </div>
                  ))}
                  {divisions.length === 0 && (
                    <p className="text-xs text-muted-foreground py-4 text-center">
                      No divisions recorded yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Districts */}
            <Card className="border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-primary" />
                  Districts ({districts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {districts.map((dis) => (
                    <div
                      key={dis.id}
                      className="p-3 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-between"
                    >
                      <span className="font-semibold text-sm">{dis.name}</span>
                      <span className="text-xs text-muted-foreground">District #{dis.id}</span>
                    </div>
                  ))}
                  {districts.length === 0 && (
                    <p className="text-xs text-muted-foreground py-4 text-center">
                      No districts recorded yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upazilas / Thanas */}
            <Card className="border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Upazilas / Thanas ({upazilas.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {upazilas.map((upa) => (
                    <Link
                      key={upa.id}
                      href={`/services?area=${encodeURIComponent(upa.name)}`}
                      className="p-3 rounded-lg border border-border/60 bg-muted/20 hover:bg-accent hover:border-primary/50 transition-colors flex items-center justify-between group"
                    >
                      <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {upa.name}
                      </span>
                      <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        Find services <ArrowRight className="h-3 w-3" />
                      </span>
                    </Link>
                  ))}
                  {upazilas.length === 0 && (
                    <p className="text-xs text-muted-foreground py-4 text-center">
                      No upazilas recorded yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

