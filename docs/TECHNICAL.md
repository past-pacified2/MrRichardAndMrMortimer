# Technical Overview

## Architecture

The app is structured in distinct layers:

1. **`src/api/`** - pure TypeScript functions that talk to the Rick and Morty API. No Vue, no state, just typed `fetch` wrappers. This makes them trivially testable in isolation.
2. **`src/composables/`** - Vue composables that wrap TanStack Query hooks. Components never call the API layer directly.
3. **`src/views/`** - page-level components, one per route. Responsible for layout and orchestration only.
4. **`src/components/`** - reusable presentational components. Stateless where possible, receiving data via props. Shared pieces such as `ErrorState` live at the root of this folder.
5. **`src/seo/`** - client-side meta tags, canonical URLs, and JSON-LD management.
6. **`src/utils/`** - pagination query helpers, character status styling, and other pure utilities.
7. **`src/test/fixtures/`** - shared mock data for unit and component tests.

List pagination and name filter state are synced to URL query params (`?page=&name=`),
not stored in Pinia or module-scoped refs.

## Key Decisions

| Decision                  | Choice                                                       | ADR                                                 |
| ------------------------- | ------------------------------------------------------------ | --------------------------------------------------- |
| State management          | URL query params + composables, no Pinia                     | [ADR-0001](./adr/0001-state-management.md)          |
| Data fetching and caching | TanStack Query (in-memory session cache)                     | [ADR-0002](./adr/0002-data-fetching-and-caching.md) |
| Testing strategy          | Vitest + Playwright + `@axe-core/playwright`                 | [ADR-0003](./adr/0003-testing-strategy.md)          |
| Styling                   | TailwindCSS v4, no component library                         | [ADR-0004](./adr/0004-styling-approach.md)          |
| Routing                   | Vue Router 4, typed route names                              | [ADR-0005](./adr/0005-routing-strategy.md)          |
| Security                  | Locked dependency versions, known production gaps documented | [ADR-0006](./adr/0006-security.md)                  |

## Local Development

See [`README.md`](../README.md) for setup and available scripts.

Node version is pinned in `.nvmrc`. Run `nvm use` before installing.

ESLint (`@antfu/eslint-config`) and Prettier run on commit via lint-staged. Semicolons
are required; Prettier handles class ordering and most formatting.

## Testing Approach

- **Unit tests** (Vitest) - API layer, composables, utilities, SEO helpers
- **Component tests** (Vitest + Vue Test Utils) - rendering, props, emits
- **E2E tests** (Playwright) - navigation, filtering, error recovery, error pages
- **A11y tests** (`@axe-core/playwright`) - WCAG AA audits on all key routes and states

Run a11y only with `npm run test:a11y`. Full E2E (including a11y) runs via `npm run test:e2e`.

## A11y and Performance

axe-core runs inside Playwright via `@axe-core/playwright` as part of the E2E suite.

Lighthouse can be run manually via Chrome DevTools against the production build. Results
are not committed to the repo.

## Known Tradeoffs

- **No SSR** - a read-heavy public API like Rick and Morty would benefit from SSR or SSG for initial load performance, but that is out of scope for now.
- **No cache persistence** - TanStack Query's persist plugin is not configured; cache is in-memory for the session only.
- **No authentication** - the Rick and Morty API is public, so auth is not addressed.
- **Limited error boundary** - `onErrorCaptured` in `App.vue` handles render-tree crashes in production only; async errors outside Vue's lifecycle are not caught.
- **axe-core coverage** - automated a11y tooling catches roughly 50% of WCAG issues. Manual keyboard and screen reader testing would be the next step in a production context.
- **Further automation** - CI (GitHub Actions), Lighthouse CI, and environment deployments are not configured yet.
