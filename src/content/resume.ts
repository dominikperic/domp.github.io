type ResumeJob = {
  company: string;
  role: string;
  location: string;
  dates: string;
  bullets: readonly string[];
};

type ResumeEducation = {
  school: string;
  degree: string;
  location: string;
  dates: string;
  specialties: string;
  gpa: string;
  courses: readonly string[];
};

type ResumeContent = {
  title: string;
  name: string;
  location: string;
  contact: readonly { label: string; href: string; external?: boolean }[];
  sections: { experience: string; education: string; skills: string };
  jobs: readonly ResumeJob[];
  education: ResumeEducation;
  skills: readonly { label: string; items: readonly string[] }[];
};

// Source: Dominik_Peric_Resume.pdf, supplied by Dominik. Personal projects omitted.
export const resumeContent: ResumeContent = {
  title: "Resume",
  name: "Dominik Peric",
  location: "Chicago, IL",
  contact: [
    {
      label: "github.com/dominikperic",
      href: "https://github.com/dominikperic",
      external: true,
    },
    { label: "dominikperic3@gmail.com", href: "mailto:dominikperic3@gmail.com" },
    { label: "(847) 329-0008", href: "tel:+18473290008" },
  ],
  sections: { experience: "Experience", education: "Education", skills: "Skills" },
  jobs: [
    {
      company: "Neretva Group",
      role: "Data Engineer",
      location: "Chicago, IL",
      dates: "July 2026 – Present",
      bullets: [
        "Built AWS and Databricks infrastructure for a centralized insurance data platform, configuring S3, IAM, AWS Transfer Family SFTP, Unity Catalog, service principals, and access controls.",
        "Developed Python, PySpark, and SQL ETL pipelines to ingest historical and daily data from SFTP, REST APIs, CRM systems, call center platforms, and Amazon S3 into a Medallion Architecture.",
        "Created Bronze, Silver, and Gold tables to clean, normalize, deduplicate, and report on customer, sales, lead, status, and call center data.",
        "Processed 747,000+ historical call records and MP3 recordings, implementing audio transcription, automated call classification and flagging, and PCI-sensitive data masking in transcripts to support PCI DSS compliance.",
        "Built Databricks SQL dashboards and automated standard business reports, KPI generation, and report delivery to managers based on their reporting needs.",
        "Engineered a temporal relational data model at the customer level using legacy CRM data to preserve historical state changes and enable accurate transfer of customer records and business events into the new CRM platform.",
        "Migrated customer, policy, and operational data from a legacy CRM into a new CRM platform, transforming and validating records to maintain data integrity between systems.",
        "Applied K-Means and K-Prototypes clustering to identify top-performing combinations of lead providers, printing costs, and geographic markets, improving PCA and TCPA by pruning leads predicted to underperform from sales batches.",
      ],
    },
    {
      company: "Data Sleek",
      role: "Data Engineer Intern",
      location: "Remote",
      dates: "June 2024 – September 2024",
      bullets: [
        "Developed Python scripts using Boto3 to retrieve client data from AWS S3 and automate recurring data transfers into Snowflake.",
        "Wrote and optimized SQL queries in Snowflake for data transformation, validation, analytics, and reporting, targeting a 15% reduction in query execution time through query optimization.",
        "Designed Star Schema data models with fact and dimension tables tailored to reporting requirements, targeting a 25% improvement in analytical query performance.",
        "Collaborated with analysts, engineers, and clients to identify data quality issues and translate business requirements into database structures and reporting workflows.",
      ],
    },
  ],
  education: {
    school: "Georgia Institute of Technology",
    degree: "Bachelor of Science in Computer Science",
    location: "Atlanta, GA",
    dates: "August 2023 – August 2026",
    specialties: "Intelligence and Media",
    gpa: "3.5",
    courses: [
      "Data Structures & Algorithms",
      "Machine Learning",
      "Natural Language",
      "Automata and Complexity",
      "Design & Analysis of Algorithms",
      "Computer Organization",
      "Objects and Design",
    ],
  },
  skills: [
    {
      label: "Languages",
      items: ["Python", "Java", "JavaScript", "TypeScript", "HTML/CSS", "SQL", "Bash"],
    },
    {
      label: "Frameworks & libraries",
      items: [
        "React",
        "Node.js",
        "PySpark",
        "NumPy",
        "pandas",
        "scikit-learn",
        "PyTorch",
        "TensorFlow",
        "SciPy",
        "Matplotlib",
      ],
    },
    {
      label: "Tools",
      items: [
        "Databricks",
        "Snowflake",
        "AWS",
        "S3",
        "IAM",
        "Docker",
        "PostgreSQL",
        "Git",
        "GitHub",
        "Unity Catalog",
        "SFTP",
        "CI/CD",
      ],
    },
  ],
};
