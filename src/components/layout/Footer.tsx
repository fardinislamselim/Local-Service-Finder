import * as React from "react";
import Link from "next/link";
import { Wrench, ShieldCheck, MapPin, ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-stone-900 text-stone-300 border-t border-stone-800 shrink-0 mt-auto">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 text-base font-semibold text-white tracking-tight">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#115E59] text-white">
                <Wrench className="h-4 w-4 text-teal-100" />
              </div>
              <span className="font-heading">
                Local <span className="text-teal-400">Service Finder</span>
              </span>
            </Link>
            <p className="text-xs text-stone-400 leading-relaxed">
              Bangladesh&apos;s verified local marketplace for home maintenance, electrical repairs, plumbing, and appliance servicing.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-300 bg-stone-800/80 py-1.5 px-3 rounded-lg w-fit border border-stone-700/60">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Verified pros • 20% advance held safely</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-stone-100">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link href="/" className="hover:text-stone-100 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-stone-100 transition-colors">
                  Browse services
                </Link>
              </li>
              <li>
                <Link href="/register?role=SERVICE_PROVIDER" className="hover:text-stone-100 transition-colors">
                  Register as provider
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-stone-100 transition-colors">
                  Sign in
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-stone-100">
              Popular services
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link href="/services?search=ac" className="hover:text-stone-100 transition-colors">
                  AC servicing & repair
                </Link>
              </li>
              <li>
                <Link href="/services?search=plumbing" className="hover:text-stone-100 transition-colors">
                  Plumbing solutions
                </Link>
              </li>
              <li>
                <Link href="/services?search=electrical" className="hover:text-stone-100 transition-colors">
                  Electrical wiring & repair
                </Link>
              </li>
              <li>
                <Link href="/services?search=cleaning" className="hover:text-stone-100 transition-colors">
                  Home deep cleaning
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-teal-400 transition-colors font-medium text-teal-400 flex items-center gap-1 pt-1">
                  <span>All categories</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Service Areas */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-stone-100">
              Service areas
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-stone-500 shrink-0" />
                <Link href="/services?area=Dhaka" className="hover:text-stone-100 transition-colors">
                  Dhaka Metropolitan
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-stone-500 shrink-0" />
                <Link href="/services?area=Chittagong" className="hover:text-stone-100 transition-colors">
                  Chittagong City
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-stone-500 shrink-0" />
                <Link href="/services?area=Sylhet" className="hover:text-stone-100 transition-colors">
                  Sylhet Sadar
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-stone-500 shrink-0" />
                <Link href="/services" className="hover:text-teal-400 transition-colors font-medium text-teal-400 flex items-center gap-1 pt-1">
                  <span>Explore all upazilas</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 Local Service Finder. Built for verified trade services.</p>
          <div className="flex items-center gap-6">
            <Link href="/services" className="hover:text-stone-400 transition-colors">
              Privacy
            </Link>
            <Link href="/services" className="hover:text-stone-400 transition-colors">
              Terms
            </Link>
            <Link href="/services" className="hover:text-stone-400 transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
