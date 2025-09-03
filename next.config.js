/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Ensure environment variables are available in Edge Runtime
    serverComponentsExternalPackages: ['@supabase/auth-helpers-nextjs'],
  },
  // Make sure environment variables are properly loaded
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
}

export default nextConfig
