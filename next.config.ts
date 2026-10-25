import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The sign-in page used to live at /login. Old links and bookmarks still work (the ?next= part is kept).
  async redirects() {
    return [{ source: "/login", destination: "/join", permanent: false }];
  },
  turbopack: {
    // A stray package-lock.json exists in the parent folder, so pin the root to this project.
    root: import.meta.dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
