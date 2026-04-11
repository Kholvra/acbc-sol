/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
  webpack: (config) => {
    // Suppress warnings for optional dependencies not available in browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      " @react-native-async-storage/async-storage": false,
      "pino-pretty": false,
    };
    return config;
  },
};

export default config;
