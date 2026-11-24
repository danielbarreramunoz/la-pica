import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Cache Components desactivado: el runtime de Workers lo cuelga
     (Next.js advierte que setTimeout no es compatible). */
  experimental: {
    agentUpgrade: "security",
  },
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
