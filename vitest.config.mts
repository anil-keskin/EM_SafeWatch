import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
  },
  // tsconfig jsx: "preserve" Next.js derleyicisi içindir. Vitest .tsx
  // bileşenlerini renderToStaticMarkup ile test edebilmek için esbuild'e
  // JSX'i kendisinin derlemesini söyleriz; yol takma adları resolve.alias
  // üzerinden çalışmaya devam eder.
  oxc: {
    jsx: {
      runtime: "automatic",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
});
