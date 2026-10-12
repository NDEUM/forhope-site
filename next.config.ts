import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Anciennes adresses : « À propos » et « Actions » vivent désormais sous « Notre histoire ».
  async redirects() {
    return [
      { source: "/a-propos", destination: "/notre-histoire", permanent: true },
      { source: "/actions", destination: "/notre-histoire/domaines-d-action", permanent: true },
    ];
  },
};

export default nextConfig;
