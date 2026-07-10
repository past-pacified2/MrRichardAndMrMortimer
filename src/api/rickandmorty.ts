import type { ApiErrorResponse, Character, CharactersResponse } from '@/types/api';

export const API_BASE_URL = 'https://rickandmortyapi.com/api';

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

export async function fetchCharacters(): Promise<CharactersResponse> {
  const response = await fetch(`${API_BASE_URL}/character`);
  return handleResponse<CharactersResponse>(response);
}

export async function fetchCharacter(id: number): Promise<Character> {
  const response = await fetch(`${API_BASE_URL}/character/${id}`);
  return handleResponse<Character>(response);
}
