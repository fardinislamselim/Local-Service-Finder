import * as React from "react";
import Link from "next/link";
import { Wrench, Heart, ShieldCheck, CheckCircle2, Headphones } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300">
      <div className="container mx-auto px-4 py-14 sm:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <Wrench className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-slate-100 font-heading">
                Service<span className="text-indigo-600">Finder</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Bangladesh&apos;s trusted on-demand service marketplace. Book vetted electricians, plumbers, appliance technicians, and home care specialists with verified guarantees.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/60 py-1.5 px-3 rounded-lg w-fit border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="h-4 w-4" />
              <span>100% Vetted Service Professionals</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 tracking-tight">
              Explore Services
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/services" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Browse All Services
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Popular Categories
                </Link>
              </li>
              <li>
                <Link href="/locations" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Service Locations
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  How Booking Works
                </Link>
              </li>
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 tracking-tight">
              For Service Providers
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/register" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Register as Provider
                </Link>
              </li>
              <li>
                <Link href="/dashboard/provider" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Provider Dashboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Provider Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Guarantee */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 tracking-tight">
              Customer Protection
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>SSLCommerz encrypted advance payment</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Upfront pricing with no surprise charges</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Dedicated support for service guarantees</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} ServiceFinder System. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <span>Crafted with care</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
            <span>for verified local commerce</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
