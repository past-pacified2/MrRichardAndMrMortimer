# ADR-0004: Styling Approach

## Status

Accepted

## Context

Options considered for styling:

- **TailwindCSS + component library** (e.g. shadcn/ui, PrimeVue)
- **TailwindCSS only** - utility classes, custom design
- **CSS Modules** - scoped styles per component
- **UnoCSS** - atomic CSS alternative to Tailwind

## Decision

TailwindCSS v4 with no component library.

Tailwind v4 is used via the `@tailwindcss/vite` plugin - no `tailwind.config.js` needed,
no content path configuration. The plugin handles everything automatically.

`prettier-plugin-tailwindcss` is included to enforce consistent class ordering automatically
on every save and commit.

A component library was deliberately avoided. Every visual choice in this project is intentional.

Base styles (reset, typography scale, CSS custom properties) are placed in `@layer base`
so Tailwind utility classes always take precedence without needing `!important`.

## Consequences

**Gained:**

- Full control over the visual design
- No dependency on a third-party component library's release cycle
- Tailwind v4's native Vite plugin means zero config overhead
- Class ordering enforced automatically via Prettier plugin

**Traded off:**

- More CSS to write for common patterns compared to using a library
- Acceptable given the scope of this project (two views, a handful of components)
