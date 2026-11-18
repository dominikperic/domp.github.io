import Link from "next/link";
import { ArrowUpRight, Code2 } from "lucide-react";

import type { Project } from "@/content/projects";
import { projectStatusLabel } from "@/content/projects";
import { Card } from "@/components/ui";
import { cx } from "@/lib/utils";

const statusTone: Record<Project["status"], string> = {
  completed: "text-success",
  ongoing: "text-accent",
  paused: "text-warning",
  concept: "text-subtle",
};

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="flex h-full flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-medium tracking-tight text-foreground">
            {project.title}
          </h3>
          <p className={cx("mt-1 text-xs uppercase tracking-wide", statusTone[project.status])}>
            {projectStatusLabel[project.status]}
          </p>
        </div>
        {project.featured ? (
          <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted">
            Featured
          </span>
        ) : null}
      </div>

      <p className="prose-muted text-sm">{project.summary}</p>
      <p className="text-sm leading-relaxed text-subtle">{project.description}</p>

      {project.highlights?.length ? (
        <ul className="space-y-1 text-sm text-muted">
          {project.highlights.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-accent">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        {project.technologies.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-border bg-background/50 px-2.5 py-1 text-xs text-muted"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 pt-1 text-sm">
        {project.githubUrl ? (
          <Link
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-muted transition-colors hover:text-accent"
          >
            <Code2 className="h-3.5 w-3.5" />
            GitHub
          </Link>
        ) : null}
        {project.liveUrl ? (
          <Link
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-muted transition-colors hover:text-accent"
          >
            Live
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>
    </Card>
  );
}
