import type { MaybeRefOrGetter } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';
import { fetchCharacters } from '@/api/rickandmorty';

const STALE_TIME_MS = 1000 * 60 * 5;

export function useCharacters(page: MaybeRefOrGetter<number> = 1) {
  return useQuery({
    queryKey: computed(() => ['characters', toValue(page)]),
    queryFn: () => fetchCharacters(toValue(page)),
    staleTime: STALE_TIME_MS,
    retry: false,
  });
}
