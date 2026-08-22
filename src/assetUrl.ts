/**
 * Prefix for files in `public/` when the app is hosted under Next.js `basePath`.
 * `next/link` is prefixed automatically; raw URLs (sprite sheets, etc.) are not.
 */
export function publicUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
