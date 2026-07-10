import { describe, expect, it } from 'vitest';
import { buildFatalErrorPageSeo, buildNotFoundPageSeo } from './errorSeo';
import { absoluteUrl, SITE_NAME } from './site';

describe('buildNotFoundPageSeo', () => {
  it('builds noindex metadata for the requested path', () => {
    const seo = buildNotFoundPageSeo('/character/99999');

    expect(seo.title).toBe(`Page not found | ${SITE_NAME}`);
    expect(seo.path).toBe('/character/99999');
    expect(seo.robots).toBe('noindex, follow');
    expect(seo.description).toContain('does not exist');
  });

  it('builds schema.org json-ld for the requested path', () => {
    const seo = buildNotFoundPageSeo('/this-dimension-does-not-exist');

    expect(seo.jsonLd).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `Page not found | ${SITE_NAME}`,
      url: absoluteUrl('/this-dimension-does-not-exist'),
    });
  });
});

describe('buildFatalErrorPageSeo', () => {
  it('builds noindex metadata for the fatal error route', () => {
    const seo = buildFatalErrorPageSeo();

    expect(seo.title).toBe(`Something went wrong | ${SITE_NAME}`);
    expect(seo.path).toBe('/500');
    expect(seo.robots).toBe('noindex, follow');
    expect(seo.description).toContain('unexpected error');
  });

  it('builds schema.org json-ld for the fatal error route', () => {
    const seo = buildFatalErrorPageSeo();

    expect(seo.jsonLd).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `Something went wrong | ${SITE_NAME}`,
      url: absoluteUrl('/500'),
    });
  });
});
