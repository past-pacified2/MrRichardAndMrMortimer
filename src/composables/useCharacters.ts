import { useQuery } from '@tanstack/vue-query';
import { fetchCharacters } from '@/api/rickandmorty';

const STALE_TIME_MS = 1000 * 60 * 5;

export function useCharacters() {
  return useQuery({
    queryKey: ['characters'],
    queryFn: () => fetchCharacters(),
    staleTime: STALE_TIME_MS,
    retry: false,
  });
}
