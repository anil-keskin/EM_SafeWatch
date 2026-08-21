import type { Config } from "tailwindcss";

/**
 * Tailwind 4 bu dosyayı `globals.css` içindeki @config ile okur.
 * content yolları app/ ve components/ altındaki tüm TSX dosyalarını kapsar.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./content/**/*.{js,ts,jsx,tsx}",
  ],
};

export default config;
