"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wrench,
  Menu,
  User,
  LogOut,
  LayoutDashboard,
  Calendar,
  Layers,
  Shield,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  ExternalLink,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useAuthStore } from "@/store/useAuthStore";
import { normalizeImageUrl } from "@/features/profiles/services/profiles.service";
import { ChangePasswordModal } from "@/components/auth/ChangePasswordModal";

export function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  const { user, profile, isAuthenticated, logout } = useAuthStore();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const role = user?.role || profile?.role;
  const resolvedEmail = user?.email || profile?.email || "";
  const resolvedFirstName = user?.first_name || profile?.first_name || "";
  const resolvedLastName = user?.last_name || profile?.last_name || "";
  const resolvedAvatar = profile?.image || user?.image || null;

  const displayName = React.useMemo(() => {
    const fullName = `${resolvedFirstName} ${resolvedLastName}`.trim();
    if (fullName) return fullName;
    if (resolvedEmail) return resolvedEmail.split("@")[0];
    return "Account";
  }, [resolvedFirstName, resolvedLastName, resolvedEmail]);

  const initials = React.useMemo(() => {
    const first = resolvedFirstName?.[0] || "";
    const last = resolvedLastName?.[0] || "";
    if (first || last) return `${first}${last}`.toUpperCase();
    if (resolvedEmail) return resolvedEmail[0].toUpperCase();
    return "A";
  }, [resolvedFirstName, resolvedLastName, resolvedEmail]);

  const getDashboardHref = () => {
    if (!role) return "/dashboard/customer";
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

  const navLinks = [
    { title: "Home", href: "/" },
    { title: "Services", href: "/services" },
    { title: "Categories", href: "/services" },
  ];

  return (
    <div className="sticky top-0 z-50 w-full shrink-0 flex flex-col">
      {/* Top Thin Trust Strip */}
      <div className="w-full bg-[#042F2E] text-stone-200 text-[11px] sm:text-xs py-1 px-4 font-medium flex items-center justify-center tracking-wide border-b border-teal-950">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
          <span className="flex items-center gap-1.5 text-stone-200">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            Verified Local Professionals
          </span>
          <span className="hidden sm:inline text-teal-600">•</span>
          <span>Secure 20% Advance via SSLCommerz</span>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header className="w-full border-b border-stone-200 bg-white/95 dark:bg-stone-950/95 backdrop-blur-md transition-all duration-200">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Brand Logo + Name */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-bold text-lg tracking-tight group transition-transform active:scale-98"
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#115E59] text-white shadow-[0_2px_12px_-2px_rgba(17,94,89,0.35)] group-hover:bg-[#042F2E] transition-all duration-200">
                <Wrench className="h-5 w-5 transition-transform group-hover:rotate-12 duration-200 text-teal-100" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#EA580C]"></span>
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-stone-900 dark:text-stone-100 font-heading">
                  Local <span className="text-[#115E59] dark:text-teal-400">Service Finder</span>
                </span>
              </div>
            </Link>

            {/* Desktop Center Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              {navLinks.map((item) => {
                const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className={`px-3.5 py-1.5 rounded-full transition-all duration-150 ${
                      isActive
                        ? "bg-teal-50 dark:bg-teal-950/60 text-[#115E59] dark:text-teal-300 font-semibold"
                        : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900"
                    }`}
                  >
                    {item.title}
                  </Link>
                );
              })}

              {/* Show Dashboard tab if authenticated */}
              {mounted && isAuthenticated && (
                <Link
                  href={getDashboardHref()}
                  className={`px-3.5 py-1.5 rounded-full transition-all duration-150 ${
                    pathname.startsWith("/dashboard")
                      ? "bg-teal-50 dark:bg-teal-950/60 text-[#115E59] dark:text-teal-300 font-semibold"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900"
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </nav>
          </div>

          {/* Right Auth Section */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {mounted && isAuthenticated && (user || profile) ? (
              <div className="flex items-center gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="hidden sm:inline-flex rounded-xl border-stone-300 hover:border-[#115E59] dark:border-stone-800 text-stone-700 dark:text-stone-300 font-medium"
                >
                  <Link href={getDashboardHref()} className="flex items-center gap-1.5">
                    <LayoutDashboard className="h-4 w-4 text-[#115E59]" />
                    <span>Dashboard</span>
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full ring-2 ring-stone-300 dark:ring-stone-700 hover:ring-[#115E59]/60 p-0 transition-all cursor-pointer"
                    >
                      <Avatar className="h-10 w-10 rounded-full">
                        <AvatarImage
                          src={normalizeImageUrl(resolvedAvatar) || ""}
                          alt={displayName}
                        />
                        <AvatarFallback className="bg-teal-100 text-[#115E59] font-bold text-sm">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 rounded-xl shadow-xl border-stone-200 p-1.5" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal py-2.5 px-3">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold leading-none truncate text-stone-900">{displayName}</p>
                          {role && (
                            <Badge
                              variant="outline"
                              className="text-[10px] uppercase font-bold py-0.5 px-2 bg-teal-50 text-[#115E59] border-teal-200 shrink-0"
                            >
                              {role === "SERVICE_PROVIDER" ? "Provider" : role}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {resolvedEmail}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                      <Link href={getDashboardHref()} className="cursor-pointer flex items-center py-2 font-medium">
                        <LayoutDashboard className="mr-2.5 h-4 w-4 text-[#115E59]" />
                        <span>My Dashboard</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer flex items-center py-2 font-medium">
                        <User className="mr-2.5 h-4 w-4 text-stone-500" />
                        <span>Profile Settings</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/customer/bookings" className="cursor-pointer flex items-center py-2">
                        <Calendar className="mr-2.5 h-4 w-4 text-stone-500" />
                        <span>My Bookings</span>
                      </Link>
                    </DropdownMenuItem>

                    {role === "SERVICE_PROVIDER" && (
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/provider/services"
                          className="cursor-pointer flex items-center py-2"
                        >
                          <Layers className="mr-2.5 h-4 w-4 text-stone-500" />
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
                          <Shield className="mr-2.5 h-4 w-4 text-[#115E59]" />
                          <span>Provider Approvals</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />
                    <ChangePasswordModal>
                      <button className="w-full text-left px-2 py-2 text-xs text-stone-700 hover:bg-stone-100 rounded-md flex items-center cursor-pointer transition-colors">
                        <KeyRound className="mr-2.5 h-4 w-4 text-stone-500" />
                        <span>Change Password</span>
                      </button>
                    </ChangePasswordModal>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50 py-2 font-medium"
                    >
                      <LogOut className="mr-2.5 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="rounded-xl text-stone-700 hover:text-stone-900 font-medium px-4">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-medium shadow-xs px-4.5 transition-all"
                >
                  <Link href="/register" className="flex items-center gap-1.5">
                    <span>Sign up</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile Sheet Menu Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-10 w-10 rounded-xl"
                  aria-label="Open mobile navigation"
                >
                  <Menu className="h-5 w-5 text-stone-700 dark:text-stone-300" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] p-6 flex flex-col justify-between">
                <div className="space-y-6">
                  <SheetHeader className="text-left pb-4 border-b border-stone-200">
                    <SheetTitle className="flex items-center gap-2 text-base font-bold text-stone-900">
                      <div className="h-8 w-8 rounded-lg bg-[#115E59] text-white flex items-center justify-center">
                        <Wrench className="h-4 w-4" />
                      </div>
                      <span>Local Service Finder</span>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="flex flex-col space-y-1.5">
                    <SheetClose asChild>
                      <Link
                        href="/"
                        className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                          pathname === "/" ? "bg-teal-50 text-[#115E59]" : "text-stone-700 hover:bg-stone-100"
                        }`}
                      >
                        Home
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/services"
                        className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                          pathname.startsWith("/services") ? "bg-teal-50 text-[#115E59]" : "text-stone-700 hover:bg-stone-100"
                        }`}
                      >
                        Browse Services
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/register?role=SERVICE_PROVIDER"
                        className="px-3 py-2.5 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
                      >
                        Become a Service Provider
                      </Link>
                    </SheetClose>

                    {mounted && isAuthenticated && (
                      <>
                        <div className="pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-stone-400 px-3">
                          Account
                        </div>
                        <SheetClose asChild>
                          <Link
                            href={getDashboardHref()}
                            className="px-3 py-2.5 rounded-xl text-sm font-semibold bg-teal-50 text-[#115E59] flex items-center justify-between"
                          >
                            <span>Dashboard</span>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link
                            href="/profile"
                            className="px-3 py-2.5 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-100"
                          >
                            Profile Settings
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link
                            href="/dashboard/customer/bookings"
                            className="px-3 py-2.5 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-100"
                          >
                            My Bookings
                          </Link>
                        </SheetClose>
                      </>
                    )}
                  </div>
                </div>

                {/* Bottom Auth in Sheet */}
                <div className="pt-6 border-t border-stone-200">
                  {mounted && isAuthenticated ? (
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="w-full rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      <SheetClose asChild>
                        <Button variant="outline" asChild className="w-full rounded-xl">
                          <Link href="/login">Log in</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button asChild className="w-full rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white">
                          <Link href="/register">Sign up</Link>
                        </Button>
                      </SheetClose>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Navbar;
