import { describe, expect, it } from 'vitest';
import { mockCharacter } from '@/test/fixtures/character';
import { buildCharacterJsonLd, buildCharacterLoadingPageSeo, buildCharacterPageSeo } from './characterSeo';
import { absoluteUrl, SITE_NAME } from './site';

describe('buildCharacterPageSeo', () => {
  it('builds page metadata for a character', () => {
    const seo = buildCharacterPageSeo(mockCharacter);

    expect(seo.title).toBe(`Rick Sanchez | ${SITE_NAME}`);
    expect(seo.path).toBe('/character/1');
    expect(seo.description).toContain('Rick Sanchez');
    expect(seo.description).toContain('alive');
    expect(seo.ogImage).toBe(mockCharacter.image);
    expect(seo.ogImageAlt).toBe('Rick Sanchez avatar');
    expect(seo.ogType).toBe('profile');
  });

  it('builds schema.org json-ld for a character', () => {
    const seo = buildCharacterPageSeo(mockCharacter);
    const jsonLd = buildCharacterJsonLd(mockCharacter, absoluteUrl('/character/1'));

    expect(seo.jsonLd).toEqual(jsonLd);
    expect(jsonLd).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `Rick Sanchez | ${SITE_NAME}`,
      url: absoluteUrl('/character/1'),
      mainEntity: {
        '@type': 'Person',
        name: 'Rick Sanchez',
        image: mockCharacter.image,
        identifier: '1',
      },
    });
  });

  it('builds loading metadata before character data is available', () => {
    const seo = buildCharacterLoadingPageSeo(42);

    expect(seo.title).toBe(`Character #42 | ${SITE_NAME}`);
    expect(seo.path).toBe('/character/42');
    expect(seo.jsonLd).toBeUndefined();
  });
});
