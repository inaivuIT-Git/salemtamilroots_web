import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const apiHost = new URL(process.env.API_BASE_URL ?? "https://uat.salemtamilroots.in");

// Where /api/* goes when the app itself receives it (local development). On UAT nginx sends
// /api straight to the API, so the browser always talks to one origin and the API's sign-in
// cookie works. API_INTERNAL_URL skips Cloudflare on the server.
const apiForRewrite = (process.env.API_INTERNAL_URL || process.env.API_BASE_URL || "https://uat.salemtamilroots.in").replace(/\/$/, "");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${apiForRewrite}/api/:path*` },
      { source: "/assets/images/:path*", destination: `${apiForRewrite}/assets/images/:path*` },
    ];
  },
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
