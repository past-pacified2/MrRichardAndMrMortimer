import type { Character } from '@/types/api';
import { flushPromises } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { ApiError, ApiNotFoundError } from '@/api/rickandmorty';
import { renderComposable } from './test/renderComposable';
import { parseCharacterId, useCharacter } from './useCharacter';

vi.mock('@/api/rickandmorty', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/rickandmorty')>();
  return {
    ...actual,
    fetchCharacter: vi.fn(),
  };
});

const { fetchCharacter } = await import('@/api/rickandmorty');

const mockCharacter: Character = {
  id: 1,
  name: 'Rick Sanchez',
  status: 'Alive',
  species: 'Human',
  type: '',
  gender: 'Male',
  origin: {
    name: 'Earth',
    url: 'https://rickandmortyapi.com/api/location/1',
  },
  location: {
    name: 'Earth',
    url: 'https://rickandmortyapi.com/api/location/20',
  },
  image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
  episode: ['https://rickandmortyapi.com/api/episode/1'],
  url: 'https://rickandmortyapi.com/api/character/1',
  created: '2017-11-04T18:48:46.250Z',
};

describe('parseCharacterId', () => {
  it('parses a numeric string id', () => {
    expect(parseCharacterId('42')).toBe(42);
  });

  it('returns null for invalid ids', () => {
    expect(parseCharacterId('not-a-number')).toBeNull();
    expect(parseCharacterId('0')).toBeNull();
    expect(parseCharacterId('-1')).toBeNull();
  });
});

describe('useCharacter', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('loads a character by id', async () => {
    vi.mocked(fetchCharacter).mockResolvedValue(mockCharacter);

    const { result } = renderComposable(() => useCharacter(1));

    await flushPromises();

    expect(fetchCharacter).toHaveBeenCalledWith(1, { signal: expect.any(AbortSignal) });
    expect(result.isSuccess.value).toBe(true);
    expect(result.data.value).toEqual(mockCharacter);
  });

  it('enters an error state when the character does not exist', async () => {
    const notFoundError = new ApiNotFoundError('Character not found');
    vi.mocked(fetchCharacter).mockRejectedValue(notFoundError);

    const { result } = renderComposable(() => useCharacter(99999));

    await flushPromises();

    expect(fetchCharacter).toHaveBeenCalledWith(99999, { signal: expect.any(AbortSignal) });
    expect(result.isError.value).toBe(true);
    expect(result.error.value).toBe(notFoundError);
  });

  it('enters an error state for recoverable failures', async () => {
    const apiError = new ApiError(500, 'Server error');
    vi.mocked(fetchCharacter).mockRejectedValue(apiError);

    const { result } = renderComposable(() => useCharacter(1));

    await flushPromises();

    expect(result.isError.value).toBe(true);
    expect(result.error.value).toBe(apiError);
  });

  it('can refetch after an error', async () => {
    const apiError = new ApiError(500, 'Server error');

    vi.mocked(fetchCharacter).mockRejectedValueOnce(apiError).mockResolvedValueOnce(mockCharacter);

    const { result } = renderComposable(() => useCharacter(1));

    await flushPromises();
    expect(result.isError.value).toBe(true);

    await result.refetch();
    await flushPromises();

    expect(fetchCharacter).toHaveBeenCalledTimes(2);
    expect(result.isSuccess.value).toBe(true);
    expect(result.data.value).toEqual(mockCharacter);
  });

  it('aborts the previous request when the character id changes', async () => {
    const signals: AbortSignal[] = [];

    vi.mocked(fetchCharacter).mockImplementation((_id, options) => {
      if (options?.signal) {
        signals.push(options.signal);
      }

      return new Promise(() => {});
    });

    const characterId = ref<number | null>(1);
    renderComposable(() => useCharacter(characterId));

    await flushPromises();

    characterId.value = 2;
    await flushPromises();

    expect(signals).toHaveLength(2);
    expect(signals[0]?.aborted).toBe(true);
    expect(signals[1]?.aborted).toBe(false);
  });
});
