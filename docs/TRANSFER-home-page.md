# Transfer: Dominik personal portfolio (`domp.github.io`)

**For:** any general / coding bot continuing this work
**Owner:** Dominik Peric
**Date context:** 2026-11-18
**Purpose:** hand off full context so the next session can continue without rediscovering history.

---

## 1. What this project is

Public personal portfolio site for Dominik Peric.

| Item                         | Value                                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------- |
| GitHub                       | `https://github.com/dominikperic/domp.github.io`                                                              |
| Local path                   | `/Users/dominikperic/Projects/domp.github.io`                                                                 |
| GitHub account for this repo | **personal** `dominikperic` (not work `dominikd-neretva`)                                                     |
| Stack                        | Next.js App Router, TypeScript, Tailwind CSS v4, Framer Motion, Lucide (generic icons only), ESLint, Prettier |
| Hosting intent               | Vercel-ready (`output: "standalone"` for Docker too)                                                          |
| Contact (public, in content) | GitHub `dominikperic`, LinkedIn `https://www.linkedin.com/in/dominik-peric-`, email `dominikperic3@gmail.com` |

**Do not invent** employment history, achievements, socials, projects, or favorite media. Only use what Dominik has supplied.

---

## 2. Git / branch state (critical)

```text
Branch:     feat/home-page   (local only so far)
Base main:  13243c8  “chore: engineering structure, CI, and Docker (#2)”
Uncommitted: YES — all home/jazz/footer/nav/likes work is WIP on this branch
Remote PR:  not opened yet for this home pass
```

### Uncommitted / new files (as of handoff)

**Modified**

- `next.config.ts` — `devIndicators: false`, YouTube `images.remotePatterns`
- `src/app/globals.css` — jazz tokens + full-page gradient (see design)
- `src/app/layout.tsx` — fonts Libre Baskerville / Source Sans 3 / IBM Plex Mono
- `src/app/page.tsx` — sparse home + likes section
- `src/components/PageShell.tsx`
- `src/components/SiteHeader.tsx` — centered nav, no DP brand
- `src/components/SiteFooter.tsx` — centered socials + inline SVG icons
- `src/content/site.ts` — bio paragraph

**Untracked**

- `src/content/likes.ts` — songs for home section

### Rulesets on `main` (already live)

- Protect main: PR required + CI check name **`Lint, typecheck, build`** + no force-push/delete (admin bypass allowed)
- All branches: no force-push

**Do not merge to `main` unless Dominik asks.** Prefer commit on `feat/home-page` → push → PR → wait for CI.

### Auth before git remote ops

```bash
gh auth switch --user dominikperic
gh api user --jq .login   # must be dominikperic
```

---

## 3. What was already shipped on `main`

1. **PR #1** — foundation: App Router pages, content modules, SEO/sitemap, 404
2. **PR #2** — engineering bar inspired by asboyer-style discipline (not Jekyll copy):
   - Dockerfile (Node 22 multi-stage standalone), docker-compose, Makefile
   - Prettier, EditorConfig, CI workflow, CONTRIBUTING, docs/architecture, docs/deployment, LICENSE
3. About page was **removed** earlier (do not recreate unless asked).
4. Nav routes: Home, Projects, Building, Interests, Contact.

---

## 4. What we are working on NOW (`feat/home-page`)

### Goal

Simple, personal home page with a **raw late-night jazz-club feel** (colors/type only — **no instrument icons/clipart**).

### Home structure (current)

1. **Intro (top)**
   - Full name only: `Dominik Peric`
   - Thin brass rule
   - One paragraph bio (no role tagline)
   - **No** “DOMINIK” eyebrow
   - **No** Projects/Building/Contact shortcut row on home
   - **No** GitHub/LinkedIn/Email on home intro

2. **Scroll section: “I Like It, You Might Like It”**
   - Intro line: **`I have no favorites.`**
   - **Songs only** (books removed on purpose)
   - Each song: YouTube thumb + title + artist + “Watch on YouTube” (whole row is a link)
   - **No** prose descriptions under songs

### Current songs (`src/content/likes.ts`)

| Title         | Artist                  | YouTube                                                               |
| ------------- | ----------------------- | --------------------------------------------------------------------- |
| Orbit         | Colin Benders           | `https://www.youtube.com/watch?v=Jlm7Gw4aIQo` (live modular; YT-only) |
| Palladium     | Alan Braxe & Fred Falke | `https://www.youtube.com/watch?v=SYxmyWaxd_Y`                         |
| She Found Now | My Bloody Valentine     | `https://www.youtube.com/watch?v=xG8HEknM3zc` (official visualiser)   |

