import { describe, expect, it } from 'vitest';
import { buildPageQuery, buildPaginationItems, parseNameQuery, parsePageQuery } from './pagination';

describe('parsePageQuery', () => {
  it('returns 1 for missing or invalid values', () => {
    expect(parsePageQuery(undefined)).toBe(1);
    expect(parsePageQuery('')).toBe(1);
    expect(parsePageQuery('abc')).toBe(1);
    expect(parsePageQuery('0')).toBe(1);
    expect(parsePageQuery('-2')).toBe(1);
  });

  it('parses valid page numbers', () => {
    expect(parsePageQuery('1')).toBe(1);
    expect(parsePageQuery('3')).toBe(3);
    expect(parsePageQuery(5)).toBe(5);
  });
});

describe('buildPageQuery', () => {
  it('omits page 1 from the query', () => {
    expect(buildPageQuery(1)).toEqual({});
  });

  it('includes page numbers greater than 1', () => {
    expect(buildPageQuery(3)).toEqual({ page: '3' });
  });

  it('includes a name filter when provided', () => {
    expect(buildPageQuery(1, 'Rick')).toEqual({ name: 'Rick' });
  });

  it('includes page and name together', () => {
    expect(buildPageQuery(2, 'Rick')).toEqual({ page: '2', name: 'Rick' });
  });
});

describe('parseNameQuery', () => {
  it('returns undefined for missing or short values', () => {
    expect(parseNameQuery(undefined)).toBeUndefined();
    expect(parseNameQuery('')).toBeUndefined();
    expect(parseNameQuery('Ri')).toBeUndefined();
  });

  it('returns a trimmed name when long enough', () => {
    expect(parseNameQuery('  Rick  ')).toBe('Rick');
  });
});

describe('buildPaginationItems', () => {
  it('returns an empty list when there are no pages', () => {
    expect(buildPaginationItems(1, 0)).toEqual([]);
  });

  it('shows adjacent pages near the start', () => {
    expect(buildPaginationItems(2, 42)).toEqual([
      { type: 'page', page: 1 },
      { type: 'page', page: 2 },
      { type: 'page', page: 3 },
      { type: 'ellipsis' },
      { type: 'page', page: 42 },
    ]);
  });

  it('shows the current window with ellipses in the middle', () => {
    expect(buildPaginationItems(21, 42)).toEqual([
      { type: 'page', page: 1 },
      { type: 'ellipsis' },
      { type: 'page', page: 20 },
      { type: 'page', page: 21 },
      { type: 'page', page: 22 },
      { type: 'ellipsis' },
      { type: 'page', page: 42 },
    ]);
  });

  it('shows adjacent pages near the end', () => {
    expect(buildPaginationItems(41, 42)).toEqual([
      { type: 'page', page: 1 },
      { type: 'ellipsis' },
      { type: 'page', page: 40 },
      { type: 'page', page: 41 },
      { type: 'page', page: 42 },
    ]);
  });
});
