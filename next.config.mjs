/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'buzke-images.s3.sa-east-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'buzke-images.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'buzke.com.br',
      },
    ],
  },
};

export default nextConfig;
