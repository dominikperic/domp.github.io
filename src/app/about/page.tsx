import { FadeIn, Card } from "@/components/ui";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { aboutContent } from "@/content/about";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "About",
  description: aboutContent.intro,
  path: "/about",
});

export default function AboutPage() {
  return (
    <PageShell>
      <FadeIn>
        <SectionHeader
          eyebrow="About"
          title="Background and focus"
          description={aboutContent.intro}
        />
      </FadeIn>

      <FadeIn delay={0.05} className="mt-12 grid gap-4 lg:grid-cols-3">
        {aboutContent.focusAreas.map((area) => (
          <Card key={area.title}>
            <h2 className="text-lg font-medium tracking-tight">{area.title}</h2>
            <p className="prose-muted mt-3 text-sm">{area.description}</p>
          </Card>
        ))}
      </FadeIn>

      <FadeIn delay={0.1} className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <p className="text-xs uppercase tracking-[0.16em] text-accent">Education</p>
          <h2 className="mt-3 text-xl font-medium tracking-tight">
            {aboutContent.education.school}
          </h2>
          <p className="mt-2 text-muted">{aboutContent.education.degree}</p>
          <p className="prose-muted mt-4 text-sm">{aboutContent.education.note}</p>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-[0.16em] text-accent">Currently focused on</p>
          <ul className="mt-4 space-y-3">
            {aboutContent.currentlyFocusedOn.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-muted">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </FadeIn>

      <FadeIn delay={0.15} className="mt-12">
        <h2 className="text-xl font-medium tracking-tight">Path so far</h2>
        <div className="mt-6 space-y-4">
          {aboutContent.timeline.map((item) => (
            <Card key={item.title} className="grid gap-2 sm:grid-cols-[8rem_1fr]">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-subtle">{item.label}</p>
                {item.period ? (
                  <p className="mt-1 text-sm text-muted">{item.period}</p>
                ) : null}
              </div>
              <div>
                <h3 className="font-medium text-foreground">{item.title}</h3>
                <p className="prose-muted mt-2 text-sm">{item.detail}</p>
              </div>
            </Card>
          ))}
        </div>
      </FadeIn>
    </PageShell>
  );
}
