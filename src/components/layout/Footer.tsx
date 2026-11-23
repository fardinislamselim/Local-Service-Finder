import * as React from "react";
import Link from "next/link";
import { Wrench, Heart, ShieldCheck, CheckCircle2, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-teal-950 text-stone-300 border-t border-teal-900">
      <div className="container mx-auto px-4 py-14 sm:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-800 text-stone-50 shadow-sm">
                <Wrench className="h-4 w-4 text-teal-200" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white font-heading">
                Pro<span className="text-teal-400">Lagbe</span>
              </span>
            </Link>
            <p className="text-sm text-stone-400 leading-relaxed">
              Bangladesh&apos;s leading local service marketplace. Connect with background-checked electricians, plumbers, appliance technicians, and home care specialists.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-teal-900/80 py-1.5 px-3 rounded-lg w-fit border border-teal-800">
              <ShieldCheck className="h-4 w-4" />
              <span>100% Background-Checked Pros</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 tracking-tight">
              Popular Services
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <Link href="/services?search=ac" className="hover:text-teal-300 transition-colors">
                  AC Servicing & Repair
                </Link>
              </li>
              <li>
                <Link href="/services?search=plumbing" className="hover:text-teal-300 transition-colors">
                  Plumbing Solutions
                </Link>
              </li>
              <li>
                <Link href="/services?search=electrical" className="hover:text-teal-300 transition-colors">
                  Electrical Wiring & Repair
                </Link>
              </li>
              <li>
                <Link href="/services?search=cleaning" className="hover:text-teal-300 transition-colors">
                  Home Deep Cleaning
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-teal-300 transition-colors font-medium text-teal-400">
                  View All Categories →
                </Link>
              </li>
            </ul>
          </div>

          {/* Location Hubs */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 tracking-tight">
              Service Locations
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-teal-400" />
                <Link href="/services?area=Dhaka" className="hover:text-teal-300 transition-colors">
                  Dhaka Metropolitan
                </Link>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-teal-400" />
                <Link href="/services?area=Chittagong" className="hover:text-teal-300 transition-colors">
                  Chittagong City
                </Link>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-teal-400" />
                <Link href="/services?area=Sylhet" className="hover:text-teal-300 transition-colors">
                  Sylhet Sadar
                </Link>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-teal-400" />
                <Link href="/locations" className="hover:text-teal-300 transition-colors font-medium text-teal-400">
                  All Divisions & Districts →
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Guarantee */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 tracking-tight">
              Customer Protection
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>SSLCommerz encrypted advance payment</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>20% advance holding until technician starts</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Transparent fixed or hourly pricing</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-teal-900 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>© {new Date().getFullYear()} ProLagbe / Local Service Finder System. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <span>Crafted with pride</span>
            <Heart className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
            <span>for local service excellence</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
