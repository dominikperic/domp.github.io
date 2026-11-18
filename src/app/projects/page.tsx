import { FadeIn } from "@/components/ui";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { ProjectCard } from "@/components/ProjectCard";
import { projects } from "@/content/projects";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Projects",
  description:
    "Completed and ongoing computer science projects across software engineering, data, and AI.",
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <PageShell>
      <FadeIn>
        <SectionHeader
          eyebrow="Projects"
          title="Selected work"
          description="A structured showcase for completed and ongoing projects. Placeholder cards are labeled honestly so you can replace them without inventing history."
        />
      </FadeIn>

      <FadeIn delay={0.06} className="mt-12 grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </FadeIn>
    </PageShell>
  );
}
