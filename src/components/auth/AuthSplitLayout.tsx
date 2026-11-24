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
      {/* LEFT PANEL: 45% Desktop, Deep Emerald Teal quiet canvas */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#042F2E] text-stone-100 flex-col justify-between p-12 relative overflow-hidden shrink-0 border-r border-[#021f1e]">
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-lg bg-[#115E59] text-stone-50 flex items-center justify-center border border-teal-700/60 shadow-xs">
              <Wrench className="h-4 w-4 text-teal-100" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white leading-none">
                Local Service Finder
              </span>
              <span className="text-[10px] text-teal-300/80 tracking-wide font-medium mt-0.5">
                Verified trade marketplace
              </span>
            </div>
          </Link>
        </div>

        {/* Editorial Content & Craftsman Cards */}
        <div className="relative z-10 space-y-8 my-auto py-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-teal-900/60 text-teal-200 border border-teal-800/80">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span>Verified local pros</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white leading-snug">
              Skilled trade professionals, hired with confidence.
            </h1>
            <p className="text-xs text-teal-200/80 leading-relaxed max-w-sm">
              Connect with vetted electricians, technicians, and artisans across Bangladesh with transparent pricing and escrow-backed advance payments.
            </p>
          </div>

          {/* Quiet Pro Cards */}
          <div className="space-y-3 max-w-sm">
            {/* Card 1 */}
            <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-800/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-teal-900/80 border border-teal-700/50 flex items-center justify-center font-medium text-xs text-teal-100">
                  EK
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-white">Enamul Karim</span>
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  </div>
                  <p className="text-[11px] text-teal-300/70">Master electrician • Mirpur</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-[11px] text-amber-300 font-medium">
                  <Star className="h-3 w-3 fill-amber-300" />
                  <span>4.9</span>
                  <span className="text-teal-400/60 font-normal">(128)</span>
                </div>
                <span className="text-[11px] font-medium text-emerald-300 tabular-nums">৳500 base</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-800/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-teal-900/80 border border-teal-700/50 flex items-center justify-center font-medium text-xs text-teal-100">
                  RH
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-white">Rafiqul Hasan</span>
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  </div>
                  <p className="text-[11px] text-teal-300/70">Cooling & HVAC tech • Uttara</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-[11px] text-amber-300 font-medium">
                  <Star className="h-3 w-3 fill-amber-300" />
                  <span>5.0</span>
                  <span className="text-teal-400/60 font-normal">(84)</span>
                </div>
                <span className="text-[11px] font-medium text-emerald-300 tabular-nums">৳800/hr</span>
              </div>
            </div>

            {/* Escrow note */}
            <div className="p-3 rounded-xl bg-teal-950/20 border border-teal-800/30 flex items-start gap-2 text-[11px] text-teal-200/80 leading-relaxed">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-white font-medium">20% advance protection:</strong> funds are held safely in escrow via SSLCommerz until service starts.
              </span>
            </div>
          </div>
        </div>

        {/* Footer info in left panel */}
        <div className="relative z-10 text-[11px] text-teal-300/60 flex items-center justify-between pt-4 border-t border-teal-900/40">
          <span>© {new Date().getFullYear()} Local Service Finder</span>
          <span>SSLCommerz encrypted</span>
        </div>
      </div>

      {/* RIGHT PANEL: 55% Desktop, Warm Stone canvas */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 relative overflow-y-auto">
        {/* Top actions */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/70 px-3 py-1.5 rounded-lg transition-colors border border-stone-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to home</span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Form Container */}
        <div className="max-w-md w-full mx-auto my-auto py-2">
          <div className="mb-6 space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
              {title}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {children}
        </div>

        {/* Legal footer */}
        <div className="text-center text-[11px] text-stone-400 pt-8 mt-auto">
          Protected by industry standard encryption & SSLCommerz.
        </div>
      </div>
    </div>
  );
}

export default AuthSplitLayout;
