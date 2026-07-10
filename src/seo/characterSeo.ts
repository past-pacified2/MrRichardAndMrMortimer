import type { PageSeo } from './pageSeo';
import type { Character } from '@/types/api';
import { absoluteUrl, SITE_NAME } from './site';

function buildCharacterDescription(character: Character): string {
  const typeSuffix = character.type ? ` ${character.type}` : '';

  return `${character.name} is a ${character.status.toLowerCase()} ${character.species}${typeSuffix} from ${character.origin.name}. Last seen in ${character.location.name}.`;
}

export function buildCharacterJsonLd(character: Character, pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${character.name} | ${SITE_NAME}`,
    url: pageUrl,
    description: buildCharacterDescription(character),
    mainEntity: {
      '@type': 'Person',
      name: character.name,
      image: character.image,
      url: pageUrl,
      identifier: String(character.id),
      description: buildCharacterDescription(character),
      gender: character.gender,
      homeLocation: {
        '@type': 'Place',
        name: character.origin.name,
      },
      workLocation: {
        '@type': 'Place',
        name: character.location.name,
      },
    },
  };
}

export function buildCharacterPageSeo(character: Character): PageSeo {
  const path = `/character/${character.id}`;
  const pageUrl = absoluteUrl(path);
  const description = buildCharacterDescription(character);

  return {
    title: `${character.name} | ${SITE_NAME}`,
    description,
    path,
    ogType: 'profile',
    ogImage: character.image,
    ogImageAlt: `${character.name} avatar`,
    jsonLd: buildCharacterJsonLd(character, pageUrl),
  };
}

export function buildCharacterLoadingPageSeo(characterId: number): PageSeo {
  return {
    title: `Character #${characterId} | ${SITE_NAME}`,
    description: `Loading Rick and Morty character #${characterId}.`,
    path: `/character/${characterId}`,
    ogType: 'website',
  };
}
