// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Agar external images (Profile pics, etc) use karni hain toh yahan domain likhein
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all for now, production mein isko strict kar lena
      },
    ],
  },

  // Ye setting Next.js ko allow karegi ki external URLs se directly resources fetch ho sakein
  experimental: {
    // Agar Next.js 15 use kar rahe hain, toh 'after' middleware enable kar sakte hain 
    // jo background jobs ke liye best hai bina response delay kiye.
    // after: true,
  },
};

export default nextConfig;
