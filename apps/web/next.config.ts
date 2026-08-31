import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

const dir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(dir, "../..");
loadEnvConfig(repoRoot);

const nextConfig: NextConfig = {
  transpilePackages: ["@arctrade/ui"],
  reactStrictMode: true,
  outputFileTracingRoot: repoRoot,
};

export default nextConfig;
