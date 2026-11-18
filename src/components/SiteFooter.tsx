import Link from "next/link";
import { socialLinks, siteConfig } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="container-page flex flex-col gap-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-foreground">{siteConfig.name}</p>
          <p className="mt-1 text-sm text-subtle">
            Built as a personal space for projects, notes, and exploration.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-muted">
          {socialLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition-colors hover:text-accent"
              {...(link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
