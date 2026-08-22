import type { NextConfig } from "next";

/** Subfolder the static build is hosted under. Inlined into client bundles. */
const basePath = "/pets";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  // Emit /game/index.html so a plain webserver can serve /pets/game/ without rewrites.
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
