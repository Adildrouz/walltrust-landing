/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },

  async headers() {
    // CSP is Report-Only until nonce support is wired in via middleware.
    // Switch "Content-Security-Policy-Report-Only" → "Content-Security-Policy"
    // once you've confirmed zero violations in the browser console.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https://res.cloudinary.com",
      "connect-src 'self' https://va.vercel-insights.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // 2-year HSTS. Vercel also sets this at the edge; having it here is defence-in-depth.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Content-Security-Policy-Report-Only", value: csp },
        ],
      },
    ];
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
