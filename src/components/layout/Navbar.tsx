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
import { authService } from "@/features/auth/services/auth.service";
import { tokenStorage } from "@/lib/api/token";
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
  const resolvedEmail =
    user?.email ||
    profile?.email ||
    (typeof window !== "undefined" ? localStorage.getItem("user_email") || "" : "");
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
    if (role === "ADMIN") return "/dashboard/admin";
    if (role === "SERVICE_PROVIDER") return "/dashboard/provider";
    if (role === "CUSTOMER") return "/dashboard/customer";
    // Role not resolved yet: /dashboard routes to the correct workspace.
    return "/dashboard";
  };

  const handleLogout = async () => {
    try {
      await authService.signout();
    } catch {
      useAuthStore.getState().logout();
      await tokenStorage.clearTokens();
    }
    if (typeof window !== "undefined") {
      window.location.replace("/login");
    }
  };

  const navLinks = [
    { title: "Home", href: "/" },
    { title: "Services", href: "/services" },
    { title: "Categories", href: "/categories" },
  ];

  return (
    <div className="sticky top-0 z-50 w-full shrink-0 flex flex-col">
      {/* Top Quiet Trust Strip */}
      <div className="w-full bg-[#042F2E] text-stone-300 text-xs py-1.5 px-4 font-normal flex items-center justify-center tracking-normal border-b border-[#0f4441]">
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <span className="flex items-center gap-1.5 text-stone-200">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            Verified local professionals in Bangladesh
          </span>
          <span className="hidden sm:inline text-stone-500">•</span>
          <span className="text-stone-300">20% advance held until job acceptance</span>
        </div>
      </div>

      {/* Main Sticky Navbar with Quiet Chrome */}
      <header className="w-full border-b border-stone-200 bg-white/95 dark:bg-stone-950/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
          {/* Brand Logo + Name */}
          <div className="flex min-w-0 items-center gap-8">
            <Link
              href="/"
              className="flex min-w-0 items-center gap-2.5 font-medium tracking-tight text-stone-900 group"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#115E59] text-white transition-colors group-hover:bg-[#0f4f4b]">
                <Wrench className="h-4 w-4 text-teal-100" />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold tracking-tight text-stone-900 dark:text-stone-100 font-heading sm:text-base">
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
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      isActive
                        ? "bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium"
                        : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-900"
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
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    pathname.startsWith("/dashboard")
                      ? "bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-900"
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </nav>
          </div>

          {/* Right Auth Section */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <ThemeToggle />

            {mounted && isAuthenticated && (user || profile) ? (
              <div className="flex items-center gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="hidden sm:inline-flex rounded-lg border-stone-200 text-stone-700 hover:bg-stone-50 dark:border-stone-800 dark:text-stone-300 font-medium h-9 text-xs"
                >
                  <Link href={getDashboardHref()} className="flex items-center gap-1.5">
                    <LayoutDashboard className="h-3.5 w-3.5 text-[#115E59]" />
                    <span>Dashboard</span>
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full ring-1 ring-stone-200 hover:ring-stone-300 dark:ring-stone-800 p-0 transition-all cursor-pointer"
                    >
                      <Avatar className="h-9 w-9 rounded-full">
                        <AvatarImage
                          src={normalizeImageUrl(resolvedAvatar) || ""}
                          alt={displayName}
                        />
                        <AvatarFallback className="bg-stone-100 text-[#115E59] font-medium text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-60 rounded-xl shadow-lg border-stone-200 p-1.5" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal py-2 px-2.5">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold leading-none truncate text-stone-900">{displayName}</p>
                          {role && (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-medium py-0.5 px-1.5 bg-stone-100 text-stone-700 border-stone-200 shrink-0"
                            >
                              {role === "SERVICE_PROVIDER" ? "Provider" : role.toLowerCase()}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] leading-none text-stone-500 truncate">
                          {resolvedEmail}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                      <Link href={getDashboardHref()} className="cursor-pointer flex items-center py-2 text-xs font-medium">
                        <LayoutDashboard className="mr-2 h-3.5 w-3.5 text-[#115E59]" />
                        <span>My dashboard</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer flex items-center py-2 text-xs">
                        <User className="mr-2 h-3.5 w-3.5 text-stone-500" />
                        <span>Profile settings</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/customer/bookings" className="cursor-pointer flex items-center py-2 text-xs">
                        <Calendar className="mr-2 h-3.5 w-3.5 text-stone-500" />
                        <span>Bookings</span>
                      </Link>
                    </DropdownMenuItem>

                    {role === "SERVICE_PROVIDER" && (
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/provider/services"
                          className="cursor-pointer flex items-center py-2 text-xs"
                        >
                          <Layers className="mr-2 h-3.5 w-3.5 text-stone-500" />
                          <span>Manage services</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {role === "ADMIN" && (
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/admin/pending-providers"
                          className="cursor-pointer flex items-center py-2 text-xs"
                        >
                          <Shield className="mr-2 h-3.5 w-3.5 text-[#115E59]" />
                          <span>Provider approvals</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />
                    <ChangePasswordModal>
                      <button className="w-full text-left px-2 py-1.5 text-xs text-stone-700 hover:bg-stone-100 rounded-md flex items-center cursor-pointer transition-colors">
                        <KeyRound className="mr-2 h-3.5 w-3.5 text-stone-500" />
                        <span>Change password</span>
                      </button>
                    </ChangePasswordModal>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50 py-2 text-xs font-medium"
                    >
                      <LogOut className="mr-2 h-3.5 w-3.5" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex rounded-lg text-stone-700 hover:text-stone-900 font-medium px-3 h-9 text-xs">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="rounded-lg bg-[#EA580C] hover:bg-[#c2410c] text-white font-medium h-9 text-xs px-3 sm:px-3.5 transition-colors"
                >
                  <Link href="/register" className="flex items-center gap-1.5">
                    <span>Register</span>
                    <ArrowRight className="hidden h-3.5 w-3.5 sm:block" />
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
                  className="md:hidden h-9 w-9 rounded-lg"
                  aria-label="Open navigation"
                >
                  <Menu className="h-4 w-4 text-stone-700 dark:text-stone-300" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[340px] p-6 flex flex-col justify-between">
                <div className="space-y-6">
                  <SheetHeader className="text-left pb-4 border-b border-stone-200">
                    <SheetTitle className="flex items-center gap-2 text-sm font-semibold text-stone-900">
                      <div className="h-7 w-7 rounded-lg bg-[#115E59] text-white flex items-center justify-center">
                        <Wrench className="h-3.5 w-3.5" />
                      </div>
                      <span>Local Service Finder</span>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="flex flex-col space-y-1">
                    <SheetClose asChild>
                      <Link
                        href="/"
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          pathname === "/" ? "bg-stone-100 text-stone-900" : "text-stone-600 hover:bg-stone-50"
                        }`}
                      >
                        Home
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/services"
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          pathname.startsWith("/services") ? "bg-stone-100 text-stone-900" : "text-stone-600 hover:bg-stone-50"
                        }`}
                      >
                        Browse services
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/categories"
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          pathname.startsWith("/categories") ? "bg-stone-100 text-stone-900" : "text-stone-600 hover:bg-stone-50"
                        }`}
                      >
                        Categories
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/register?role=SERVICE_PROVIDER"
                        className="px-3 py-2 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                      >
                        Become a service provider
                      </Link>
                    </SheetClose>

                    {mounted && isAuthenticated && (
                      <>
                        <div className="pt-3 pb-1 text-[10px] font-semibold text-stone-400 px-3">
                          Account
                        </div>
                        <SheetClose asChild>
                          <Link
                            href={getDashboardHref()}
                            className="px-3 py-2 rounded-lg text-xs font-medium bg-stone-100 text-stone-900 flex items-center justify-between"
                          >
                            <span>Dashboard</span>
                            <ArrowRight className="h-3.5 w-3.5 text-stone-400" />
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link
                            href="/profile"
                            className="px-3 py-2 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-50"
                          >
                            Profile settings
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link
                            href="/dashboard/customer/bookings"
                            className="px-3 py-2 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-50"
                          >
                            My bookings
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
                      className="w-full rounded-lg text-rose-600 border-stone-200 hover:bg-rose-50 text-xs h-9"
                    >
                      <LogOut className="mr-2 h-3.5 w-3.5" />
                      <span>Log out</span>
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <SheetClose asChild>
                        <Button variant="outline" asChild className="w-full rounded-lg text-xs h-9">
                          <Link href="/login">Sign in</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button asChild className="w-full rounded-lg bg-[#EA580C] hover:bg-[#c2410c] text-white text-xs h-9">
                          <Link href="/register">Create account</Link>
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
