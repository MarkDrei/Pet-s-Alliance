import type { NextConfig } from "next";

/** Folder on the static host. Change this and rebuild to deploy elsewhere. */
const basePath = "/pets2";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
