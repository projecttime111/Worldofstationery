import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server build (round 3): public pages are still prerendered and cached, and refresh
  // within seconds when an admin publishes a change (on-demand revalidation).
  trailingSlash: true,
  images: { unoptimized: true },
  async redirects() {
    return [{ source: "/", destination: "/en/", permanent: false }];
  },
  experimental: {
    // Lets app/global-not-found.tsx render the 404 page with the site's look.
    globalNotFound: true,
    // Tailwind CSS is small, so it goes inside each page: no extra request before the page can paint.
    inlineCss: true,
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
