import type { PageSeo } from './pageSeo';
import { absoluteUrl, defaultPageSeo, SITE_NAME } from './site';

const NOT_FOUND_DESCRIPTION = 'The page you are looking for does not exist in this dimension.';

const FATAL_ERROR_DESCRIPTION = 'An unexpected error occurred in this dimension.';

function buildErrorPageJsonLd(name: string, description: string, pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    url: pageUrl,
    description,
  };
}

export function buildNotFoundPageSeo(path: string): PageSeo {
  const pageUrl = absoluteUrl(path);
  const title = `Page not found | ${SITE_NAME}`;

  return {
    title,
    description: NOT_FOUND_DESCRIPTION,
    path,
    ogType: defaultPageSeo.ogType,
    ogImage: defaultPageSeo.ogImage,
    ogImageAlt: defaultPageSeo.ogImageAlt,
    robots: 'noindex, follow',
    jsonLd: buildErrorPageJsonLd(title, NOT_FOUND_DESCRIPTION, pageUrl),
  };
}

export function buildFatalErrorPageSeo(): PageSeo {
  const path = '/500';
  const pageUrl = absoluteUrl(path);
  const title = `Something went wrong | ${SITE_NAME}`;

  return {
    title,
    description: FATAL_ERROR_DESCRIPTION,
    path,
    ogType: defaultPageSeo.ogType,
    ogImage: defaultPageSeo.ogImage,
    ogImageAlt: defaultPageSeo.ogImageAlt,
    robots: 'noindex, follow',
    jsonLd: buildErrorPageJsonLd(title, FATAL_ERROR_DESCRIPTION, pageUrl),
  };
}
