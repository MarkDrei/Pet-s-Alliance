/**
 * Prefix for files in `public/` when the app is hosted under a Next.js basePath.
 * `next/link` and `next/image` already honor it; SVG `<image href>` does not.
 */
export function publicUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
