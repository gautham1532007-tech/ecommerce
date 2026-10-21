const FALLBACK_IMAGE = "/product-placeholder.svg";

export function getSafeProductImageUrl(value) {
  if (typeof value !== "string" || !value.trim()) return FALLBACK_IMAGE;
  const imageUrl = value.trim();
  if (imageUrl.startsWith("//")) return FALLBACK_IMAGE;
  if (imageUrl.startsWith("/") && !imageUrl.startsWith("//")) return imageUrl;

  try {
    const parsed = new URL(imageUrl, window.location.origin);
    const sameOrigin = parsed.origin === window.location.origin;
    if (
      (sameOrigin || parsed.protocol === "https:") &&
      !parsed.username &&
      !parsed.password
    ) {
      return value;
    }
  } catch {
    return FALLBACK_IMAGE;
  }

  return FALLBACK_IMAGE;
}
