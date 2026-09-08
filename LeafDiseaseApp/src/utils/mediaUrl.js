import { API_BASE_URL } from "../api/api.js";

/**
 * Constructs a full URL for backend-served media (uploaded images, Grad-CAM).
 *
 * - null/undefined/empty → returns ""
 * - Already absolute (http:// or https://) → returned unchanged
 * - Data URLs (data:...) → returned unchanged
 * - Relative paths (/uploads/...) → prepended with the API base URL
 */
export function getMediaUrl(path) {
  if (!path) return "";

  // Already a full URL or data URI — return as-is
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  // Build full URL from the same base Axios uses
  const base = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${base}${cleanPath}`;
}
