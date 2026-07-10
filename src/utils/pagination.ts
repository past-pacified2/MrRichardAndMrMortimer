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

export function buildPageQuery(page: number): Record<string, string> {
  return page > 1 ? { page: String(page) } : {};
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

    if (index > 0 && page - sortedPages[index - 1]! > 1) {
      items.push({ type: 'ellipsis' });
    }

    items.push({ type: 'page', page });
  }

  return items;
}
