import { refDebounced } from '@vueuse/core';
import { ref } from 'vue';

export const CHARACTER_NAME_FILTER_MIN_LENGTH = 3;
export const CHARACTER_NAME_FILTER_DEBOUNCE_MS = 300;

export function useCharacterNameFilter(initialValue = '') {
  const filterInput = ref(initialValue);
  const debouncedInput = refDebounced(filterInput, CHARACTER_NAME_FILTER_DEBOUNCE_MS);

  return {
    filterInput,
    debouncedInput,
  };
}
