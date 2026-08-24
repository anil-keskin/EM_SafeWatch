/**
 * GitHub Pages proje sitesi alt klasörde yayınlanır:
 * https://anil-keskin.github.io/EM_SafeWatch/
 *
 * Next.js Link bu öneki config.basePath ile kendisi ekler.
 * Ham <img src> ve service worker kaydı withBase() kullanmalıdır.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBase(path: string): string {
  if (!path.startsWith("/")) return path;
  if (!BASE_PATH) return path;
  return `${BASE_PATH}${path}`;
}
