import type { CharacterStatus } from '@/types/api';

export const characterStatusClasses: Record<CharacterStatus, string> = {
  Alive: 'bg-green-500/15 text-green-800 dark:text-green-400',
  Dead: 'bg-red-500/15 text-red-800 dark:text-red-400',
  unknown: 'bg-violet-500/15 text-violet-800 dark:text-violet-400',
};

export function getCharacterStatusClass(status: CharacterStatus): string {
  return characterStatusClasses[status];
}
