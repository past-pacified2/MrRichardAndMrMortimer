import { CHARACTER_NAME_FILTER_MIN_LENGTH } from '@/composables/useCharacterNameFilter';

export function parsePageQuery(value: unknown): number {
  if (typeof value === 'string' && /^\d+$/.test(value)) {
    const page = Number.parseInt(value, 10);
    return page >= 1 ? page : 1;
  }

  if (typeof value === 'number' && Number.isInteger(value) && value >= 1) {
    return value;
  }

  return 1;
}

export function parseNameQuery(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length >= CHARACTER_NAME_FILTER_MIN_LENGTH ? trimmed : undefined;
}

export function buildPageQuery(page: number, name?: string): Record<string, string> {
  const query: Record<string, string> = {};

  if (page > 1) {
    query.page = String(page);
  }

  if (name) {
    query.name = name;
  }

  return query;
}

export type PaginationItem = { type: 'page'; page: number } | { type: 'ellipsis' };

export function buildPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 0) {
    return [];
  }

  const pages = new Set<number>([1, totalPages]);

  for (let page = currentPage - 1; page <= currentPage + 1; page++) {
    if (page >= 1 && page <= totalPages) {
      pages.add(page);
    }
  }

  const sortedPages = [...pages].sort((a, b) => a - b);
  const items: PaginationItem[] = [];

  for (let index = 0; index < sortedPages.length; index++) {
    const page = sortedPages[index];

    // Non-null assertion is safe: guarded by `index > 0`, so `index - 1` is always a valid in-bounds index.
    if (index > 0 && page - sortedPages[index - 1]! > 1) {
      items.push({ type: 'ellipsis' });
    }

    items.push({ type: 'page', page });
  }

  return items;
}
