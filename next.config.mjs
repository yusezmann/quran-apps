/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Hanya untuk uji lokal: NEXT_DIST_DIR memisahkan folder build dari `next dev` yang sedang jalan
  // (hasil export ikut pindah ke folder itu). Build normal (Vercel, APK) tetap menghasilkan `out/`.
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
