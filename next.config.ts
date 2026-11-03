import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const apiHost = new URL(process.env.API_BASE_URL ?? "https://uat.salemtamilroots.in");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Product and banner images are served by the API host (/assets/images/...). Browsers load them
    // directly, as on the current site: the image optimiser would fetch them server-side through
    // Cloudflare, which can block server-to-server requests. Set IMAGE_OPTIMIZE=1 to turn it on.
    unoptimized: process.env.IMAGE_OPTIMIZE !== "1",
    remotePatterns: [
      { protocol: apiHost.protocol.replace(":", "") as "http" | "https", hostname: apiHost.hostname },
      { protocol: "https", hostname: "salemtamilroots.in" },
      { protocol: "https", hostname: "uat.salemtamilroots.in" },
    ],
  },
};

export default createNextIntlPlugin("./src/i18n/request.ts")(nextConfig);
