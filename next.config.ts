import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Builds a self-contained server in .next/standalone with only the files it needs, so the Docker image stays small.
  output: "standalone",
  // Tells Turbopack this folder is the project root (silences the warning about the stray package-lock.json in the home folder).
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
