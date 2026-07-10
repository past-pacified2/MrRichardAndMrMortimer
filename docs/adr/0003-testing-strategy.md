# ADR-0003: Testing Strategy

## Status

Accepted

## Context

The project requires unit tests, component tests, E2E tests, and accessibility auditing.
Choices were made around tooling, scope, and what not to test.

## Decision

### Unit and component tests - Vitest + Vue Test Utils

Vitest is the natural choice: same config as Vite, near-zero setup, Jest-compatible API.
No separate Jest config or Babel transform needed.

**What is unit tested:**

- API layer functions (`src/api/rickandmorty.ts`) with mocked `fetch`
- Composable logic (`useCharacters`, `useCharacter`, `useCharacterNameFilter`)
- Utility helpers (`src/utils/pagination.ts`, `src/utils/characterStatus.ts`)
- SEO builders and DOM meta application (`src/seo/`)

**What is component tested:**

- `CharacterCard` - renders correct name, status, species from props
- `ErrorState` (`src/components/ErrorState.vue`) - displays message and emits retry
- `LoadingState` - renders skeleton UI
- Grid, detail, pagination, and error page shells

Shared mock data lives in `src/test/fixtures/character.ts`.

**What is not tested and why:**

- Most views - too coupled to routing and query context; covered by E2E instead
- `App.vue` - only the production error boundary behaviour is unit tested
- Tailwind output - visual correctness is not a unit test concern

### E2E tests - Playwright

Playwright runs against the production build via `vite preview`, which means tests
exercise the real bundle, not a dev server approximation.

**Flows covered across five spec files:**

1. Navigation - home → detail, back navigation, pagination via URL
2. Name filter - debounced filter synced to URL, combined with pagination
3. Error recovery - list fetch failure → retry → recovery
4. Error pages - 404 routes, invalid character IDs, 500 page and SEO meta
5. Accessibility - WCAG AA axe audits (see below)

### A11y - `@axe-core/playwright`

Integrated directly into the Playwright suite via `AxeBuilder`. No separate wrapper
package is required. Runs as part of `npm run test:e2e` (all specs) or `npm run test:a11y`
(a11y spec only).

Audits cover the homepage, filtered homepage, character detail, 404, 500, and API-driven
character-not-found states against WCAG AA.

axe-core catches approximately 50% of accessibility issues automatically. Manual
keyboard navigation and screen reader testing would be the next step in a production context.

### Lighthouse

Run manually via Chrome DevTools against the production build. Automating Lighthouse CI
was considered but deemed overkill for now. No committed report folder is maintained
in the repo at this stage.

## Consequences

**Gained:**

- Fast feedback loop: unit tests run in milliseconds, E2E on push only
- A11y is a hard gate in the test suite, not an afterthought
- Minimal tooling surface - Vitest and Playwright cover all three layers

**Traded off:**

- No 100% coverage target
- Lighthouse is not automated locally; scores could drift undetected between runs
