# Next.js Starter

A production-oriented Next.js App Router starter: typed env, security headers,
a typed API client, TanStack Query, Zustand, SEO defaults, linting, Git hooks,
and CI — wired up and verified to build.

## Stack

- **Next.js 16** (App Router, Turbopack) / **React 19**
- **TypeScript** — strict mode
- **Tailwind CSS v4** — CSS-variable theme, no config file (uses `@theme inline`)
- **Bun** — install + scripts
- **Zod + @t3-oss/env-nextjs** — env validation (build-time and runtime, server/client split)
- **TanStack Query** — server state, with devtools in development
- **Zustand** — client-only UI state, store-per-request via Context (safe under App Router SSR)
- **axios** — typed API client with a normalized error type
- **Biome** — linting + formatting (replaces ESLint + Prettier)
- **Husky** — Git hooks

---

## Starting a new project from this template

Work top to bottom. Everything here is a one-time change; after the first commit
you rarely touch most of it again.

### 1. Get the code and reset history

```bash
npx degit <this-repo-url> my-app
cd my-app
rm -rf .git && git init
bun install
```

### 2. Rename the app

| File                    | Field                          | Change to                       |
| ----------------------- | ------------------------------- | -------------------------------- |
| `package.json`          | `name`                          | your package name (kebab-case)   |
| `src/app/layout.tsx`    | `siteName`, `description`       | your product name & description  |
| `.env.example`/`.env.local` | `NEXT_PUBLIC_SITE_URL`      | your production domain           |

`siteName`/`description` in `layout.tsx` feed the title template, Open Graph,
and Twitter card metadata — change them once and every page inherits it via
`title: { template: "%s | <siteName>" }`.

### 3. Set up env

```bash
cp .env.example .env.local
```

- Edit `.env.local` with real values.
- Add new variables to the schema in [src/env.ts](src/env.ts) — server-only
  vars go in `server`, client-exposed vars (must be prefixed `NEXT_PUBLIC_`)
  go in `client` — then wire them into the `runtimeEnv` object.
- Mirror every change in `.env.example` so the schema and the example file
  never drift.
- **Never** put secrets in `NEXT_PUBLIC_*` vars — they're inlined into the
  client bundle at build time.
- [next.config.ts](next.config.ts) imports `src/env` directly, so a
  missing/invalid var fails `next build` immediately. Set
  `SKIP_ENV_VALIDATION=true` to bypass this in build stages that don't have
  runtime secrets yet (e.g. an early Docker layer).

### 4. Set the theme

- Edit the CSS variables in the `:root` and `@media (prefers-color-scheme: dark)`
  blocks of [src/app/globals.css](src/app/globals.css) — `--background` /
  `--foreground` are mapped into Tailwind via `@theme inline`, so utility
  classes like `bg-background` and `text-foreground` pick up the change
  automatically.
- Optional — change the typeface: swap the `next/font/google` imports in
  [src/app/layout.tsx](src/app/layout.tsx) (currently Geist / Geist Mono) and
  update the corresponding `--font-*` variables in `globals.css`.

### 5. Replace icons and static assets

Swap [src/app/favicon.ico](src/app/favicon.ico) and delete the demo SVGs in
[public/](public/) (`next.svg`, `vercel.svg`, `file.svg`, `globe.svg`,
`window.svg`) once you've replaced the homepage that references them.

### 6. Build your first page

Replace the demo body of [src/app/page.tsx](src/app/page.tsx). Add routes as
folders under `src/app/`. Keep everything that isn't a route file (components,
hooks, lib, stores) **outside** the route segments Next.js scans for special
files.

Update [src/app/sitemap.ts](src/app/sitemap.ts) as you add public routes worth
indexing.

### 7. Verify and commit

```bash
bun run lint && bun run typecheck && bun run build
bun dev          # confirm it renders, check dark mode
git add -A && git commit -m "chore: initialize from starter"
```

