# Rick & Morty SPA

Vue 3 single-page application built against the [Rick and Morty API](https://rickandmortyapi.com/).

## Stack

- Vue 3 + TypeScript
- Vite
- Vue Router 4
- TanStack Query
- TailwindCSS
- VueUse
- Vitest + Playwright (+ axe-core for a11y)

## Stack

- Vue 3 + TypeScript
- Vite
- Vue Router 4
- TanStack Query
- TailwindCSS
- VueUse
- Vitest + Playwright (+ axe-core for a11y)

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Command                      | Description                                      |
| ---------------------------- | ------------------------------------------------ |
| `npm run dev`                | Start dev server at `localhost:5173`             |
| `npm run build`              | Type-check and build for production              |
| `npm run preview`            | Preview production build locally                 |
| `npm run lint`               | Lint all files                                   |
| `npm run lint:fix`           | Lint and auto-fix                                |
| `npm run format`             | Format all files with Prettier                   |
| `npm run format:check`       | Check formatting without writing                 |
| `npm run test:unit`          | Run unit tests once                              |
| `npm run test:unit:watch`    | Run unit tests in watch mode                     |
| `npm run test:unit:coverage` | Run unit tests with coverage report              |
| `npm run test:e2e`           | Run Playwright E2E + a11y tests (requires build) |
| `npm run test:e2e:ui`        | Open Playwright UI runner                        |
| `npm run check`              | Lint + format check + unit tests + build         |

## Docs

- [`docs/TECHNICAL.md`](./docs/TECHNICAL.md) — architecture overview
- [`docs/adr/`](./docs/adr/) — architecture decision records
