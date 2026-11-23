"use client";

import * as React from "react";
import Link from "next/link";
import { Wrench, Star, ShieldCheck, CheckCircle2, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";

interface AuthSplitLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthSplitLayout({ children, title, subtitle }: AuthSplitLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAF9F6] text-stone-900 selection:bg-teal-700/20 selection:text-teal-900">
      {/* LEFT PANEL: 45% Desktop, Deep Emerald Teal textured canvas */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#042F2E] text-stone-100 flex-col justify-between p-12 relative overflow-hidden shrink-0 border-r border-teal-950">
        {/* Decorative Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />

        {/* Ambient Glows */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-xl bg-teal-800 text-stone-50 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Wrench className="h-5 w-5 text-teal-200" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white font-heading">
              Pro<span className="text-teal-400">Lagbe</span>
            </span>
          </Link>
        </div>

        {/* Editorial Headline & 3 Floating Glassmorphic Service Pro Cards */}
        <div className="relative z-10 space-y-8 my-auto py-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-900/80 text-teal-300 border border-teal-700/60 shadow-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Verified Local Marketplace
            </div>
            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight font-heading">
              Trusted Home & Local Experts at Your Doorstep
            </h1>
            <p className="text-sm xl:text-base text-teal-200/80 leading-relaxed max-w-md">
              Book vetted electricians, technicians, and artisans across Bangladesh with transparent pricing and secure 20% advance protection.
            </p>
          </div>

          {/* 3 Floating Glassmorphic Preview Cards */}
          <div className="space-y-3.5 max-w-md">
            {/* Card 1 */}
            <div className="p-3.5 rounded-2xl bg-teal-950/60 border border-teal-800/60 backdrop-blur-md shadow-lg flex items-center justify-between transition-all hover:translate-x-1 duration-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-white text-sm shadow-sm">
                  EK
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-white">Enamul Karim</span>
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <p className="text-xs text-teal-300">Master Electrician • Mirpur, Dhaka</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-xs text-amber-400 font-bold">
                  <Star className="h-3 w-3 fill-amber-400" />
                  <span>4.9</span>
                  <span className="text-teal-400/80 text-[10px] font-normal">(128)</span>
                </div>
                <span className="text-xs font-semibold text-emerald-300 tabular-nums">৳500 Fixed</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-3.5 rounded-2xl bg-teal-950/60 border border-teal-800/60 backdrop-blur-md shadow-lg flex items-center justify-between transition-all hover:translate-x-1 duration-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-600 flex items-center justify-center font-bold text-white text-sm shadow-sm">
                  RH
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-white">Rafiqul Hasan</span>
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <p className="text-xs text-teal-300">AC & Cooling Tech • Uttara, Dhaka</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-xs text-amber-400 font-bold">
                  <Star className="h-3 w-3 fill-amber-400" />
                  <span>5.0</span>
                  <span className="text-teal-400/80 text-[10px] font-normal">(84)</span>
                </div>
                <span className="text-xs font-semibold text-emerald-300 tabular-nums">৳800/hr</span>
              </div>
            </div>

            {/* Card 3: Trust Guarantee Pill */}
            <div className="p-3 rounded-xl bg-teal-900/40 border border-teal-700/40 backdrop-blur-sm flex items-center gap-2.5 text-xs text-teal-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                <strong className="text-white font-semibold">20% Secure Advance</strong> held safely via SSLCommerz until service starts.
              </span>
            </div>
          </div>
        </div>

        {/* Footer info in left panel */}
        <div className="relative z-10 text-xs text-teal-400/80 flex items-center justify-between pt-6 border-t border-teal-900/60">
          <span>© {new Date().getFullYear()} ProLagbe System</span>
          <span className="flex items-center gap-1">SSLCommerz Protected</span>
        </div>
      </div>

      {/* RIGHT PANEL: 55% Desktop, Warm Alabaster canvas */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative overflow-y-auto">
        {/* Top actions */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80 px-3 py-1.5 rounded-full transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Form Container */}
        <div className="max-w-md w-full mx-auto my-auto py-4">
          <div className="mb-6 space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 font-heading">
              {title}
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {children}
        </div>

        {/* Legal footer */}
        <div className="text-center text-xs text-stone-400 pt-8 mt-auto">
          Protected by industry standard encryption & SSLCommerz.
        </div>
      </div>
    </div>
  );
}

export default AuthSplitLayout;
