import type { NextConfig } from "next";

/** GitHub Pages: https://anil-keskin.github.io/EM_SafeWatch/ */
const REPO_NAME = "EM_SafeWatch";
const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPages ? `/${REPO_NAME}` : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isGithubPages
    ? {
        output: "export" as const,
        basePath,
        assetPrefix: basePath,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
