import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native/CJS-Pakete nicht bundeln – vermeidet TDZ-Fehler beim Turbopack-Build
  serverExternalPackages: ["ws", "@neondatabase/serverless"],
};

export default nextConfig;
