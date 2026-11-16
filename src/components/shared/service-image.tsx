"use client";

import * as React from "react";
import Image from "next/image";
import { Wrench, Sparkles, ImageOff } from "lucide-react";

interface ServiceImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
}

export function ServiceImage({
  src,
  alt,
  className = "object-cover w-full h-full transition-transform duration-300 group-hover:scale-105",
  containerClassName = "relative w-full aspect-video bg-muted/50 overflow-hidden rounded-t-xl",
  priority = false,
}: ServiceImageProps) {
  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  // If no source or previously errored, render clean gradient placeholder
  const hasValidUrl = Boolean(
    src &&
    typeof src === "string" &&
    src.trim().length > 0 &&
    (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/"))
  );

  if (!hasValidUrl || error) {
    return (
      <div
        className={`${containerClassName} flex flex-col items-center justify-center bg-gradient-to-br from-primary/15 via-primary/5 to-muted/40 text-muted-foreground p-4 select-none border-b border-border/40`}
      >
        <div className="h-12 w-12 rounded-xl bg-background/80 shadow-sm flex items-center justify-center text-primary mb-2 ring-1 ring-border/60">
          <Wrench className="h-6 w-6" />
        </div>
        <span className="text-xs font-semibold text-foreground/80 line-clamp-1 text-center max-w-[85%]">
          {alt || "Local Service"}
        </span>
        <span className="text-[10px] text-muted-foreground mt-0.5 font-medium">
          Verified Professional Service
        </span>
      </div>
    );
  }

  return (
    <div className={`${containerClassName} relative`}>
      {loading && (
        <div className="absolute inset-0 bg-muted/60 animate-pulse flex items-center justify-center z-10">
          <Wrench className="h-6 w-6 text-muted-foreground/30 animate-spin" />
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src!}
        alt={alt || "Service image"}
        className={`${className} ${loading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
    </div>
  );
}
