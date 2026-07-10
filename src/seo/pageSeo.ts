import { defaultPageSeo } from './site';

export interface PageSeo {
  title: string;
  description: string;
  path: string;
  ogType?: string;
  ogImage?: string;
  ogImageAlt?: string;
  robots?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const JSON_LD_ID = 'page-json-ld';

const managedMetaSelectors = [
  ['name', 'description'],
  ['name', 'robots'],
  ['property', 'og:type'],
  ['property', 'og:title'],
  ['property', 'og:description'],
  ['property', 'og:url'],
  ['property', 'og:image'],
  ['property', 'og:image:alt'],
  ['name', 'twitter:title'],
  ['name', 'twitter:description'],
  ['name', 'twitter:image'],
  ['name', 'twitter:image:alt'],
] as const;

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let element = document.head.querySelector('link[rel="canonical"]');

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
}

function upsertJsonLd(jsonLd: PageSeo['jsonLd']) {
  const existing = document.getElementById(JSON_LD_ID);
  existing?.remove();

  if (!jsonLd) {
    return;
  }

  const script = document.createElement('script');
  script.id = JSON_LD_ID;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(jsonLd);
  document.head.appendChild(script);
}

export function applyPageSeo(seo: PageSeo, siteUrl: string) {
  const canonicalUrl = `${siteUrl}${seo.path.startsWith('/') ? seo.path : `/${seo.path}`}`;
  const ogImage = seo.ogImage ?? defaultPageSeo.ogImage;
  const ogImageAlt = seo.ogImageAlt ?? defaultPageSeo.ogImageAlt;

  document.title = seo.title;
  upsertMeta('name', 'description', seo.description);
  upsertMeta('name', 'robots', seo.robots ?? defaultPageSeo.robots);
  upsertMeta('property', 'og:type', seo.ogType ?? defaultPageSeo.ogType);
  upsertMeta('property', 'og:title', seo.title);
  upsertMeta('property', 'og:description', seo.description);
  upsertMeta('property', 'og:url', canonicalUrl);
  upsertMeta('property', 'og:image', ogImage);
  upsertMeta('property', 'og:image:alt', ogImageAlt);
  upsertMeta('name', 'twitter:title', seo.title);
  upsertMeta('name', 'twitter:description', seo.description);
  upsertMeta('name', 'twitter:image', ogImage);
  upsertMeta('name', 'twitter:image:alt', ogImageAlt);
  upsertCanonical(canonicalUrl);
  upsertJsonLd(seo.jsonLd);
}

export function resetPageSeo(siteUrl: string) {
  applyPageSeo(
    {
      title: defaultPageSeo.title,
      description: defaultPageSeo.description,
      path: defaultPageSeo.path,
      ogType: defaultPageSeo.ogType,
      ogImage: defaultPageSeo.ogImage,
      ogImageAlt: defaultPageSeo.ogImageAlt,
      robots: defaultPageSeo.robots,
    },
    siteUrl,
  );
}

export function removeManagedMetaTags() {
  for (const [attribute, key] of managedMetaSelectors) {
    document.head.querySelector(`meta[${attribute}="${key}"]`)?.remove();
  }

  document.getElementById(JSON_LD_ID)?.remove();
}
