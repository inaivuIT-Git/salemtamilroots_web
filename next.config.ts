import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const apiHost = new URL(process.env.API_BASE_URL ?? "https://uat.salemtamilroots.in");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Product and banner images are served by the API host (/assets/images/...).
    remotePatterns: [
      { protocol: apiHost.protocol.replace(":", "") as "http" | "https", hostname: apiHost.hostname },
      { protocol: "https", hostname: "salemtamilroots.in" },
      { protocol: "https", hostname: "uat.salemtamilroots.in" },
    ],
  },
};

export default createNextIntlPlugin("./src/i18n/request.ts")(nextConfig);
