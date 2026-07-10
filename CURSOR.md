# Cursor Guide

## Project context

Vue 3 SPA consuming the [Rick and Morty API](https://rickandmortyapi.com/).
See `docs/TECHNICAL.md` for architecture overview and `docs/adr/` for all decisions.

## Stack

- Vue 3 + TypeScript + Vite
- Vue Router 4 (named routes)
- TanStack Query (data fetching, caching, persistence)
- TailwindCSS v4 (no component library)
- VueUse
- Vitest + Playwright + axe-core

## Key conventions

### File structure

- `src/api/` — pure fetch functions, no Vue imports, no state
- `src/composables/` — wrap TanStack Query hooks, one file per concern
- `src/views/` — one file per route, orchestration only
- `src/components/` — presentational, stateless where possible
- `src/types/` — shared TypeScript types, API response shapes

### TypeScript

- Strict mode is on — no `any`, no non-null assertions without a comment explaining why
- All API responses are typed via `src/types/api.ts`
- Use `type` imports everywhere (`import type { Character } from '@/types/api'`)

### Async state

- Never use loose `isLoading` / `isError` booleans
- All async state goes through TanStack Query — do not hand-roll fetch logic
- Error states are handled locally with retry UI, not redirected to `/500`
- Only unrecoverable errors (component crashes) redirect to `/500`

### Styling

- TailwindCSS utility classes only — no custom CSS unless absolutely necessary
- Base styles live in `src/style.css` under `@layer base`
- No inline styles

### Routing

- Always use named routes (`router.push({ name: 'character', params: { id } })`)
- Never hardcode path strings in components
- Unknown character IDs from the API redirect to `not-found`, not `error`

## Running the project

```bash
nvm use
npm install
npm run dev
```

## Testing

```bash
npm run test:unit          # vitest unit tests
npm run test:e2e           # playwright e2e + a11y (requires build)
npm run check              # lint + format + unit + build
```

## Before committing

Husky runs automatically:

- `pre-commit` — lint-staged (eslint + prettier on staged files)
- `commit-msg` — commitlint (conventional commits enforced)
- `pre-push` — unit tests

Commit message format: `type: description` where type is one of:
`feat` `fix` `chore` `docs` `test` `refactor` `style`
