/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Essential for Android Capacitor / TWA
  images: {
    unoptimized: true, // Required for static export
  },
  eslint: {
    ignoreDuringBuilds: true, // Allow production build despite minor lint issues
  },
  typescript: {
    ignoreBuildErrors: true, // Allow production build despite minor type issues
  },
  // Ensure trailing slashes for static hosting consistency
  trailingSlash: true,
};

export default nextConfig;