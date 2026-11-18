import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Not found",
  description: "The page you requested could not be found.",
  path: "/404",
});

export default function NotFound() {
  return (
    <PageShell className="flex items-center">
      <div className="max-w-lg">
        <p className="text-xs uppercase tracking-[0.18em] text-accent">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="prose-muted mt-4">
          That route doesn&apos;t exist yet. Head home or browse projects while the site continues to
          grow.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background"
          >
            Home
          </Link>
          <Link
            href="/projects"
            className="rounded-full border border-border px-4 py-2.5 text-sm text-muted"
          >
            Projects
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
