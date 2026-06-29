/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  async rewrites() {
    return [
      // Serve the hand-built static marketing landing at "/"
      { source: "/", destination: "/index.html" },
    ];
  },
  async redirects() {
    // Consolidate the older /alternatives/* comparison URLs into /compare/*
    // (single canonical comparison hub — avoids duplicate content).
    return [
      {
        source: "/alternatives/:slug",
        destination: "/compare/:slug",
        permanent: true,
      },
      { source: "/alternatives", destination: "/compare", permanent: true },
    ];
  },
};

export default nextConfig;
