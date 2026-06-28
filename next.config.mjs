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
};

export default nextConfig;
