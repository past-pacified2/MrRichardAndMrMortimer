import type { CharactersResponse } from '@/types/api';
import { flushPromises } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { ApiError, ApiNotFoundError } from '@/api/rickandmorty';
import { renderComposable } from './test/renderComposable';
import { useCharacters } from './useCharacters';

vi.mock('@/api/rickandmorty', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/rickandmorty')>();
  return {
    ...actual,
    fetchCharacters: vi.fn(),
  };
});

const { fetchCharacters } = await import('@/api/rickandmorty');

const mockCharactersResponse: CharactersResponse = {
  info: {
    count: 826,
    pages: 42,
    next: 'https://rickandmortyapi.com/api/character/?page=2',
    prev: null,
  },
  results: [
    {
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
    },
  ],
};

describe('useCharacters', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('loads the first page of characters', async () => {
    vi.mocked(fetchCharacters).mockResolvedValue(mockCharactersResponse);

    const { result } = renderComposable(() => useCharacters());

    await flushPromises();

    expect(fetchCharacters).toHaveBeenCalledWith({ page: 1 }, { signal: expect.any(AbortSignal) });
    expect(result.isSuccess.value).toBe(true);
    expect(result.data.value).toEqual(mockCharactersResponse);
  });

  it('loads a specific page of characters', async () => {
    vi.mocked(fetchCharacters).mockResolvedValue(mockCharactersResponse);

    const { result } = renderComposable(() => useCharacters(2));

    await flushPromises();

    expect(fetchCharacters).toHaveBeenCalledWith({ page: 2 }, { signal: expect.any(AbortSignal) });
    expect(result.isSuccess.value).toBe(true);
  });

  it('loads characters filtered by name', async () => {
    vi.mocked(fetchCharacters).mockResolvedValue(mockCharactersResponse);

    const { result } = renderComposable(() => useCharacters(1, 'Rick'));

    await flushPromises();

    expect(fetchCharacters).toHaveBeenCalledWith({ page: 1, name: 'Rick' }, { signal: expect.any(AbortSignal) });
    expect(result.isSuccess.value).toBe(true);
  });

  it('enters an error state when fetching fails', async () => {
    const apiError = new ApiError(500, 'Server error');
    vi.mocked(fetchCharacters).mockRejectedValue(apiError);

    const { result } = renderComposable(() => useCharacters());

    await flushPromises();

    expect(result.isError.value).toBe(true);
    expect(result.error.value).toBe(apiError);
  });

  it('can refetch after an error', async () => {
    const apiError = new ApiError(500, 'Server error');
    vi.mocked(fetchCharacters).mockRejectedValueOnce(apiError).mockResolvedValueOnce(mockCharactersResponse);

    const { result } = renderComposable(() => useCharacters());

    await flushPromises();
    expect(result.isError.value).toBe(true);

    await result.refetch();
    await flushPromises();

    expect(fetchCharacters).toHaveBeenCalledTimes(2);
    expect(result.isSuccess.value).toBe(true);
    expect(result.data.value).toEqual(mockCharactersResponse);
  });

  it('aborts the previous request when the page changes', async () => {
    const signals: AbortSignal[] = [];

    vi.mocked(fetchCharacters).mockImplementation((_params, options) => {
      if (options?.signal) {
        signals.push(options.signal);
      }

      return new Promise(() => {});
    });

    const page = ref(1);
    renderComposable(() => useCharacters(page));

    await flushPromises();

    page.value = 2;
    await flushPromises();

    expect(signals).toHaveLength(2);
    expect(signals[0]?.aborted).toBe(true);
    expect(signals[1]?.aborted).toBe(false);
  });

  it('returns an empty result set when a name filter matches nothing', async () => {
    vi.mocked(fetchCharacters).mockRejectedValue(new ApiNotFoundError('There is nothing here'));

    const { result } = renderComposable(() => useCharacters(1, 'sadfasdfsdf'));

    await flushPromises();

    expect(result.isSuccess.value).toBe(true);
    expect(result.isError.value).toBe(false);
    expect(result.data.value?.results).toEqual([]);
  });
});
