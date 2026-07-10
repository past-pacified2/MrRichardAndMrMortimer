# ADR-0001: State Management

## Status

Accepted

## Context

The app needs shared state for UI concerns (current page, name filter) and async state
(loading, error, data) for API calls. Options considered:

- **Pinia** - the standard Vue 3 store solution
- **Plain composables** - shared refs defined at module scope
- **TanStack Query** - manages all async state internally

## Decision

No Pinia. Use plain composables for UI state and TanStack Query for all async state.

UI state (page number, search filter) is simple enough to live in a composable with
module-scoped refs, which behave as singletons across the app without any store overhead:

```ts
// composables/useCharacterFilters.ts
const page = ref(1);
const nameFilter = ref('');

export function useCharacterFilters() {
  return { page, nameFilter };
}
```

TanStack Query owns loading, error, and data states entirely - leaving nothing meaningful
for Pinia to manage.

## Consequences

**Gained:**

- One fewer dependency
- No boilerplate (no `defineStore`, no actions, no getters)
- State logic lives next to the composables that use it

**Traded off:**

- No Pinia devtools for inspecting UI state (TanStack Query devtools still available for async state)
- If the app grows significantly in complexity, migrating to Pinia later is straightforward
