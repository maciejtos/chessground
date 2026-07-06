import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  output: "export",
  basePath: "/chessground",
  assetPrefix: "/chessground/",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
