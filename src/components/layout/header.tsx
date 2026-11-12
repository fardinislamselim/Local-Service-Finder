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
  MapPin,
  Shield,
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
import { ChangePasswordDialog } from "@/features/auth/components/change-password-dialog";
import { useAuth } from "@/features/auth/hooks/use-auth";

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, signout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { title: "Services", href: "/services" },
    { title: "Categories", href: "/categories" },
    { title: "Locations", href: "/locations" },
  ];

  const getDashboardHref = () => {
    if (!user) return "/dashboard";
    if (user.role === "ADMIN") return "/dashboard/admin";
    if (user.role === "SERVICE_PROVIDER") return "/dashboard/provider";
    return "/dashboard/customer";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Wrench className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline-block bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Local Service Finder
            </span>
            <span className="sm:hidden font-bold">LSF</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors hover:text-foreground ${
                  pathname.startsWith(item.href)
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-1 ring-border">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.image || ""} alt={user.first_name || "User"} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                      {user.first_name ? user.first_name.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold leading-none truncate">
                        {user.first_name || ""} {user.last_name || ""}
                      </p>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold py-0">
                        {user.role}
                      </Badge>
                    </div>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={getDashboardHref()} className="cursor-pointer flex items-center">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/bookings" className="cursor-pointer flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Bookings</span>
                  </Link>
                </DropdownMenuItem>

                {user.role === "SERVICE_PROVIDER" && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/provider/my-services" className="cursor-pointer flex items-center">
                      <Layers className="mr-2 h-4 w-4" />
                      <span>My Services</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                {user.role === "ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/admin/pending-providers" className="cursor-pointer flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Provider Approvals</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
                <div className="p-1">
                  <ChangePasswordDialog>
                    <button className="w-full text-left px-2 py-1.5 text-sm text-foreground hover:bg-accent rounded-sm flex items-center">
                      Change Password
                    </button>
                  </ChangePasswordDialog>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signout()}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith(item.href)
                    ? "bg-accent text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {item.title}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                href={getDashboardHref()}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-medium bg-primary/10 text-primary"
              >
                Go to Dashboard
              </Link>
            )}
            {!isAuthenticated && (
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground text-center"
              >
                Create Account
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

