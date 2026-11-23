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
  Search,
  ArrowRight,
  ShieldCheck,
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
    { title: "Become a Pro", href: "/register?role=SERVICE_PROVIDER" },
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
    <div className="sticky top-0 z-40 w-full shrink-0 flex flex-col">
      {/* Top Thin Trust Strip */}
      <div className="w-full bg-teal-900 text-teal-100 text-[11px] sm:text-xs py-1.5 px-4 font-medium flex items-center justify-center tracking-wide border-b border-teal-800/80">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            Verified Local Professionals
          </span>
          <span className="hidden sm:inline text-teal-400">•</span>
          <span>20% Secure Advance Booking</span>
          <span className="hidden sm:inline text-teal-400">•</span>
          <span className="text-teal-200">SSLCommerz Protected</span>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header className="w-full border-b border-stone-200/90 bg-[#FAF9F6]/90 dark:bg-stone-950/90 backdrop-blur-xl transition-all duration-200">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8 max-w-7xl">
          {/* Geometric Emblem + Brand Wordmark */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-bold text-lg tracking-tight group transition-transform active:scale-98"
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-teal-800 text-stone-50 shadow-[0_2px_12px_-2px_rgba(17,94,89,0.35)] group-hover:bg-teal-900 transition-all duration-200">
                <Wrench className="h-5 w-5 transition-transform group-hover:rotate-12 duration-200 text-teal-100" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-stone-900 dark:text-stone-100 font-heading">
                  Pro<span className="text-teal-800 dark:text-teal-400">Lagbe</span>
                </span>
              </div>
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              {navLinks.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/register?role=SERVICE_PROVIDER" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3.5 py-1.5 rounded-full transition-all duration-150 ${
                      isActive
                        ? "bg-teal-100/80 dark:bg-teal-950/80 text-teal-900 dark:text-teal-300 font-semibold"
                        : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800/60"
                    }`}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Dynamic Zustand Auth Controls */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {mounted && isAuthenticated && (user || profile) ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="hidden sm:inline-flex rounded-full border-stone-300 hover:border-teal-700 dark:border-stone-800 text-stone-700 dark:text-stone-300 shadow-2xs font-medium"
                >
                  <Link href={getDashboardHref()} className="flex items-center gap-1.5">
                    <LayoutDashboard className="h-4 w-4 text-teal-700" />
                    <span>Dashboard</span>
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full ring-2 ring-stone-300 dark:ring-stone-700 hover:ring-teal-700/60 p-0 transition-all cursor-pointer"
                    >
                      <Avatar className="h-10 w-10 rounded-full">
                        <AvatarImage
                          src={normalizeImageUrl(profile?.image) || ""}
                          alt={displayName}
                        />
                        <AvatarFallback className="bg-teal-100 text-teal-900 font-bold text-sm">
                          {displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-60 rounded-xl shadow-xl border-stone-200 p-1.5" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal py-2 px-2.5">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold leading-none truncate text-stone-900">{displayName}</p>
                          {role && (
                            <Badge
                              variant="outline"
                              className="text-[10px] uppercase font-bold py-0.5 px-2 bg-teal-50 text-teal-800 border-teal-200 shrink-0"
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
                      <Link href={getDashboardHref()} className="cursor-pointer flex items-center py-2 font-medium">
                        <LayoutDashboard className="mr-2 h-4 w-4 text-teal-700" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer flex items-center py-2">
                        <User className="mr-2 h-4 w-4 text-stone-500" />
                        <span>My Profile</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/bookings" className="cursor-pointer flex items-center py-2">
                        <Calendar className="mr-2 h-4 w-4 text-stone-500" />
                        <span>My Bookings</span>
                      </Link>
                    </DropdownMenuItem>

                    {role === "SERVICE_PROVIDER" && (
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/provider/services"
                          className="cursor-pointer flex items-center py-2"
                        >
                          <Layers className="mr-2 h-4 w-4 text-stone-500" />
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
                          <Shield className="mr-2 h-4 w-4 text-teal-700" />
                          <span>Provider Approvals</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50 py-2 font-medium"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Button variant="ghost" size="sm" asChild className="rounded-full text-stone-700 hover:text-stone-900 font-medium px-4">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="rounded-full bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-[0_2px_10px_-1px_rgba(234,88,12,0.35)] hover:shadow-[0_4px_14px_-1px_rgba(234,88,12,0.45)] group px-4.5 transition-all"
                >
                  <Link href="/register" className="flex items-center gap-1.5">
                    <span>Post a Request</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Trigger */}
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

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-stone-200 dark:border-stone-800 bg-[#FAF9F6] dark:bg-stone-950 px-4 py-4 space-y-3">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname.startsWith(item.href) && item.href !== "/register?role=SERVICE_PROVIDER"
                      ? "bg-teal-100 text-teal-900 font-semibold"
                      : "text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  {item.title}
                </Link>
              ))}
              {mounted && isAuthenticated && (
                <Link
                  href={getDashboardHref()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium bg-teal-100 text-teal-900 font-semibold"
                >
                  Go to Dashboard
                </Link>
              )}
              {mounted && !isAuthenticated && (
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-medium border border-stone-300 text-center"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-orange-600 text-white text-center font-medium shadow-sm"
                  >
                    Post a Request / Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
    </div>
  );
}

export default Navbar;
