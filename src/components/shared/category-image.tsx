"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CategoryImageProps {
  src?: string | null;
  name: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: string;
}

/**
 * CategoryImage displays the real category image if available,
 * or a clean, neutral placeholder background without arbitrary icons or emoji.
 */
export function CategoryImage({
  src,
  name,
  className,
  containerClassName,
  aspectRatio = "aspect-[16/10]",
}: CategoryImageProps) {
  const [imgError, setImgError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // Normalize image URL: ensure non-empty string and valid protocol
  const hasValidSrc =
    Boolean(src) &&
    typeof src === "string" &&
    src.trim().length > 0 &&
    (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/"));

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-muted/40 rounded-t-xl select-none flex items-center justify-center",
        aspectRatio,
        containerClassName
      )}
    >
      {hasValidSrc && !imgError ? (
        <>
          {isLoading && (
            <div className="absolute inset-0 bg-muted/70 animate-pulse z-10" />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src!}
            alt={name}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setImgError(true);
              setIsLoading(false);
            }}
            className={cn(
              "h-full w-full object-cover transition-transform duration-300",
              isLoading ? "opacity-0" : "opacity-100",
              className
            )}
          />
        </>
      ) : (
        /* Clean, consistent neutral placeholder background without arbitrary icons or emoji */
        <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-muted/80 via-muted/40 to-muted/90 border-b border-border/40 p-4 transition-colors">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/80 border border-border/60 shadow-sm text-foreground/70 font-bold text-lg tracking-wider">
            {name.trim().charAt(0).toUpperCase()}
          </div>
        </div>
      )}
    </div>
  );
}
