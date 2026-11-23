import * as React from "react";
import Link from "next/link";
import { Wrench, ShieldCheck, MapPin, ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-stone-900 text-stone-300 border-t border-stone-800 shrink-0 mt-auto">
      <div className="container mx-auto px-4 py-14 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#115E59] text-white shadow-sm">
                <Wrench className="h-4 w-4 text-teal-200" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white font-heading">
                Local <span className="text-teal-400">Service Finder</span>
              </span>
            </Link>
            <p className="text-sm text-stone-400 leading-relaxed">
              Bangladesh&apos;s leading local service marketplace. Connect with background-checked electricians, plumbers, appliance technicians, and home care specialists.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-stone-800/90 py-1.5 px-3 rounded-lg w-fit border border-stone-700">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Verified Local Services • Secure 20% Advance via SSLCommerz</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 tracking-tight">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <Link href="/" className="hover:text-teal-300 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-teal-300 transition-colors">
                  Browse Services
                </Link>
              </li>
              <li>
                <Link href="/register?role=SERVICE_PROVIDER" className="hover:text-teal-300 transition-colors">
                  Register as Provider
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-teal-300 transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 tracking-tight">
              Popular Categories
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
                <Link href="/services" className="hover:text-teal-300 transition-colors font-medium text-teal-400 flex items-center gap-1">
                  <span>View All Categories</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 tracking-tight">
              Service Areas
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                <Link href="/services?area=Dhaka" className="hover:text-teal-300 transition-colors">
                  Dhaka Metropolitan
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                <Link href="/services?area=Chittagong" className="hover:text-teal-300 transition-colors">
                  Chittagong City
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                <Link href="/services?area=Sylhet" className="hover:text-teal-300 transition-colors">
                  Sylhet Sadar
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                <Link href="/services" className="hover:text-teal-300 transition-colors font-medium text-teal-400 flex items-center gap-1">
                  <span>Explore All Locations</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 Local Service Finder System. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/services" className="hover:text-stone-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/services" className="hover:text-stone-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/services" className="hover:text-stone-400 transition-colors">
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
