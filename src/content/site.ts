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
  title: "Dominik Peric",
  description:
    "Personal site of Dominik Peric — Georgia Tech CS grad working across software, data, and AI.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://dominikperic.github.io",
  locale: "en_US",
  /** Short line under the name on the home page */
  tagline: "Software & data engineering.",
  summary:
    "Computer Science, Georgia Tech. I work at Neretva Group on software and data systems. Outside of that I play guitar, drums, accordion, banjo, bass, piano, jaw harp, and anything else I can get my hands on.",
  location: "United States",
  availability: "Open to conversations",
} as const;

/** Home page Identity section — only facts Dominik supplied. */
export type IdentitySegment = {
  text: string;
  href?: string;
};

export const identityContent = {
  title: "Identity",
  paragraphs: [
    [
      {
        text: "I am a first generation American. My parents are Croats from Bosnia and Herzegovina who immigrated to America before the war in Yugoslavia.",
      },
    ],
    [
      {
        text: "I stay close to my Croatian side through the Chicago Croatian community on the South Side and the North Side at St. Jerome Catholic Church and the Croatian Cultural Center. I was part of ",
      },
      {
        text: "Hrvatska Loza Chicago",
        href: "https://www.croatianculturalcenterchicago.com/hrvatska-loza",
      },
      {
        text: " (Croatian Vines Chicago) for most of my youth through high school, and I play in ",
      },
      {
        text: "Grupa Kliks",
        href: "https://www.facebook.com/grupa.kliks/",
      },
      {
        text: ", a Croatian tambura band.",
      },
    ],
  ] satisfies IdentitySegment[][],
} as const;

export const navigation: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Building", href: "/building" },
  { label: "Interests", href: "/interests" },
  { label: "Contact", href: "/contact" },
];

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
