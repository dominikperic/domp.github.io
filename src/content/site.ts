export type SocialLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type NavItem = {
  label: string;
  href: string;
};

export const siteConfig = {
  name: "Dominik Peric",
  shortName: "Dominik",
  title: "Dominik Peric — Software, Data, and AI",
  description:
    "Personal site of Dominik Peric, a Georgia Tech Computer Science graduate exploring software engineering, data engineering, machine learning, and AI research.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://dominikperic.github.io",
  locale: "en_US",
  tagline: "Building thoughtful systems at the intersection of software, data, and AI.",
  summary:
    "I'm a Computer Science graduate from Georgia Tech with experience across full-stack software engineering, data engineering, machine learning, and AI research. This site is a living notebook of what I'm building, studying, and exploring.",
  location: "United States",
  availability: "Open to interesting collaborations and conversations",
} as const;

export const navigation: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Building", href: "/building" },
  { label: "Interests", href: "/interests" },
  { label: "Contact", href: "/contact" },
];

/**
 * Replace placeholder social links with your real profiles.
 * Keep external: true for third-party sites.
 */
export const socialLinks: SocialLink[] = [
  {
    label: "GitHub",
    href: "https://github.com/dominikperic",
    external: true,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/dominik-peric-",
    external: true,
  },
  {
    label: "Email",
    href: "mailto:dominikperic3@gmail.com",
    external: true,
  },
];
