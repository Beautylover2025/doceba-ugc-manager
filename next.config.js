/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Edge Runtime compatibility for Supabase
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
}

export default nextConfig