**Images:** YouTube CDN thumbs only (`https://i.ytimg.com/vi/<id>/hqdefault.jpg`).
Do **not** download album art into the repo (copyright-safe default).

### Bio copy (current)

> Computer Science, Georgia Tech. I work at Neretva Group on software and data systems. Outside of that I play guitar, drums, accordion, banjo, bass, piano, jaw harp, and anything else I can get my hands on.

### Site chrome (all pages)

- **Header:** centered mono nav only; hamburger on mobile right; **no DP / Dominik logo**
- **Footer:** no name line; centered larger GitHub / LinkedIn / Email with **inline SVG** brand icons and faded vertical dividers
- **Background:** one continuous dark → slightly lighter warm gradient down the **full document** via `body::before { position:absolute; inset:0; z-index:-1 }`.
  - Do **not** use `background-attachment: fixed`, scroll-driven CSS vars, or `html.h-full` + `body.min-h-full` locks (those caused a hard horizontal seam mid-page around Orbit).
- **Dev:** `devIndicators: false` in `next.config.ts` (hides Next “N” badge)
- **Fonts:** Libre Baskerville (display), Source Sans 3 (body), IBM Plex Mono (labels)

### Palette tokens (`globals.css`)

- Background `#0c0a08` → mid `#15120e` → end `#1c1814`
- Foreground cream `#f3ead7`, muted `#c4b49a`, accent brass `#d4a04a`, ember `#b54a2e`

---

## 5. How to run / verify

```bash
cd /Users/dominikperic/Projects/domp.github.io
gh auth switch --user dominikperic
npm run dev          # http://localhost:3000
npm run typecheck
npm run lint
npm run ci           # format + lint + typecheck + build before push
```

After `next.config` changes, restart `npm run dev`.

A dev server may already be running on port 3000 from earlier sessions; kill and restart if styles look stale:

```bash
lsof -tiTCP:3000 -sTCP:LISTEN | xargs kill 2>/dev/null; npm run dev
```

---

## 6. Skill + conventions the next bot should load

Hermes skill (authoritative conventions, already updated with this session’s lessons):

- `personal-nextjs-portfolio`
  path: `~/.hermes/skills/software-development/personal-nextjs-portfolio/SKILL.md`
  - `references/design.md`

Related: `github-auth`, `github-pr-workflow` for push/PR.

---

## 7. Likely next steps (ask Dominik if unclear)

1. **Commit** WIP on `feat/home-page` with a clear message (home jazz polish + likes songs).
2. **Push + open PR** to `main`; wait for CI `Lint, typecheck, build`.
3. Optional polish Dominik may still want:
   - More songs / different YT links
   - Interests page cleanup (may still have old placeholder hobbies/books — **not fully audited this pass**)
   - Projects / Building content (still placeholders; don’t invent)
   - Stronger/softer gradient stops if he still dislikes the wash
   - Vercel deploy + custom domain later

---

## 8. Explicit user preferences from this session

- Home: personal but general; strip heavy text/bullets.
- Raw jazz **feeling** (theme/colors), not instrument graphics.
- Human, simple copy — kill clichés (“Building in the quiet hours”, etc.).
- Remove role tagline “Software & data engineering.” from home.
- Likes section title fixed: **I Like It, You Might Like It** → intro **I have no favorites.**
- Songs only; remove books.
- Song cards: photos via YT thumbs, no descriptions, YT links on all three.
- Footer socials only (not duplicated on home); icons + gradient dividers; bigger; centered; no “Dominik Peric” footer label.
- No DP brand in header; center nav; remove home shortcut links.
- Full-page smooth background gradient without mid-page seam.
- Hide Next.js dev “N” indicator.

---

## 9. Out of scope for this handoff (other workstreams)

Separate Aviato / Databricks lakehouse work lives under `/Users/dominikperic/Projects/aviato-databricks` with profiles `aviato-*` / `lakehouse-*`. **Do not mix** CRM credentials or customer data into this personal portfolio repo.

---

## 10. Suggested first actions for the receiving bot

1. Read this file + load skill `personal-nextjs-portfolio`.
2. `cd /Users/dominikperic/Projects/domp.github.io && git status && gh auth switch --user dominikperic`.
3. Open `src/app/page.tsx`, `src/content/likes.ts`, `src/content/site.ts`, `src/app/globals.css`, header/footer.
4. Confirm localhost:3000 matches Dominik’s last visual intent.
5. Ask Dominik whether to **commit + PR** now or continue design tweaks.

---

_End of transfer._
