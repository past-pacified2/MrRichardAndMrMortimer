import { afterEach, describe, expect, it } from 'vitest';
import { applyPageSeo, resetPageSeo } from './pageSeo';

const TEST_SITE_URL = 'https://example.test';

describe('applyPageSeo', () => {
  afterEach(() => {
    document.head.innerHTML = '';
    document.title = '';
  });

  it('updates title, canonical, meta tags, and json-ld', () => {
    applyPageSeo(
      {
        title: 'Rick Sanchez | Mr. Rick & Mr. Mortimer',
        description: 'Rick Sanchez is an alive human.',
        path: '/character/1',
        ogType: 'profile',
        ogImage: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
        ogImageAlt: 'Rick Sanchez avatar',
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Rick Sanchez',
        },
      },
      TEST_SITE_URL,
    );

    expect(document.title).toBe('Rick Sanchez | Mr. Rick & Mr. Mortimer');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://example.test/character/1',
    );
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'Rick Sanchez is an alive human.',
    );
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(
      'https://example.test/character/1',
    );
    expect(document.querySelector('script[type="application/ld+json"]')?.textContent).toContain('Rick Sanchez');
  });

  it('resets to the default home seo on unmount', () => {
    applyPageSeo(
      {
        title: 'Rick Sanchez | Mr. Rick & Mr. Mortimer',
        description: 'Character page',
        path: '/character/1',
      },
      TEST_SITE_URL,
    );

    resetPageSeo(TEST_SITE_URL);

    expect(document.title).toBe('Mr. Rick & Mr. Mortimer');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://example.test/');
    expect(document.querySelector('script[type="application/ld+json"]')).toBeNull();
  });
});
