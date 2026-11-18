import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Enables the slim runtime used by Dockerfile multi-stage builds.
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    // Keep resolution inside this repo even if a parent lockfile exists.
    root: rootDir,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
