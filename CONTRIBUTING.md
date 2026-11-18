# Contributing

Thanks for helping improve this personal site foundation.

## Workflow

1. Create a feature branch from `main` (or work on an existing PR branch).
2. Make focused changes.
3. Run local quality gates before pushing:

```bash
make ci
# or
npm run ci
```

4. Open a pull request. Do not merge to `main` until reviewed.

## Project conventions

- **Content vs UI:** editable copy lives in `src/content/*`. Prefer updating those modules over hardcoding prose in page components.
- **Honesty:** do not invent employment, awards, or project outcomes.
- **Secrets:** never commit tokens, private keys, or non-public personal data. Use `.env.example` as the template for public runtime config only.
- **Formatting:** Prettier + ESLint. Run `npm run format` if CI format checks fail.
- **Docker:** optional. `docker compose up` for containerized dev; `make docker-build` for a production-style image.

## Useful commands

| Command          | Purpose                             |
| ---------------- | ----------------------------------- |
| `make dev`       | Local Next.js server                |
| `make lint`      | ESLint                              |
| `make typecheck` | TypeScript                          |
| `make build`     | Production build                    |
| `make ci`        | Format check + lint + types + build |
| `make docker-up` | Compose-based dev                   |

## Pull requests

Include:

- What changed and why
- Commands you ran (`make ci` expected)
- Screenshots for UI changes when practical
