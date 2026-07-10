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
- Cache and filter composable logic
- Async state transitions

**What is component tested:**

- `CharacterCard` - renders correct name, status, species from props
- `ErrorState` - displays message and emits retry
- `LoadingState` - renders skeleton UI

**What is not tested and why:**

- Views - too coupled to routing and query context; covered by E2E instead
- Tailwind output - visual correctness is not a unit test concern

### E2E tests - Playwright

Playwright runs against the production build via `vite preview`, which means tests
exercise the real bundle, not a dev server approximation.

**Two core flows tested:**

1. Land on homepage → character cards appear → click a card → detail page loads correctly
2. Simulate network error → error state is shown → retry button recovers the page

### A11y - axe-core via axe-playwright

Integrated directly into the Playwright suite. No extra tooling or server required.
Runs as part of `npm run test:e2e` and audits both pages against WCAG AA.

axe-core catches approximately 50% of accessibility issues automatically. Manual
keyboard navigation and screen reader testing would be the next step in a production context.

### Lighthouse

Run manually via Chrome DevTools against the production build. Screenshots of both
page reports are stored in `docs/lighthouse/`. Automating Lighthouse CI was considered
but deemed overkill for a now.

## Consequences

**Gained:**

- Fast feedback loop: unit tests run in milliseconds, E2E on push only
- A11y is a hard gate in the test suite, not an afterthought
- Minimal tooling surface - Vitest and Playwright cover all three layers

**Traded off:**

- No 100% coverage target
- Lighthouse is not automated locally; scores could drift undetected between runs
