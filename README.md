# Dominik Peric — Personal Site

Dark, minimal personal portfolio foundation built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, and **Lucide React**.

This repo is structured like a real software project: typed content modules, reusable UI, CI quality gates, Docker packaging, and docs — without turning into a heavy Jekyll/theme monorepo.

## Quick start

```bash
npm install
npm run dev
# or
make install && make dev
```

Open [http://localhost:3000](http://localhost:3000).

### Quality scripts

| Command                           | Purpose                                         |
| --------------------------------- | ----------------------------------------------- |
| `npm run dev`                     | Local development server                        |
| `npm run build`                   | Production build + sitemap generation           |
| `npm run start`                   | Serve the production build                      |
| `npm run lint`                    | ESLint                                          |
| `npm run typecheck`               | TypeScript (`tsc --noEmit`)                     |
| `npm run format` / `format:check` | Prettier write / check                          |
| `npm run ci`                      | Format + lint + types + build (local CI parity) |
| `make help`                       | All Makefile targets                            |

## Repository structure

```text
.
├── .github/workflows/ci.yml   # GitHub Actions: quality + docker build
├── Dockerfile                 # multi-stage production image
├── docker-compose.yml         # containerized local dev
├── Makefile                   # common developer commands
├── CONTRIBUTING.md
├── docs/
│   ├── architecture.md
│   └── deployment.md
├── public/                    # static assets; sitemap/robots after build
└── src/
    ├── app/                   # routes + global styles
    ├── components/            # reusable UI
    ├── content/               # typed editable portfolio data
    └── lib/                   # SEO + utilities
```

### Content editing

| File                       | Edits                                      |
| -------------------------- | ------------------------------------------ |
| `src/content/site.ts`      | Name, tagline, nav, social links, site URL |
| `src/content/about.ts`     | About copy, focus areas, timeline          |
| `src/content/projects.ts`  | Project cards, statuses, links             |
| `src/content/building.ts`  | Currently-building items                   |
| `src/content/interests.ts` | Interests grid                             |

### Design system

Tokens live in `src/app/globals.css` (dark surfaces, muted text, accent, shared layout utilities).

## Docker

```bash
# production-style image
make docker-build
docker run --rm -p 3000:3000 domp-site:local

# compose dev (hot reload via bind mount)
make docker-up
```

## Deployment

See [docs/deployment.md](docs/deployment.md). Short version: import the GitHub repo in **Vercel**, set optional `NEXT_PUBLIC_SITE_URL`, deploy from reviewed `main`.

## Engineering notes

- CI runs on PRs/pushes: Prettier, ESLint, TypeScript, production build, Docker image build.
- `output: "standalone"` supports the Docker runtime.
- Content is separated from presentation on purpose so the site can grow without rewrites.
- Reference sites (for example polished Jekyll portfolios with Docker/CI) informed the **process**, not a literal folder copy.

## Status

Production-ready **foundation**. Architecture, pages, content modules, CI/Docker, and docs are in place so the portfolio can expand continuously.
