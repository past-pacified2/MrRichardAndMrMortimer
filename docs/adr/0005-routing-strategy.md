# ADR-0005: Routing Strategy

## Status

Accepted

## Context

The app has two functional routes (home, character detail) plus error handling routes.
Vue Router 4 is the standard choice for Vue 3 SPAs. Decisions were made around
history mode, route naming, and error route behaviour.

## Decision

Vue Router 4 with `createWebHistory` and named routes throughout.

### Routes

| Path               | Name          | View              | Notes                                     |
| ------------------ | ------------- | ----------------- | ----------------------------------------- |
| `/`                | `home`        | `HomeView`        | Character list with pagination and search |
| `/character/:id`   | `character`   | `CharacterView`   | Character detail                          |
| `/character`       | -             | -                 | Redirects to `/` (incomplete URL)         |
| `/500`             | `fatal-error` | `FatalErrorView`  | Unrecoverable application errors          |
| `/:pathMatch(.*)*` | `not-found`   | `FourhOhFourView` | Unknown routes                            |

### Error routing

`/500` is not a URL users navigate to directly in normal use - it represents an
application error state. Navigation there is triggered programmatically via
`router.replace({ name: 'fatal-error', state: { message } })`.

`FatalErrorView` reads the optional message from `window.history.state`. API fetch
errors are handled locally with retry UI and do not redirect to `/500`.

A global `onErrorCaptured` hook in `App.vue` (via `useFatalErrorBoundary`) catches
unhandled render, lifecycle, and watcher errors from routed views and redirects to
`fatal-error` in production builds. In development the error is logged and allowed
to propagate so Vue's dev overlay remains visible.

The redirect uses a generic user-facing message from `src/constants/errors.ts`, not
the raw thrown error text. If the fatal error route itself throws, the hook stops
propagation without navigating again.

This boundary covers component-tree errors only. Async errors outside Vue's render
cycle (for example bare promise rejections) are not caught here.

### 404 vs 500

- **404** - unknown route, character ID not found in API response, invalid character ID format
- **500** - unrecoverable application errors, component render crashes

Non-existent character IDs (e.g. `/character/99999`) resolve to a 404 rather than
an error page. The API returns a 404 response for unknown IDs, which `CharacterView`
catches and redirects to the `not-found` route. This is intentional for SEO - search
engines treat 404 responses as definitive "this page does not exist" signals, whereas
a 500 or a blank error state is ambiguous.

Note: this is an SPA so the HTTP status code served to crawlers is always 200 from the
server. True SEO-correct 404s would require SSR. This is the best achievable approximation
in a client-side-only context and is worth noting as a known limitation.

## Consequences

**Gained:**

- Named routes mean no hardcoded path strings in components
- Lazy-loaded views via dynamic `import()` - each view is a separate chunk
- Clear separation between "page not found" and "something broke"
- Production users see a branded 500 page instead of a blank screen when a view crashes

**Traded off:**

- `createWebHistory` requires server-side fallback config in production
  (Vite's preview server handles this automatically; a real deployment needs
  nginx or equivalent configured to serve `index.html` for all routes)
- The error boundary does not catch all failure modes (async/event-handler errors)
