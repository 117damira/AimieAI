import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Turbopack's on-disk dev cache (default: on) writes/compacts a cache
    // database after every compile — on this machine that write/compaction
    // step alone takes 10+ seconds (see .next/dev/logs), which is what shows
    // up as "Compiling..." hanging on every navigation. Keeping the cache
    // in memory only removes that stall; the only cost is losing the cache
    // across dev server restarts.
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
