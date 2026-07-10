import type { ApiErrorResponse, Character, CharactersResponse } from '@/types/api';

export const API_BASE_URL = 'https://rickandmortyapi.com/api';

const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 300;

export interface FetchOptions {
  maxRetries?: number;
  retryDelayMs?: number;
}

export class ApiNotFoundError extends Error {
  readonly status = 404;

  constructor(message: string) {
    super(message);
    this.name = 'ApiNotFoundError';
  }
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function isRecoverableError(error: unknown): boolean {
  if (error instanceof ApiNotFoundError) {
    return false;
  }

  if (error instanceof ApiError) {
    return error.status >= 500;
  }

  return true;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return response.json() as Promise<T>;
  }

  let message = response.statusText;

  try {
    const body = (await response.json()) as ApiErrorResponse;
    message = body.error;
  } catch {
    // response body was not JSON
  }

  if (response.status === 404) {
    throw new ApiNotFoundError(message);
  }

  throw new ApiError(response.status, message);
}

async function fetchWithRetry<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      return await handleResponse<T>(response);
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;

      if (isLastAttempt || !isRecoverableError(error)) {
        throw error;
      }

      await sleep(retryDelayMs * (attempt + 1));
    }
  }

  throw new Error('Unreachable');
}

export async function fetchCharacters(options?: FetchOptions): Promise<CharactersResponse> {
  return fetchWithRetry<CharactersResponse>(`${API_BASE_URL}/character`, options);
}

export async function fetchCharacter(id: number, options?: FetchOptions): Promise<Character> {
  return fetchWithRetry<Character>(`${API_BASE_URL}/character/${id}`, options);
}
