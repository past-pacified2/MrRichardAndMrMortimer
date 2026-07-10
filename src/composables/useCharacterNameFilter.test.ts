import { flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parseNameQuery } from '@/utils/pagination';
import { renderComposable } from './test/renderComposable';
import {
  CHARACTER_NAME_FILTER_DEBOUNCE_MS,
  CHARACTER_NAME_FILTER_MIN_LENGTH,
  useCharacterNameFilter,
} from './useCharacterNameFilter';

describe('useCharacterNameFilter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes the input from a provided value', () => {
    const { result } = renderComposable(() => useCharacterNameFilter('Rick'));

    expect(result.filterInput.value).toBe('Rick');
  });

  it('debounces input updates', async () => {
    const { result } = renderComposable(() => useCharacterNameFilter());

    result.filterInput.value = 'Rick';
    expect(result.debouncedInput.value).toBe('');

    await vi.advanceTimersByTimeAsync(CHARACTER_NAME_FILTER_DEBOUNCE_MS);
    await flushPromises();

    expect(result.debouncedInput.value).toBe('Rick');
  });

  it('waits for typing to pause before updating the debounced value', async () => {
    const { result } = renderComposable(() => useCharacterNameFilter());

    result.filterInput.value = 'R';
    await vi.advanceTimersByTimeAsync(100);
    result.filterInput.value = 'Ri';
    await vi.advanceTimersByTimeAsync(100);
    result.filterInput.value = 'Rick';
    await vi.advanceTimersByTimeAsync(CHARACTER_NAME_FILTER_DEBOUNCE_MS - 1);
    await flushPromises();

    expect(result.debouncedInput.value).toBe('');

    await vi.advanceTimersByTimeAsync(1);
    await flushPromises();

    expect(result.debouncedInput.value).toBe('Rick');
  });

  it(`parses names with at least ${CHARACTER_NAME_FILTER_MIN_LENGTH} characters`, () => {
    expect(parseNameQuery('Ri')).toBeUndefined();
    expect(parseNameQuery('Rick')).toBe('Rick');
    expect(parseNameQuery('  Rick  ')).toBe('Rick');
  });
});
