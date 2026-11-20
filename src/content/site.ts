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
  /** Home intro under the name — professional then personal. */
  summaryParagraphs: [
    [
      {
        text: "Welcome to my personal site, a place to get to know me beyond the usual resume version. As you probably already know, I’m ",
      },
      { text: "THE", bold: true },
      {
        text: " Dominik Peric. I studied Computer Science at ",
      },
      {
        text: "Georgia Tech",
        href: "https://www.gatech.edu/",
      },
      {
        text: ", and I currently work at Neretva Group as a Data Engineer/Scientist. Day to day that means working across data and software: shaping how information is collected, stored, cleaned, and turned into something useful, and writing the code and systems that make that possible. My CS background shows up in how I build things, from solid engineering habits to the analytical side of working with data.",
      },
    ],
    [
      {
        text: "Outside of work I am competitive by nature. I play chess in my free time and sit around 1400–1500 on Lichess. During the summer I used to play tennis competitively and still play it recreationally. I’ve recently gotten my ",
      },
      {
        text: "PADI",
        href: "https://www.padi.com/",
      },
      {
        text: " license and have been honing my scuba skills. In the winter I ski whenever I get the chance. I also play guitar, drums, accordion, banjo, bass, piano, jaw harp, and anything else I can get my hands on.",
      },
    ],
  ] as const,
  /** @deprecated prefer summaryParagraphs */
  summary:
    "Welcome to my personal site. I’m Dominik Peric. I studied Computer Science at Georgia Tech and work at Neretva Group on software and data systems. Outside of work I am competitive by nature, play chess (about 1400–1500 on Lichess), used to play tennis competitively and still play recreationally, and play guitar, drums, accordion, banjo, bass, piano, jaw harp, and anything else I can get my hands on.",
  location: "United States",
  availability: "Open to conversations",
} as const;

/** Home page Identity section — only facts Dominik supplied. */
export type IdentitySegment = {
  text: string;
  href?: string;
  bold?: boolean;
};

export const identityContent = {
  title: "Identity",
  paragraphs: [
    [
      {
        text: "I am a first generation American. My parents are ",
      },
      {
        text: "Croats",
        href: "https://en.wikipedia.org/wiki/Croats",
      },
      {
        text: " from Bosnia and Herzegovina who immigrated to America before the war in Yugoslavia.",
      },
    ],
    [
      {
        text: "I stay close to my Croatian side through the Chicago Croatian community on the South Side and the North Side at Blessed Aloysius Stepinac Croatian Catholic Mission and the Croatian Cultural Center. I was part of ",
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
    [
      {
        text: "I speak Croatian, Bosnian, and Serbian fluently. People often treat them as fully separate languages, largely out of national pride, but in practice they are the same dialect. The lines between them are drawn more by politics than by speech.",
      },
    ],
  ] satisfies IdentitySegment[][],
} as const;

export const navigation: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Resume", href: "/resume" },
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
