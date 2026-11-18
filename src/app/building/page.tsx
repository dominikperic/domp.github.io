import { FadeIn } from "@/components/ui";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { BuildingCard } from "@/components/BuildingCard";
import { buildingContent } from "@/content/building";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Currently Building",
  description: buildingContent.intro,
  path: "/building",
});

export default function BuildingPage() {
  return (
    <PageShell>
      <FadeIn>
        <SectionHeader
          eyebrow="In progress"
          title={buildingContent.headline}
          description={buildingContent.intro}
        />
      </FadeIn>

      <FadeIn delay={0.06} className="mt-12 grid gap-4 md:grid-cols-2">
        {buildingContent.items.map((item) => (
          <BuildingCard key={item.id} item={item} />
        ))}
      </FadeIn>
    </PageShell>
  );
}
