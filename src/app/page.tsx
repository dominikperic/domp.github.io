import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/ui";
import { PageShell } from "@/components/PageShell";
import { ProjectCard } from "@/components/ProjectCard";
import { projects } from "@/content/projects";
import { siteConfig } from "@/content/site";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Home",
  description: siteConfig.description,
  path: "/",
});

const featured = projects.filter((project) => project.featured).slice(0, 2);

export default function HomePage() {
  return (
    <PageShell>
      <FadeIn>
        <section className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-accent">
              Personal site
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {siteConfig.name}
            </h1>
            <p className="mt-5 text-xl leading-relaxed text-muted sm:text-2xl">
              {siteConfig.tagline}
            </p>
            <p className="prose-muted mt-6 max-w-xl text-base sm:text-lg">{siteConfig.summary}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
              >
                View projects
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/building"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm text-foreground transition hover:border-border-strong"
              >
                Currently building
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-full border border-transparent px-4 py-2.5 text-sm text-muted transition hover:text-accent"
              >
                About me
              </Link>
            </div>
          </div>

          <aside className="surface p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-subtle">At a glance</p>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-subtle">Education</dt>
                <dd className="mt-1 text-foreground">Georgia Tech · Computer Science</dd>
              </div>
              <div>
                <dt className="text-subtle">Focus</dt>
                <dd className="mt-1 text-foreground">
                  Software engineering, data engineering, ML / AI
                </dd>
              </div>
              <div>
                <dt className="text-subtle">Status</dt>
                <dd className="mt-1 text-foreground">{siteConfig.availability}</dd>
              </div>
            </dl>
          </aside>
        </section>
      </FadeIn>

      <FadeIn delay={0.08} className="mt-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-accent">Selected work</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Featured projects</h2>
          </div>
          <Link href="/projects" className="text-sm text-muted transition hover:text-accent">
            All projects →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {featured.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </FadeIn>
    </PageShell>
  );
}
