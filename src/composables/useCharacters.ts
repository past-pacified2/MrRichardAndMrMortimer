import type { MaybeRefOrGetter } from 'vue';
import { keepPreviousData, useQuery } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';
import { fetchCharacters } from '@/api/rickandmorty';

const STALE_TIME_MS = 1000 * 60 * 5;

export function useCharacters(
  page: MaybeRefOrGetter<number> = 1,
  name: MaybeRefOrGetter<string | undefined> = undefined,
) {
  return useQuery({
    queryKey: computed(() => ['characters', toValue(page), toValue(name) ?? '']),
    queryFn: () =>
      fetchCharacters({
        page: toValue(page),
        name: toValue(name),
      }),
    staleTime: STALE_TIME_MS,
    retry: false,
    placeholderData: keepPreviousData,
  });
}
