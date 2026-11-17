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
  PlusCircle,
  FolderTree,
  LogOut,
  ChevronsUpDown,
  Menu,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { normalizeImageUrl } from "@/features/profiles/services/profiles.service";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

export function isNavItemActive(pathname: string, href: string, allHrefs: string[]): boolean {
  if (!pathname || !href) return false;
  const cleanPath = pathname.replace(/\/+$/, "") || "/";
  const cleanHref = href.replace(/\/+$/, "") || "/";

  // Exact match is always active
  if (cleanPath === cleanHref) return true;

  // Root or role overview dashboard routes MUST be exact matches to avoid falsely matching sub-pages
  const isOverviewRoute =
    cleanHref === "/dashboard/customer" ||
    cleanHref === "/dashboard/provider" ||
    cleanHref === "/dashboard/admin" ||
    cleanHref === "/dashboard";
  if (isOverviewRoute) return false;

  // Avoid matching parent if there is a more specific sibling nav item that matches the current pathname
  // (e.g., when visiting /dashboard/provider/services/new, "My Services" [/dashboard/provider/services] should NOT be active)
  const hasMoreSpecificMatch = allHrefs.some(
    (other) =>
      other !== href &&
      other.startsWith(cleanHref + "/") &&
      (cleanPath === other || cleanPath.startsWith(other + "/"))
  );
  if (hasMoreSpecificMatch) return false;

  // Prefix match for nested sub-routes (e.g. /dashboard/provider/services/15/edit matches /dashboard/provider/services)
  return cleanPath.startsWith(cleanHref + "/");
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, signout } = useAuth();
  const role = user?.role;
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);

  // Prevent background scrolling when mobile drawer is open
  React.useEffect(() => {
    if (mobileDrawerOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setMobileDrawerOpen(false);
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [mobileDrawerOpen]);

  const adminNav: NavItem[] = [
    { title: "Admin Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { title: "Pending Approvals", href: "/dashboard/admin/pending-providers", icon: Shield },
    { title: "Categories Manager", href: "/dashboard/admin/categories", icon: FolderTree },
    { title: "Location Manager", href: "/dashboard/admin/locations", icon: MapPin },
    { title: "My Profile", href: "/profile", icon: User },
  ];

  const providerNav: NavItem[] = [
    { title: "Provider Overview", href: "/dashboard/provider", icon: LayoutDashboard },
    { title: "All Bookings", href: "/dashboard/provider/bookings", icon: Calendar },
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
  const allHrefs = items.map((i) => i.href);

  // User display metadata
  const displayName = React.useMemo(() => {
    if (!user) return "User Account";
    const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    if (fullName) return fullName;
    if (user.email) return user.email.split("@")[0];
    return "User Account";
  }, [user]);

  const initials = React.useMemo(() => {
    if (!user) return "U";
    const first = user.first_name?.[0] || "";
    const last = user.last_name?.[0] || "";
    if (first || last) return `${first}${last}`.toUpperCase();
    if (user.email) return user.email[0].toUpperCase();
    return "U";
  }, [user]);

  const roleDisplay = React.useMemo(() => {
    switch (role) {
      case "ADMIN":
        return "Administrator";
      case "SERVICE_PROVIDER":
        return "Service Provider";
      case "CUSTOMER":
        return "Customer";
      default:
        return role || "Customer";
    }
  }, [role]);

  const roleBadgeStyle = React.useMemo(() => {
    switch (role) {
      case "ADMIN":
        return "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300";
      case "SERVICE_PROVIDER":
        return "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300";
      case "CUSTOMER":
      default:
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    }
  }, [role]);

  return (
    <>
      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden w-full border-b border-border bg-card/90 backdrop-blur px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileDrawerOpen(true)}
          className="h-8 shrink-0 flex items-center gap-1.5 px-2.5 text-xs font-semibold bg-background hover:bg-muted border-primary/20 text-primary shadow-xs"
          aria-label="Open dashboard navigation menu"
        >
          <Menu className="h-3.5 w-3.5" />
          <span>Menu</span>
        </Button>

        <div className="h-4 w-px bg-border shrink-0" aria-hidden="true" />

        {items.map((item) => {
          const Icon = item.icon;
          const active = isNavItemActive(pathname, item.href, allHrefs);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="whitespace-nowrap">{item.title}</span>
              {item.badge && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-background/20 text-[10px]">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Mobile Navigation Drawer & Backdrop */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Dashboard navigation drawer"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Off-canvas panel */}
          <aside className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-card border-r border-border shadow-2xl flex flex-col justify-between p-4 overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="space-y-4">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2 font-bold text-base tracking-tight">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent font-bold">
                    Dashboard
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileDrawerOpen(false)}
                  aria-label="Close navigation drawer"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Role badge context */}
              <div className="px-1 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Navigation
                </span>
                <span
                  className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleBadgeStyle}`}
                >
                  {roleDisplay}
                </span>
              </div>

              {/* Navigation list */}
              <nav className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = isNavItemActive(pathname, item.href, allHrefs);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        active
                          ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                          : "text-muted-foreground hover:bg-accent/80 hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            active
                              ? "text-primary-foreground"
                              : "text-muted-foreground group-hover:text-foreground"
                          }`}
                        />
                        <span className="truncate">{item.title}</span>
                      </div>
                      {item.badge && (
                        <Badge
                          variant={active ? "outline" : "secondary"}
                          className={`text-[10px] shrink-0 font-semibold ${
                            active
                              ? "border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10"
                              : ""
                          }`}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Drawer User Profile Section */}
            <div className="pt-3 mt-6 border-t border-border/70 space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/40 border border-border/50">
                <Avatar className="h-10 w-10 shrink-0 ring-1 ring-border">
                  <AvatarImage
                    src={normalizeImageUrl(user?.image) || ""}
                    alt={displayName}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate text-foreground leading-tight">
                    {displayName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate leading-tight mt-0.5">
                    {user?.email || "No email available"}
                  </p>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full border ${roleBadgeStyle}`}
                    >
                      {roleDisplay}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="w-full text-xs"
                  onClick={() => setMobileDrawerOpen(false)}
                >
                  <Link href="/profile" className="flex items-center justify-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    <span>My Profile</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    signout();
                  }}
                >
                  <LogOut className="h-3.5 w-3.5 mr-1.5" />
                  <span>Sign out</span>
                </Button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 shrink-0 h-full border-r border-border bg-card/60 backdrop-blur overflow-y-auto p-4 z-20">
        <div className="space-y-4">
          {/* Navigation Section Header */}
          <div className="px-3 pb-2 border-b border-border/50 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Navigation
            </p>
            <span
              className={`inline-flex items-center text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleBadgeStyle}`}
            >
              {user?.role === "SERVICE_PROVIDER" ? "Provider" : user?.role || "Customer"}
            </span>
          </div>

          {/* Navigation Items List */}
          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const active = isNavItemActive(pathname, item.href, allHrefs);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                      : "text-muted-foreground hover:bg-accent/80 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        active
                          ? "text-primary-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    />
                    <span className="truncate">{item.title}</span>
                  </div>
                  {item.badge && (
                    <Badge
                      variant={active ? "outline" : "secondary"}
                      className={`text-[10px] shrink-0 font-semibold ${
                        active
                          ? "border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10"
                          : ""
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Section at Bottom */}
        <div className="pt-3 mt-auto border-t border-border/70">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-accent/80 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-transparent hover:border-border/60 group"
                aria-label="User account menu"
              >
                <Avatar className="h-9 w-9 shrink-0 ring-1 ring-border group-hover:ring-primary/40 transition-all">
                  <AvatarImage
                    src={normalizeImageUrl(user?.image) || ""}
                    alt={displayName}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <span className="flex-1 min-w-0 block text-left">
                  <span className="font-semibold text-sm truncate text-foreground leading-tight block">
                    {displayName}
                  </span>
                  <span className="text-xs text-muted-foreground truncate leading-tight mt-0.5 block">
                    {user?.email || "No email available"}
                  </span>
                  <span className="mt-1 flex items-center">
                    <span
                      className={`inline-flex items-center text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${roleBadgeStyle}`}
                    >
                      {roleDisplay}
                    </span>
                  </span>
                </span>

                <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors ml-0.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="start"
              sideOffset={8}
              className="w-60 p-1.5 shadow-xl border border-border/80 bg-popover"
            >
              <DropdownMenuLabel className="font-normal px-2 py-2">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Signed in as
                </p>
                <p className="text-sm font-semibold text-foreground truncate mt-0.5">
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/profile"
                  className="cursor-pointer flex items-center px-2 py-1.5 text-sm"
                >
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>My Profile & Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signout()}
                className="cursor-pointer flex items-center px-2 py-1.5 text-sm text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  );
}
