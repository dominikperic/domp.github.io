export type Interest = {
  id: string;
  title: string;
  description: string;
  tags?: string[];
};

export const interestsContent = {
  headline: "Interests",
  intro:
    "Outside pure implementation work, I care about the broader craft of building: how people learn, how systems age, and how technology sits inside real life.",
  items: [
    {
      id: "systems-thinking",
      title: "Systems thinking",
      description:
        "How complex systems behave over time — software, organizations, and the feedback loops between them.",
      tags: ["Architecture", "Reliability"],
    },
    {
      id: "learning-craft",
      title: "Learning as a craft",
      description:
        "Deliberate practice, notes, and the long game of getting better at technical judgment.",
      tags: ["Growth", "Writing"],
    },
    {
      id: "ai-future",
      title: "Applied AI",
      description:
        "Where machine learning is actually useful versus merely impressive, and how evaluation keeps claims honest.",
      tags: ["ML", "Evaluation"],
    },
    {
      id: "design-taste",
      title: "Product taste",
      description:
        "Interfaces that feel calm and intentional. I like software that respects attention.",
      tags: ["UX", "Clarity"],
    },
    {
      id: "personal-placeholder",
      title: "Personal hobbies (placeholder)",
      description:
        "Add non-technical interests here — music, sports, reading, photography, or whatever is actually yours.",
      tags: ["Personal"],
    },
  ] satisfies Interest[],
};
