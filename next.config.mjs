/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // MediaPipe & TF.js ship WASM/binary assets - ensure they're not broken by webpack fallbacks
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  // Required so MediaPipe's WASM assets can be loaded cross-origin in dev
  async headers() {
    return [
      {
        source: '/models/:path*',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
        ],
      },
    ];
  },
};

export default nextConfig;
