"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wrench,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Calendar,
  Layers,
  Shield,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useAuthStore } from "@/store/useAuthStore";
import { normalizeImageUrl } from "@/features/profiles/services/profiles.service";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  const { user, profile, isAuthenticated, logout } = useAuthStore();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { title: "Explore Services", href: "/services" },
    { title: "Categories", href: "/categories" },
    { title: "How It Works", href: "/#how-it-works" },
  ];

  const role = user?.role || profile?.role;
  const displayName =
    user?.first_name || profile?.first_name
      ? `${user?.first_name || profile?.first_name || ""} ${user?.last_name || profile?.last_name || ""}`.trim()
      : user?.email || "Account";

  const getDashboardHref = () => {
    if (!role) return "/dashboard";
    if (role === "ADMIN") return "/dashboard/admin";
    if (role === "SERVICE_PROVIDER") return "/dashboard/provider";
    return "/dashboard/customer";
  };

  const handleLogout = () => {
    logout();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full shrink-0 border-b border-slate-200/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl transition-all duration-200">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8 max-w-7xl">
        {/* Brand Mark & Wordmark */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-lg tracking-tight group transition-transform active:scale-98"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-[0_2px_10px_-2px_rgba(79,70,229,0.35)] group-hover:shadow-[0_4px_16px_-2px_rgba(79,70,229,0.5)] transition-all duration-200">
              <Wrench className="h-5 w-5 transition-transform group-hover:rotate-12 duration-200" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-slate-100 font-heading">
                Service<span className="text-indigo-600 dark:text-indigo-400">Finder</span>
              </span>
            </div>
          </Link>

          {/* Quick Navigation Pills */}
          <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium">
            {navLinks.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/#how-it-works" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-1.5 rounded-full transition-all duration-150 ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Dynamic Role-Aware Right Section */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {mounted && isAuthenticated && (user || profile) ? (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="hidden sm:inline-flex rounded-full border-slate-200 hover:border-indigo-300 dark:border-slate-800 shadow-2xs"
              >
                <Link href={getDashboardHref()} className="flex items-center gap-1.5 font-medium">
                  <LayoutDashboard className="h-4 w-4 text-indigo-600" />
                  <span>Dashboard</span>
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full ring-2 ring-slate-200 dark:ring-slate-800 hover:ring-indigo-500/50 p-0 transition-all cursor-pointer"
                  >
                    <Avatar className="h-10 w-10 rounded-full">
                      <AvatarImage
                        src={normalizeImageUrl(profile?.image) || ""}
                        alt={displayName}
                      />
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-sm">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-60 rounded-xl shadow-xl border-slate-200/80 p-1.5" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal py-2 px-2.5">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold leading-none truncate">{displayName}</p>
                        {role && (
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase font-bold py-0.5 px-2 bg-indigo-50 text-indigo-700 border-indigo-200 shrink-0"
                          >
                            {role === "SERVICE_PROVIDER" ? "Provider" : role}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user?.email || profile?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href={getDashboardHref()} className="cursor-pointer flex items-center py-2">
                      <LayoutDashboard className="mr-2 h-4 w-4 text-indigo-600" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer flex items-center py-2">
                      <User className="mr-2 h-4 w-4 text-slate-500" />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/bookings" className="cursor-pointer flex items-center py-2">
                      <Calendar className="mr-2 h-4 w-4 text-slate-500" />
                      <span>My Bookings</span>
                    </Link>
                  </DropdownMenuItem>

                  {role === "SERVICE_PROVIDER" && (
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard/provider/services"
                        className="cursor-pointer flex items-center py-2"
                      >
                        <Layers className="mr-2 h-4 w-4 text-slate-500" />
                        <span>Manage Services</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {role === "ADMIN" && (
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard/admin/pending-providers"
                        className="cursor-pointer flex items-center py-2"
                      >
                        <Shield className="mr-2 h-4 w-4 text-indigo-600" />
                        <span>Provider Approvals</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/50 py-2"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="font-medium">Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="rounded-full text-slate-600 hover:text-slate-900 font-medium px-4">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-[0_2px_8px_-1px_rgba(79,70,229,0.3)] hover:shadow-[0_4px_12px_-1px_rgba(79,70,229,0.45)] group px-4 transition-all"
              >
                <Link href="/register" className="flex items-center gap-1.5">
                  <span>Get Started</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </div>
          )}

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith(item.href) && item.href !== "/#how-it-works"
                    ? "bg-indigo-50 text-indigo-600 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.title}
              </Link>
            ))}
            {mounted && isAuthenticated && (
              <Link
                href={getDashboardHref()}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-indigo-50 text-indigo-600 font-semibold"
              >
                Go to Dashboard
              </Link>
            )}
            {mounted && !isAuthenticated && (
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 text-center"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white text-center font-medium shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