The pre-commit hook runs Biome on staged files. Push to GitHub and CI
([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs lint, typecheck,
and build on every push to `main` and every PR.

---

## Scripts

| Command           | Purpose                             |
| ------------------ | ------------------------------------ |
| `bun dev`           | dev server (Turbopack)               |
| `bun run build`     | production build                     |
| `bun run start`     | serve the production build           |
| `bun run lint`      | Biome check                          |
| `bun run lint:fix`  | Biome check, auto-fix                |
| `bun run format`    | Biome format, write                  |
| `bun run typecheck` | `tsc --noEmit`                       |

## Project layout

```
src/
  app/
    layout.tsx           # root layout — fonts, metadata, security-relevant providers
    page.tsx              # homepage — replace with real content
    providers.tsx          # QueryClientProvider + UIStoreProvider (client boundary)
    error.tsx               # route-level error boundary
    global-error.tsx         # root-level error boundary (replaces html/body on crash)
    not-found.tsx             # 404 UI
    loading.tsx                # route-level Suspense fallback
    robots.ts                   # robots.txt (generated)
    sitemap.ts                   # sitemap.xml (generated)
    globals.css                   # Tailwind v4 entry + theme CSS variables
  env.ts                           # Zod-validated env schema (@t3-oss/env-nextjs)
  lib/
    axios.ts                       # typed API client (api.get/post/...), normalized ApiError
  stores/
    create-store-context.tsx        # generic Zustand store-per-request factory (Context + selector hook)
    ui-store.ts                      # example Zustand store — replace/extend
    ui-store-provider.tsx             # Provider + useUIStore hook built from the factory
```

## Security headers

[next.config.ts](next.config.ts) sets a Content-Security-Policy plus HSTS,
`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and
`Permissions-Policy` on every response, and disables the `X-Powered-By`
header. If you point [src/lib/axios.ts](src/lib/axios.ts) at an external API
via `NEXT_PUBLIC_API_URL`, add that origin to the CSP's `connect-src` (the
`default-src 'self'` fallback will otherwise block it) — see the comment
above `cspHeader` in `next.config.ts`.

## State management (Zustand)

Zustand holds **client-only, ephemeral UI state** — sidebar/modal open state,
theme overrides, form drafts. It never holds server data; that's TanStack
Query's job (see below). Stores are created per-request via a Context
provider, not as a module-level `create()` singleton — Client Components
still render once on the server per request, so a global store would leak
state across concurrent users. See [src/stores/create-store-context.tsx](src/stores/create-store-context.tsx).

```tsx
import { useUIStore } from "@/stores/ui-store-provider";

// Select only what you need — avoids re-rendering on unrelated store changes.
const sidebarOpen = useUIStore((s) => s.sidebarOpen);
const toggleSidebar = useUIStore((s) => s.toggleSidebar);
```

To add a new store, copy the `ui-store.ts` + `ui-store-provider.tsx` pair,
swap in your state/actions, and mount the new `*StoreProvider` in
[src/app/providers.tsx](src/app/providers.tsx).

## Data fetching (TanStack Query + axios)

```tsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";

type Post = { id: string; title: string };

function usePosts() {
  return useQuery({
    queryKey: ["posts"],
    queryFn: () => api.get<Post[]>("/posts"),
  });
}

function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string }) => api.post<Post>("/posts", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
  });
}
```

- **Errors**: every rejection from `api.*` is an
  [`ApiError`](src/lib/axios.ts) with `message`, `status`, and the raw
  response `data` — check `error instanceof ApiError` rather than
  `axios.isAxiosError`.
- **Defaults**: `staleTime` (60s) lives in
  [src/app/providers.tsx](src/app/providers.tsx); override per query as
  needed. Devtools only mount in development.
- **FormData uploads**: `api.postForm`/`api.putForm` skip the default JSON
  `Content-Type` so the browser can set its own multipart boundary.

## Not included — add per project

Tests (Vitest/Playwright), auth/session, i18n, Docker/`output: "standalone"`,
error tracking (Sentry), analytics, bundle analyzer, and dependency-update
automation (Dependabot/Renovate).

## Keeping dependencies current

A template is a **snapshot**. Every version in `package.json` is pinned as of
when it was generated, so nothing updates on its own.

Groups that need to move together:

- **Framework core** — `next`, `react`, `react-dom`, `@types/react`,
  `@types/react-dom`. The App Router bundles a React version matched to the
  installed `next` version — don't bump `react`/`react-dom` independently of
  `next`.
- **Styling** — `tailwindcss` + `@tailwindcss/postcss` (keep the same major).
- **Data layer** — `@tanstack/react-query` + `@tanstack/react-query-devtools`
  (keep identical versions), `axios`.
- **Env validation** — `@t3-oss/env-nextjs` + `zod` (check `@t3-oss/env-nextjs`'s
  peer range before bumping `zod` across a major).
- **State** — `zustand`.
- **Tooling** — `@biomejs/biome`, `typescript`, `husky`.

### Routine updates (minor/patch)

```bash
bunx npm-check-updates -u --target minor
bun install
bun run lint && bun run typecheck && bun run build
```

### Upgrading Next.js itself

This project's Next.js docs live in `node_modules/next/dist/docs/` and differ
from what's publicly documented for older majors (see
[AGENTS.md](AGENTS.md)) — always upgrade via the bundled codemod rather than
bumping the version by hand, then read the version-matched guide for anything
the codemod can't rewrite automatically:

```bash
bunx @next/codemod@canary upgrade latest
```

After it runs:

1. Skim `node_modules/next/dist/docs/01-app/02-guides/upgrading/` for the
   version you landed on.
2. `bun run lint && bun run typecheck && bun run build`.
3. `bun dev` and click through the app once — Turbopack/App Router changes
   sometimes only surface at runtime.

### Other major bumps (Tailwind, Zod, etc.)

Bump one at a time and read that library's migration guide before moving to
the next:

```bash
bunx npm-check-updates -u <package>
bun install
```

If you last generated this template recently, none of the above is urgent —
just `bun install` and start building.
