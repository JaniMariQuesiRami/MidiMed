const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  webpack: (config: any) => {
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    return config;
  },
  images: {
    domains: ["firebasestorage.googleapis.com"],
  },
};

module.exports = nextConfig;
