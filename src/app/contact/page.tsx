import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { FadeIn, Card } from "@/components/ui";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { siteConfig, socialLinks } from "@/content/site";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Contact",
  description: "Ways to reach Dominik Peric across GitHub, LinkedIn, and email.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <PageShell>
      <FadeIn>
        <SectionHeader
          eyebrow="Contact"
          title="Say hello"
          description="The best way to reach me is through the links below. Replace the placeholder LinkedIn and email entries in src/content/site.ts with your real details."
        />
      </FadeIn>

      <FadeIn delay={0.06} className="mt-12 grid gap-4 sm:grid-cols-2">
        {socialLinks.map((link) => (
          <Card key={link.label} className="group">
            <Link
              href={link.href}
              className="flex items-start justify-between gap-4"
              {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-subtle">Channel</p>
                <h2 className="mt-2 text-xl font-medium tracking-tight group-hover:text-accent">
                  {link.label}
                </h2>
                <p className="mt-3 break-all text-sm text-muted">{link.href}</p>
              </div>
              {link.label === "Email" ? (
                <Mail className="h-4 w-4 text-muted" />
              ) : (
                <ArrowUpRight className="h-4 w-4 text-muted" />
              )}
            </Link>
          </Card>
        ))}
      </FadeIn>

      <FadeIn delay={0.1} className="mt-8">
        <Card>
          <p className="text-sm text-muted">
            Availability note: {siteConfig.availability}. This page intentionally avoids forms for
            now — keep contact simple until you need richer intake.
          </p>
        </Card>
      </FadeIn>
    </PageShell>
  );
}
