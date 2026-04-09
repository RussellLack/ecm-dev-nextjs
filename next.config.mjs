/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don't advertise the framework in response headers.
  poweredByHeader: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "static.wixstatic.com",
      },
    ],
  },

  /**
   * Static security headers.
   *
   * The Content-Security-Policy header is *not* set here — it's minted per
   * request in `middleware.ts` so each response gets a fresh nonce. Everything
   * below is static and doesn't need per-request computation, so serving it
   * from next.config.mjs is cheaper than doing it in middleware.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
