import type { QueryClient } from '@tanstack/vue-query';
import type { MaybeRefOrGetter } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';
import { fetchCharacter } from '@/api/rickandmorty';

const STALE_TIME_MS = 1000 * 60 * 5;
export const CHARACTER_PREFETCH_HOVER_MS = 450;

export function getCharacterQueryKey(id: number) {
  return ['character', id] as const;
}

export function characterQueryOptions(id: number) {
  return {
    queryKey: getCharacterQueryKey(id),
    queryFn: () => fetchCharacter(id),
    staleTime: STALE_TIME_MS,
    retry: false,
  };
}

export function prefetchCharacter(queryClient: QueryClient, id: number) {
  return queryClient.prefetchQuery(characterQueryOptions(id));
}

export function parseCharacterId(id: string | number): number | null {
  const parsed = typeof id === 'number' ? id : Number.parseInt(id, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function useCharacter(id: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: computed(() => getCharacterQueryKey(toValue(id))),
    queryFn: () => fetchCharacter(toValue(id)),
    staleTime: STALE_TIME_MS,
    retry: false,
  });
}
