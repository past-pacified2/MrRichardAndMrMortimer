export const SITE_NAME = 'Mr. Rick & Mr. Mortimer';

export const DEFAULT_DESCRIPTION =
  'Browse Rick and Morty characters with status, species, origin, and episode details from the Rick and Morty API.';

export const SITE_URL = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '') || 'http://localhost:5173';

export function absoluteUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${SITE_URL}${normalizedPath}`;
}

export const defaultPageSeo = {
  title: SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  path: '/',
  ogType: 'website',
  ogImage: absoluteUrl('/fav/web-app-manifest-512x512.png'),
  ogImageAlt: `${SITE_NAME} app icon`,
  robots: 'index, follow',
} as const;
