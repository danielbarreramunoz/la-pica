import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  experimental: {
    agentUpgrade: "security",
    // Solo validar navegación instantánea en segmentos que la pidan con
    // `export const instant`. Las áreas privadas resuelven el acceso simulado
    // en el cliente y no pueden prerenderizarse todavía.
    instantInsights: {
      validationLevel: "manual-warning",
    },
  },
  partialPrefetching: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
