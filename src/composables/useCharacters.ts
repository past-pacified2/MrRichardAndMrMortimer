import type { MaybeRefOrGetter } from 'vue';
import { keepPreviousData, useQuery } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';
import { ApiNotFoundError, fetchCharacters } from '@/api/rickandmorty';
import { emptyCharactersResponse } from '@/test/fixtures/character';

const STALE_TIME_MS = 1000 * 60 * 5;

export function useCharacters(
  page: MaybeRefOrGetter<number> = 1,
  name: MaybeRefOrGetter<string | undefined> = undefined,
) {
  return useQuery({
    queryKey: computed(() => ['characters', toValue(page), toValue(name) ?? '']),
    queryFn: async ({ signal }) => {
      const pageValue = toValue(page);
      const nameValue = toValue(name);

      try {
        return await fetchCharacters(
          {
            page: pageValue,
            name: nameValue,
          },
          { signal },
        );
      } catch (error) {
        if (error instanceof ApiNotFoundError && nameValue) {
          return emptyCharactersResponse;
        }

        throw error;
      }
    },
    staleTime: STALE_TIME_MS,
    retry: false,
    placeholderData: keepPreviousData,
  });
}
