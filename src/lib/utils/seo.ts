import 'dotenv/config';

export function getCanonicalUrl(url: URL, lang?: string): string {
  const base = process.env.PROJECT_URL;
  const path = url.pathname;
  
  // Remove existing language prefix if present
  const cleanPath = path.replace(/^\/[a-z]{2}(\/|$)/, '/');
  
  return lang 
    ? `${base}/${lang}${cleanPath}`
    : `${base}${cleanPath}`;
}