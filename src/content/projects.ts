export type ProjectStatus = "completed" | "ongoing" | "paused" | "concept";

export type Project = {
  id: string;
  title: string;
  summary: string;
  description: string;
  technologies: string[];
  status: ProjectStatus;
  featured?: boolean;
  githubUrl?: string;
  liveUrl?: string;
  highlights?: string[];
};

/**
 * Add real projects here. Keep placeholders honest — no invented achievements.
 */
export const projects: Project[] = [
  {
    id: "personal-site",
    title: "Personal portfolio site",
    summary: "This website: a modular Next.js foundation for projects, writing, and experiments.",
    description:
      "A dark, minimal personal site built to separate content from presentation so new projects and sections can be added without rewriting the UI layer.",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    status: "ongoing",
    featured: true,
    githubUrl: "https://github.com/dominikperic/domp.github.io",
    highlights: [
      "App Router architecture",
      "Typed content modules",
      "Vercel-ready deployment path",
    ],
  },
  {
    id: "placeholder-systems-project",
    title: "Systems / tooling project (placeholder)",
    summary: "Reserved slot for a completed systems, tooling, or infrastructure project.",
    description:
      "Replace this card with a real project once you're ready. Include the problem, approach, tech stack, and links.",
    technologies: ["TypeScript", "Python"],
    status: "concept",
    highlights: ["Add problem statement", "Add architecture notes", "Add demo or repo link"],
  },
  {
    id: "placeholder-ml-project",
    title: "ML / data project (placeholder)",
    summary: "Reserved slot for a machine learning, data engineering, or analytics project.",
    description:
      "Use this structure for model work, pipeline design, evaluation notes, and dataset constraints without overstating results.",
    technologies: ["Python", "SQL", "PyTorch"],
    status: "concept",
    highlights: ["Add evaluation metrics", "Add data scope", "Add limitations"],
  },
];

export const projectStatusLabel: Record<ProjectStatus, string> = {
  completed: "Completed",
  ongoing: "Ongoing",
  paused: "Paused",
  concept: "Placeholder",
};
