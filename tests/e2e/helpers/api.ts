import type { Character, CharactersResponse } from '../../src/types/api';

const API_BASE_URL = 'https://rickandmortyapi.com/api';

export const mockRickCharacter: Character = {
  id: 1,
  name: 'Rick Sanchez',
  status: 'Alive',
  species: 'Human',
  type: '',
  gender: 'Male',
  origin: {
    name: 'Earth',
    url: `${API_BASE_URL}/location/1`,
  },
  location: {
    name: 'Earth',
    url: `${API_BASE_URL}/location/20`,
  },
  image: `${API_BASE_URL}/character/avatar/1.jpeg`,
  episode: [`${API_BASE_URL}/episode/1`],
  url: `${API_BASE_URL}/character/1`,
  created: '2017-11-04T18:48:46.250Z',
};

export const mockPageTwoCharacter: Character = {
  id: 21,
  name: 'Test Character Page Two',
  status: 'Alive',
  species: 'Human',
  type: '',
  gender: 'Male',
  origin: {
    name: 'Earth',
    url: `${API_BASE_URL}/location/1`,
  },
  location: {
    name: 'Earth',
    url: `${API_BASE_URL}/location/20`,
  },
  image: `${API_BASE_URL}/character/avatar/21.jpeg`,
  episode: [`${API_BASE_URL}/episode/1`],
  url: `${API_BASE_URL}/character/21`,
  created: '2017-11-04T18:48:46.250Z',
};

export const mockCharactersPageOne: CharactersResponse = {
  info: {
    count: 826,
    pages: 42,
    next: `${API_BASE_URL}/character/?page=2`,
    prev: null,
  },
  results: [mockRickCharacter],
};

export const mockCharactersPageTwo: CharactersResponse = {
  info: {
    count: 826,
    pages: 42,
    next: `${API_BASE_URL}/character/?page=3`,
    prev: `${API_BASE_URL}/character`,
  },
  results: [mockPageTwoCharacter],
};

export function isCharactersListRequest(url: string): boolean {
  return /\/api\/character\/?(?:\?|$)/.test(url) && !/\/api\/character\/\d+/.test(url);
}

export function getRequestedPage(url: string): number {
  const match = url.match(/[?&]page=(\d+)/);
  return match ? Number.parseInt(match[1]!, 10) : 1;
}

export function getRequestedName(url: string): string | undefined {
  const match = url.match(/[?&]name=([^&]+)/);
  return match ? decodeURIComponent(match[1]!.replace(/\+/g, ' ')) : undefined;
}
