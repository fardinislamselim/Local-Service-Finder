/**
 * Image normalization utility
 * Normalizes Cloudinary image paths and remote URLs to valid absolute URLs
 */
export function normalizeImageUrl(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }
  if (trimmed.startsWith("image/upload/") || trimmed.startsWith("/image/upload/")) {
    const cleanPath = trimmed.replace(/^\/+/, "");
    return `https://res.cloudinary.com/fqmghvmm/${cleanPath}`;
  }
  if (!trimmed.startsWith("/")) {
    return `https://res.cloudinary.com/fqmghvmm/${trimmed}`;
  }
  return trimmed;
}
