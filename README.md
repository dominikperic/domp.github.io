# Dominik Peric — Personal Site

Dark, minimal personal portfolio foundation built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, and **Lucide React**.

Live intent: a durable home for background, projects, active experiments, interests, and contact links — optimized for Vercel and a future custom domain.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run build` | Production build + sitemap generation |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |

## Project structure

```text
src/
  app/                 # App Router pages and metadata
  components/          # Shared UI (nav, cards, layout primitives)
  content/             # Typed editable content (no UI logic)
  lib/                 # SEO helpers and utilities
public/                # Static assets; robots/sitemap after build
```

### Content editing

Update portfolio copy without touching components:

| File | Edits |
| --- | --- |
| `src/content/site.ts` | Name, tagline, nav, social links, site URL |
| `src/content/about.ts` | About copy, focus areas, timeline |
| `src/content/projects.ts` | Project cards, statuses, links |
| `src/content/building.ts` | Currently-building items |
| `src/content/interests.ts` | Interests grid |

Replace placeholders marked clearly in those files (LinkedIn URL, email, empty project slots, hobby placeholders).

### Design system

CSS variables live in `src/app/globals.css`:

- dark background / foreground
- muted text, borders, card surfaces
- accent violet for highlights
- shared `.container-page` and `.surface` utilities

## Deployment (Vercel)

1. Push this repository to GitHub (`dominikperic/domp.github.io`).
2. Import the repo in [Vercel](https://vercel.com/new).
3. Framework preset: **Next.js** (default).
4. Optional environment variable:
   - `NEXT_PUBLIC_SITE_URL=https://your-domain.com`  
     Used for canonical URLs, Open Graph, and `next-sitemap`.
5. Deploy. Attach a custom domain later in Vercel project settings.

### GitHub Pages note

The repo name is `domp.github.io`, but this foundation targets **Vercel** for Next.js App Router hosting. Static GitHub Pages would need `output: "export"` and would drop some Next server features.

## SEO and assets

- Metadata + Open Graph helpers: `src/lib/seo.ts`
- Favicon: `src/app/favicon.ico` (replace with your own mark)
- Sitemap + robots: generated on `postbuild` via `next-sitemap`
- Custom 404: `src/app/not-found.tsx`

## Safety

- Do not commit secrets, tokens, or private details you do not want public.
- Social links and email in `site.ts` become public once deployed.

## Status

This is a **production-ready foundation**, not a finished autobiography. Architecture, navigation, design tokens, pages, and content modules are in place so the site can grow continuously.
