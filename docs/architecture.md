# Architecture

## Goals

This repository is a **personal portfolio foundation**, not a CMS. It prioritizes:

- clear separation of content and presentation
- static-friendly Next.js App Router pages
- reproducible local and CI quality gates
- optional containerized development and production builds

## High-level layout

```text
.
├── .github/workflows/ci.yml   # lint, typecheck, build, docker build
├── Dockerfile                 # multi-stage production image
├── docker-compose.yml         # local containerized dev
├── Makefile                   # common developer commands
├── docs/                      # human docs (architecture, deploy)
├── public/                    # static assets + generated sitemap/robots
└── src/
    ├── app/                   # routes, metadata, global styles
    ├── components/            # reusable UI
    ├── content/               # typed portfolio data modules
    └── lib/                   # seo + small utilities
```

## Content model

Portfolio facts live in typed TypeScript modules under `src/content/`:

| Module         | Responsibility                        |
| -------------- | ------------------------------------- |
| `site.ts`      | identity, nav, social links, site URL |
| `projects.ts`  | project cards and statuses            |
| `building.ts`  | active work / experiments             |
| `interests.ts` | non-code interests                    |

Pages import these modules. Adding a project should usually mean editing `projects.ts`, not rewriting card markup.

## Rendering model

- App Router pages under `src/app/**/page.tsx`
- Shared chrome: `SiteHeader`, `SiteFooter`
- Layout primitives: `PageShell`, `SectionHeader`, `Card`, `FadeIn`
- Dark design tokens in `src/app/globals.css`

## Quality gates

Local and CI both run:

1. Prettier check
2. ESLint
3. `tsc --noEmit`
4. `next build` (also generates sitemap via `postbuild`)

Docker image build is a second CI job to keep packaging honest.

## What we intentionally did not copy from Jekyll portfolios

Reference sites like `asboyer/asboyer.github.io` (al-folio) use `_data`, `_layouts`, Ruby/Jekyll, and large plugin trees. This project keeps the **engineering discipline** (Docker, CI, docs, formatters, contribution guide) while staying native to **Next.js + TypeScript**.
