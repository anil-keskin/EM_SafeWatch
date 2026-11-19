/**
 * Statik yayın derlemesi (Cloudflare Pages ve benzeri sunucusuz barındırma).
 *
 * Next.js statik çıktıda API rotası (POST) üretemez. app/api geçici olarak
 * kenara alınır, `next build` STATIC_EXPORT=true ile çalışır ve `out/`
 * klasörü oluşur. Derleme bitince (hata olsa da) app/api geri konur.
 */
import { existsSync, renameSync } from "node:fs";
import { spawnSync } from "node:child_process";

const API = "app/api";
const HIDDEN = ".api-static-hidden";

const moved = existsSync(API);
if (moved) renameSync(API, HIDDEN);

let status = 1;
try {
  const result = spawnSync("npx", ["next", "build"], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, STATIC_EXPORT: "true" },
  });
  status = result.status ?? 1;
} finally {
  if (moved) renameSync(HIDDEN, API);
}
process.exit(status);
