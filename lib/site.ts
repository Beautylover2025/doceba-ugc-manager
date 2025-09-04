/**
 * Utility function to get the site origin for redirects
 * Works both in browser and server environments
 */
export function getSiteOrigin(): string {
  // Browser environment
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Server environment - use environment variable
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // Fallback for production
  return 'https://doceba-ugc-manager.vercel.app';
}
