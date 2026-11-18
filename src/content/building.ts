export type BuildingItem = {
  id: string;
  title: string;
  summary: string;
  status: "active" | "exploring" | "research" | "idea";
  tags: string[];
  updatedLabel?: string;
  link?: string;
};

export const buildingContent = {
  headline: "Currently building",
  intro:
    "A snapshot of active work, experiments, and research threads. These are intentionally unfinished — the point is momentum and learning, not polished case studies.",
  items: [
    {
      id: "site-foundation",
      title: "Portfolio foundation",
      summary:
        "Standing up this site's design system, content model, and deployment path so future writing and projects have a home.",
      status: "active",
      tags: ["Next.js", "Design system", "Content architecture"],
      updatedLabel: "Now",
      link: "https://github.com/dominikperic/domp.github.io",
    },
    {
      id: "data-ml-systems",
      title: "Data and ML systems practice",
      summary:
        "Continuing hands-on work with pipelines, warehouse modeling, evaluation discipline, and production-minded ML workflows.",
      status: "active",
      tags: ["Data engineering", "ML systems"],
      updatedLabel: "Ongoing",
    },
    {
      id: "research-adjacent",
      title: "Research-adjacent exploration",
      summary:
        "Reading and small experiments around representation learning, multimodal systems, and applied AI research questions. Details TBD.",
      status: "research",
      tags: ["AI research", "Learning"],
      updatedLabel: "Exploring",
    },
    {
      id: "future-experiment",
      title: "Open experiment slot",
      summary:
        "Placeholder for the next prototype. Swap this for a real experiment when you start one.",
      status: "idea",
      tags: ["Idea"],
      updatedLabel: "Soon",
    },
  ] satisfies BuildingItem[],
};

export const buildingStatusLabel: Record<BuildingItem["status"], string> = {
  active: "Active",
  exploring: "Exploring",
  research: "Research",
  idea: "Idea",
};
