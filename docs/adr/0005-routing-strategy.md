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

| Path               | Name        | View              | Notes                                     |
| ------------------ | ----------- | ----------------- | ----------------------------------------- |
| `/`                | `home`      | `HomeView`        | Character list with pagination and search |
| `/character/:id`   | `character` | `CharacterView`   | Character detail                          |
| `/character`       | -           | -                 | Redirects to `/` (incomplete URL)         |
| `/500`             | `error`     | `FatalErrorView`  | Unrecoverable application errors          |
| `/:pathMatch(.*)*` | `not-found` | `FourhOhFourView` | Unknown routes                            |

### Error routing

`/500` is not a URL users navigate to - it is an application state. Navigation there
is triggered programmatically via `router.push({ name: 'error', state: { message } })`.

A global `onErrorCaptured` in `App.vue` catches unrecoverable Vue errors and redirects
to the error route automatically. API fetch errors are handled locally with retry UI
and do not redirect.

Error state is passed via `window.history.state` rather than query params to avoid
exposing internal error messages in the URL.

### 404 vs 500

- **404** - unknown route, character ID not found in API response, invalid character ID format
- **500** - component crash, failed app initialisation, unhandled exception

Non-existent character IDs (e.g. `/character/no-character-like-this`) resolve to a 404
rather than an error page. The API returns a 404 response for unknown IDs, which the
composable catches and redirects to the `not-found` route via the router. This is
intentional for SEO - search engines treat 404 responses as definitive "this page does
not exist" signals, whereas a 500 or a blank error state is ambiguous.

Note: this is an SPA so the HTTP status code served to crawlers is always 200 from the
server. True SEO-correct 404s would require SSR. This is the best achievable approximation
in a client-side-only context and is worth noting as a known limitation.

## Consequences

**Gained:**

- Named routes mean no hardcoded path strings in components
- Lazy-loaded views via dynamic `import()` - each view is a separate chunk
- Clear separation between "page not found" and "something broke"

**Traded off:**

- `createWebHistory` requires server-side fallback config in production
  (Vite's preview server handles this automatically; a real deployment needs
  nginx or equivalent configured to serve `index.html` for all routes)
