# Deployment

## Vercel (recommended)

1. Import `dominikperic/domp.github.io` in Vercel.
2. Framework preset: **Next.js**.
3. Set optional env:

```bash
NEXT_PUBLIC_SITE_URL=https://your-production-domain
```

4. Deploy production from `main` after PR review.
5. Attach a custom domain in Vercel project settings when ready.

Preview deployments are created automatically for pull requests.

## Docker production image

```bash
docker build -t domp-site:local .
docker run --rm -p 3000:3000 \
  -e NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
  domp-site:local
```

The image uses Next.js `output: "standalone"` for a smaller runtime.

## Docker Compose development

```bash
docker compose up
```

App: http://localhost:3000

Compose mounts the repo and keeps `node_modules` in a named volume.

## GitHub Pages caveat

The repository name is `domp.github.io`, but the App Router stack is aimed at **Vercel**. Pure static GitHub Pages would require `output: "export"` and additional constraints; that is a separate decision, not the default path.
