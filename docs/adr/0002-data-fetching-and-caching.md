# ADR-0002: Data Fetching and Caching

## Status

Accepted

## Context

The Rick and Morty API is paginated REST. The app needs:

- Paginated list fetching with no flicker between pages
- Single character detail fetching
- Cache that avoids redundant network requests during a session

Options considered for the API client:

- **[rick-and-morty-api-node](https://github.com/afuh/rick-and-morty-api-node)** - the official JS client for the API. Rejected: it wraps a straightforward REST API and would introduce an abstraction layer over something that doesn't need one. A typed `fetch` wrapper gives full control with no additional dependency.
- **Raw `fetch`** - chosen. The API is simple enough that a thin typed wrapper is all that's needed.

Options considered for caching:

- **Hand-rolled Pinia store** - `Map<page, Character[]>` cache, manual TTL with localStorage
- **TanStack Query** - `@tanstack/vue-query` with optional persist plugin

## Decision

Use TanStack Query (`@tanstack/vue-query`) for in-memory session caching. The persist
plugin was considered for refresh survival but is not wired up in `main.ts` at this stage.

```ts
// composables/useCharacters.ts
return useQuery({
  queryKey: computed(() => ['characters', toValue(page), toValue(name) ?? '']),
  queryFn: () =>
    fetchCharacters({
      page: toValue(page),
      name: toValue(name),
    }),
  staleTime: STALE_TIME_MS,
  placeholderData: keepPreviousData,
});
```

`keepPreviousData` means the previous page stays visible while the next one loads -
no flicker, no empty state flash between pagination steps.

The detail page reads from the same cache automatically. If a character was already
fetched as part of a list page, the detail loads instantly with no additional request.

Prefetching on hover is implemented via `queryClient.prefetchQuery` on `CharacterCard`
mouse enter - making the detail page feel instant even on first visit.

## Consequences

**Gained:**

- Automatic request deduplication
- `staleTime` and `gcTime` replace manual TTL logic
- `keepPreviousData` eliminates pagination flicker
- Prefetch on hover for instant detail navigation

**Traded off:**

- Cache does not survive a full page refresh without the persist plugin
- Less fine-grained control over cache writes compared to a hand-rolled store
- Additional dependency (~13kb gzipped total)
- Acceptable: the API is entirely read-only, no mutations to coordinate
