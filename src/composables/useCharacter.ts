import type { MaybeRefOrGetter } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';
import { fetchCharacter } from '@/api/rickandmorty';

const STALE_TIME_MS = 1000 * 60 * 5;

export function parseCharacterId(id: string | number): number | null {
  const parsed = typeof id === 'number' ? id : Number.parseInt(id, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function useCharacter(id: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: computed(() => ['character', toValue(id)]),
    queryFn: () => fetchCharacter(toValue(id)),
    staleTime: STALE_TIME_MS,
    retry: false,
  });
}
