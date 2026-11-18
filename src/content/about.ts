export type TimelineItem = {
  label: string;
  title: string;
  detail: string;
  period?: string;
};

export const aboutContent = {
  headline: "About",
  intro:
    "I care about building systems that are clear, reliable, and useful. My background spans software engineering, data pipelines, and applied machine learning, with a bias toward practical problem-solving over flashy demos.",
  education: {
    school: "Georgia Institute of Technology",
    degree: "B.S. Computer Science",
    note: "Focused coursework and projects across systems, software engineering, and intelligent applications.",
  },
  focusAreas: [
    {
      title: "Software engineering",
      description:
        "Full-stack product work, maintainable architectures, and clean interfaces between people and systems.",
    },
    {
      title: "Data engineering",
      description:
        "Reliable pipelines, warehouse modeling, and making data trustworthy enough for real decisions.",
    },
    {
      title: "Machine learning & AI",
      description:
        "Applied modeling, evaluation discipline, and research-minded exploration of modern AI systems.",
    },
  ],
  currentlyFocusedOn: [
    "Building this personal site as a durable home for projects and notes",
    "Deepening data platform and ML systems skills",
    "Exploring research-adjacent ideas in representation learning and multimodal systems",
  ],
  timeline: [
    {
      label: "Education",
      title: "Georgia Tech — Computer Science",
      detail:
        "Completed a Computer Science degree with interest across software, data, and intelligent systems.",
      period: "Graduate",
    },
    {
      label: "Practice",
      title: "Engineering across the stack",
      detail:
        "Experience spanning application development, data workflows, and ML-oriented projects. Specific roles and employers can be added here.",
      period: "Ongoing",
    },
    {
      label: "Exploration",
      title: "Independent projects and research threads",
      detail:
        "Personal experiments, open-source work, and learning projects live under Projects and Currently Building.",
      period: "Ongoing",
    },
  ] satisfies TimelineItem[],
};
