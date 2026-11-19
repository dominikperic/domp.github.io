import Link from "next/link";
import type { ReactNode } from "react";
import { socialLinks } from "@/content/site";

/** Brand marks as inline SVG — Lucide no longer ships Github/Linkedin. */
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.26.82-.577 0-.285-.01-1.04-.016-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.76-1.605-2.665-.303-5.466-1.332-5.466-5.93 0-1.31.468-2.382 1.236-3.222-.124-.303-.536-1.523.117-3.176 0 0 1.008-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.29-1.552 3.297-1.23 3.297-1.23.655 1.653.243 2.873.12 3.176.77.84 1.235 1.912 1.235 3.222 0 4.61-2.805 5.624-5.478 5.921.43.372.814 1.103.814 2.222 0 1.606-.015 2.898-.015 3.293 0 .32.216.694.825.576C20.565 21.796 24 17.297 24 12 24 5.37 18.63 0 12 0z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

const iconByLabel: Record<string, (props: { className?: string }) => ReactNode> = {
  GitHub: GitHubIcon,
  LinkedIn: LinkedInIcon,
  Email: MailIcon,
};

function FadeDivider() {
  return (
    <span
      aria-hidden
      className="mx-0.5 hidden h-6 w-px sm:block"
      style={{
        background:
          "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--accent) 55%, transparent) 35%, color-mix(in srgb, var(--foreground) 25%, transparent) 50%, color-mix(in srgb, var(--accent) 45%, transparent) 65%, transparent 100%)",
      }}
    />
  );
}

/**
 * Site-wide social bar: compact height, fixed to the bottom of the viewport
 * on every page while scrolling.
 */
export function SiteFooter() {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/80 backdrop-blur-md">
      <div className="container-page flex justify-center py-2.5 sm:py-3">
        <nav
          aria-label="Social"
          className="flex flex-wrap items-center justify-center gap-y-1 sm:gap-x-1"
        >
          {socialLinks.map((link, index) => {
            const Icon = iconByLabel[link.label];
            return (
              <div key={link.label} className="flex items-center">
                {index > 0 ? <FadeDivider /> : null}
                <Link
                  href={link.href}
                  className="group flex items-center gap-2 px-3 py-1 font-display text-sm text-muted transition-colors hover:text-accent sm:px-5 sm:text-base"
                  {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {Icon ? (
                    <Icon className="h-4 w-4 shrink-0 text-subtle transition-colors group-hover:text-accent" />
                  ) : null}
                  <span>{link.label}</span>
                </Link>
              </div>
            );
          })}
        </nav>
      </div>
    </footer>
  );
}
