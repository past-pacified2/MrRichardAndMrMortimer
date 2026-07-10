# Technical Overview

## Architecture

The app is structured in four distinct layers:

1. **`src/api/`** - pure TypeScript functions that talk to the Rick and Morty API. No Vue, no state, just typed `fetch` wrappers. This makes them trivially testable in isolation.
2. **`src/composables/`** - Vue composables that wrap TanStack Query hooks. Components never call the API layer directly.
3. **`src/views/`** - page-level components, one per route. Responsible for layout and orchestration only.
4. **`src/components/`** - reusable presentational components. Stateless where possible, receiving data via props.

## Key Decisions

| Decision                  | Choice                                                       | ADR                                                 |
| ------------------------- | ------------------------------------------------------------ | --------------------------------------------------- |
| State management          | Composables only, no Pinia                                   | [ADR-0001](./adr/0001-state-management.md)          |
| Data fetching and caching | TanStack Query                                               | [ADR-0002](./adr/0002-data-fetching-and-caching.md) |
| Testing strategy          | Vitest + Playwright + axe-core                               | [ADR-0003](./adr/0003-testing-strategy.md)          |
| Styling                   | TailwindCSS v4, no component library                         | [ADR-0004](./adr/0004-styling-approach.md)          |
| Routing                   | Vue Router 4, typed route names                              | [ADR-0005](./adr/0005-routing-strategy.md)          |
| Security                  | Locked dependency versions, known production gaps documented | [ADR-0006](./adr/0006-security.md)                  |

## Local Development

See [`README.md`](../README.md) for setup and available scripts.

Node version is pinned in `.nvmrc`. Run `nvm use` before installing.

## Testing Approach

- **Unit tests** (Vitest) - API layer functions, composable logic, cache behaviour
- **Component tests** (Vitest + Vue Test Utils) - rendering, props, emits
- **E2E tests** (Playwright) - full user flows against the production build
- **A11y tests** (Playwright + axe-core) - automated WCAG AA audit on both pages

## A11y and Performance

Lighthouse audits were run manually against the production build on both pages. Results are in [`docs/lighthouse/`](./lighthouse/).

axe-core is integrated directly into the Playwright E2E suite and runs as part of `npm run test:e2e`.

## Known Tradeoffs

- **No SSR** - a read-heavy public API like Rick and Morty would benefit from SSR or SSG for initial load performance, but that is out of scope for now.
- **localStorage persistence** - TanStack Query's persist plugin writes the full cache to localStorage. For a larger dataset this could be revisited with IndexedDB.
- **No authentication** - the Rick and Morty API is public, so auth is not addressed.
- **axe-core coverage** - automated a11y tooling catches roughly 50% of WCAG issues. Manual keyboard and screen reader testing would be the next step in a production context.
- **Further automation** - Some automated tests should be run in GitHub Actions instead of local, for example Lighthouse is better suited there. Also builds and pushes to different environments are not handled now.
