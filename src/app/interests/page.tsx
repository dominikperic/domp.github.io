import { FadeIn, Card } from "@/components/ui";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { interestsContent } from "@/content/interests";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Interests",
  description: interestsContent.intro,
  path: "/interests",
});

export default function InterestsPage() {
  return (
    <PageShell>
      <FadeIn>
        <SectionHeader
          eyebrow="Beyond code"
          title={interestsContent.headline}
          description={interestsContent.intro}
        />
      </FadeIn>

      <FadeIn delay={0.06} className="mt-12 grid gap-4 sm:grid-cols-2">
        {interestsContent.items.map((item) => (
          <Card key={item.id} className="flex h-full flex-col gap-3">
            <h2 className="text-lg font-medium tracking-tight">{item.title}</h2>
            <p className="prose-muted text-sm">{item.description}</p>
            {item.tags?.length ? (
              <div className="mt-auto flex flex-wrap gap-2 pt-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border px-2.5 py-1 text-xs text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </Card>
        ))}
      </FadeIn>
    </PageShell>
  );
}
