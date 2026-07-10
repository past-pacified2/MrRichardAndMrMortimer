# ADR-0006: Security

## Status

Accepted (partial - see known gaps)

## Context

This is a client-side SPA consuming a public read-only API. There is no authentication,
no user data, and no backend. The attack surface is limited but some baseline security
measures are still applicable.

## Decisions

### Locked dependency versions

All packages in `package.json` are pinned to exact versions (no `^` or `~` ranges).
This ensures reproducible installs across environments and prevents a supply chain
compromise via a malicious minor or patch release from silently entering the build.

The tradeoff is that security patches must be applied deliberately via `npm update`
or Dependabot rather than being picked up automatically. This is an acceptable tradeoff

- automatic updates without review carry their own risk.

### No sensitive data in the client

The Rick and Morty API is fully public. No API keys, tokens, or credentials are present
in the client bundle.

## Known Gaps

The following measures would be implemented in a production deployment but are out of
scope for this project at this stage:

**Content Security Policy (CSP)**
Served via nginx or Cloudflare headers to restrict which origins the app can load
scripts, styles, and data from. For this app a strict CSP would whitelist only
`rickandmortyapi.com` as a `connect-src`.

**Subresource Integrity (SRI)**
Any externally loaded assets would carry `integrity` hashes to prevent tampering.
Not applicable here as all assets are self-hosted via the Vite build.

**Security headers**
A production nginx config would include:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` to disable unused browser features

**Dependency auditing**
`npm audit` should be run in CI on every push. Not configured here as there is no
CI pipeline, but `npm audit` can be run locally at any time.

**HTTPS**
Assumed to be handled at the infrastructure level (Cloudflare, nginx + Let's Encrypt).
Not applicable to a local context.
