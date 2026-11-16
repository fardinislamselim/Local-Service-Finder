"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Layers,
  MapPin,
  Shield,
  User,
  Wrench,
  CheckCircle2,
  Clock,
  DollarSign,
  PlusCircle,
  FolderTree,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/hooks/use-auth";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = user?.role;

  const adminNav: NavItem[] = [
    { title: "Admin Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { title: "Pending Approvals", href: "/dashboard/admin/pending-providers", icon: Shield },
    { title: "Categories Manager", href: "/dashboard/admin/categories", icon: FolderTree },
    { title: "Location Manager", href: "/dashboard/admin/locations", icon: MapPin },
    { title: "My Profile", href: "/profile", icon: User },
  ];

  const providerNav: NavItem[] = [
    { title: "Provider Overview", href: "/dashboard/provider", icon: LayoutDashboard },
    { title: "Pending Requests", href: "/dashboard/provider/requests", icon: Clock },
    { title: "Active Bookings", href: "/dashboard/provider/active", icon: CheckCircle2 },
    { title: "My Services", href: "/dashboard/provider/services", icon: Layers },
    { title: "Add New Service", href: "/dashboard/provider/services/new", icon: PlusCircle },
    { title: "My Profile & Bio", href: "/profile", icon: User },
  ];

  const customerNav: NavItem[] = [
    { title: "Customer Overview", href: "/dashboard/customer", icon: LayoutDashboard },
    { title: "My Bookings", href: "/dashboard/customer/bookings", icon: Calendar },
    { title: "Browse Services", href: "/services", icon: Wrench },
    { title: "Categories", href: "/categories", icon: Layers },
    { title: "My Profile", href: "/profile", icon: User },
  ];

  const items: NavItem[] =
    role === "ADMIN" ? adminNav : role === "SERVICE_PROVIDER" ? providerNav : customerNav;

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-card/60 backdrop-blur min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between md:flex">
      <div className="space-y-6">
        {/* User Card */}
        <div className="p-3 rounded-lg bg-muted/60 border border-border/80">
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
            Logged in as
          </p>
          <div className="flex items-center justify-between mt-1">
            <span className="font-semibold text-sm truncate max-w-[130px]">
              {user?.first_name} {user?.last_name}
            </span>
            <Badge variant="outline" className="text-[10px] font-bold uppercase">
              {role}
            </Badge>
          </div>
        </div>

        {/* Navigation list */}
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-2">
            Menu
          </p>
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <Badge variant="secondary" className="text-[10px]">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="text-xs text-muted-foreground p-3 rounded-md bg-muted/40 border border-border/40">
        <p className="font-medium text-foreground">API Backend Connected</p>
        <p className="truncate text-[11px] mt-0.5">Django REST Framework</p>
      </div>
    </aside>
  );
}

