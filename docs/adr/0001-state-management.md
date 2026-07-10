# ADR-0001: State Management

## Status

Accepted

## Context

The app needs shared state for UI concerns (current page, name filter) and async state
(loading, error, data) for API calls. Options considered:

- **Pinia** - the standard Vue 3 store solution
- **Plain composables** - shared refs defined at module scope
- **URL query params** - page and filter synced to the address bar
- **TanStack Query** - manages all async state internally

## Decision

No Pinia. Use URL query params for list UI state and TanStack Query for all async state.

Pagination and name filter state live in the URL (`?page=&name=`) so views are bookmarkable
and back/forward navigation works naturally. `CharactersGrid` reads and writes query params
via the router; `useCharacterNameFilter` handles debounced input before values are synced.

```ts
// CharactersGrid reads list state from the route
const currentPage = computed(() => parsePageQuery(route.query.page));
const nameFilter = computed(() => parseNameQuery(route.query.name));
const { filterInput, debouncedInput } = useCharacterNameFilter(initialName);
```

TanStack Query owns loading, error, and data states entirely - leaving nothing meaningful
for Pinia to manage.

## Consequences

**Gained:**

- One fewer dependency
- No boilerplate (no `defineStore`, no actions, no getters)
- Shareable, refresh-safe list URLs
- State logic lives next to the composables and components that use it

**Traded off:**

- No Pinia devtools for inspecting UI state (TanStack Query devtools still available for async state)
- If the app grows significantly in complexity, migrating to Pinia later is straightforward
