import type { Character, CharactersResponse } from '@/types/api';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { API_BASE_URL, ApiError, ApiNotFoundError, fetchCharacter, fetchCharacters } from './rickandmorty';

const noRetry = { maxRetries: 0, retryDelayMs: 0 };

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

const mockCharactersResponse: CharactersResponse = {
  info: {
    count: 826,
    pages: 42,
    next: `${API_BASE_URL}/character/?page=2`,
    prev: null,
  },
  results: [mockCharacter],
};

function mockFetchResponse(body: unknown, init: ResponseInit = { status: 200 }) {
  return new Response(JSON.stringify(body), {
    status: init.status,
    statusText: init.statusText,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('fetchCharacters', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches the first page of characters', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockFetchResponse(mockCharactersResponse));

    const result = await fetchCharacters(1, noRetry);

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/character`);
    expect(result).toEqual(mockCharactersResponse);
  });

  it('fetches a specific page of characters', async () => {
    const pageTwoResponse: CharactersResponse = {
      ...mockCharactersResponse,
      info: {
        count: 826,
        pages: 42,
        next: `${API_BASE_URL}/character/?page=3`,
        prev: `${API_BASE_URL}/character`,
      },
    };
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockFetchResponse(pageTwoResponse));

    const result = await fetchCharacters(2, noRetry);

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/character?page=2`);
    expect(result).toEqual(pageTwoResponse);
  });

  it('fetches characters filtered by name', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockFetchResponse(mockCharactersResponse));

    const result = await fetchCharacters({ page: 1, name: 'Rick' }, noRetry);

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/character?name=Rick`);
    expect(result).toEqual(mockCharactersResponse);
  });

  it('fetches a filtered page of characters', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockFetchResponse(mockCharactersResponse));

    const result = await fetchCharacters({ page: 2, name: 'Rick' }, noRetry);

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/character?page=2&name=Rick`);
    expect(result).toEqual(mockCharactersResponse);
  });

  it('throws ApiError when the request fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockFetchResponse({ error: 'Server error' }, { status: 500, statusText: 'Internal Server Error' }),
    );

    const error = await fetchCharacters(1, noRetry).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 500,
      message: 'Server error',
    });
  });

  it('retries recoverable errors and succeeds', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        mockFetchResponse({ error: 'Server error' }, { status: 500, statusText: 'Internal Server Error' }),
      )
      .mockResolvedValueOnce(mockFetchResponse(mockCharactersResponse));

    const result = await fetchCharacters(1, { maxRetries: 1, retryDelayMs: 0 });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result).toEqual(mockCharactersResponse);
  });

  it('retries network errors and succeeds', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(mockFetchResponse(mockCharactersResponse));

    const result = await fetchCharacters(1, { maxRetries: 1, retryDelayMs: 0 });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result).toEqual(mockCharactersResponse);
  });

  it('throws after exhausting retries on persistent failures', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(() =>
        Promise.resolve(
          mockFetchResponse({ error: 'Server error' }, { status: 500, statusText: 'Internal Server Error' }),
        ),
      );

    const error = await fetchCharacters(1, { maxRetries: 2, retryDelayMs: 0 }).catch((caught: unknown) => caught);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 500,
      message: 'Server error',
    });
  });

  it('passes the abort signal to fetch', async () => {
    const controller = new AbortController();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockFetchResponse(mockCharactersResponse));

    await fetchCharacters(1, { ...noRetry, signal: controller.signal });

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/character`, { signal: controller.signal });
  });

  it('aborts an in-flight request when the signal is cancelled', async () => {
    const controller = new AbortController();
    vi.spyOn(globalThis, 'fetch').mockImplementation((_url, init) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('The operation was aborted.', 'AbortError'));
        });
      });
    });

    const request = fetchCharacters(1, { ...noRetry, signal: controller.signal });
    controller.abort();

    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('does not retry aborted requests', async () => {
    const controller = new AbortController();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((_url, init) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('The operation was aborted.', 'AbortError'));
        });
      });
    });

    const request = fetchCharacters(1, { maxRetries: 2, retryDelayMs: 0, signal: controller.signal });
    controller.abort();

    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('fetchCharacter', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches a single character by id', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockFetchResponse(mockCharacter));

    const result = await fetchCharacter(1, noRetry);

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/character/1`);
    expect(result).toEqual(mockCharacter);
  });

  it('throws ApiNotFoundError when the character does not exist', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(mockFetchResponse({ error: 'Character not found' }, { status: 404, statusText: 'Not Found' }));

    const error = await fetchCharacter(99999, noRetry).catch((caught: unknown) => caught);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(error).toBeInstanceOf(ApiNotFoundError);
    expect(error).toMatchObject({
      status: 404,
      message: 'Character not found',
    });
  });

  it('does not retry not-found errors', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(mockFetchResponse({ error: 'Character not found' }, { status: 404, statusText: 'Not Found' }));

    await fetchCharacter(99999, { maxRetries: 2, retryDelayMs: 0 }).catch(() => undefined);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws ApiError for other failed responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockFetchResponse({ error: 'Server error' }, { status: 500, statusText: 'Internal Server Error' }),
    );

    const error = await fetchCharacter(1, noRetry).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 500,
      message: 'Server error',
    });
  });

  it('retries recoverable errors and succeeds', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        mockFetchResponse({ error: 'Server error' }, { status: 500, statusText: 'Internal Server Error' }),
      )
      .mockResolvedValueOnce(mockFetchResponse(mockCharacter));

    const result = await fetchCharacter(1, { maxRetries: 1, retryDelayMs: 0 });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result).toEqual(mockCharacter);
  });

  it('throws after exhausting retries on persistent failures', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(() =>
        Promise.resolve(
          mockFetchResponse({ error: 'Server error' }, { status: 500, statusText: 'Internal Server Error' }),
        ),
      );

    const error = await fetchCharacter(1, { maxRetries: 2, retryDelayMs: 0 }).catch((caught: unknown) => caught);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 500,
      message: 'Server error',
    });
  });
});
