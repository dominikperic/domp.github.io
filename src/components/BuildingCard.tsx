import Link from "next/link";
import type { BuildingItem } from "@/content/building";
import { buildingStatusLabel } from "@/content/building";
import { Card } from "@/components/ui";

export function BuildingCard({ item }: { item: BuildingItem }) {
  return (
    <Card className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.16em] text-accent">
          {buildingStatusLabel[item.status]}
        </p>
        {item.updatedLabel ? (
          <p className="text-xs text-subtle">{item.updatedLabel}</p>
        ) : null}
      </div>
      <h3 className="text-lg font-medium tracking-tight">{item.title}</h3>
      <p className="prose-muted text-sm">{item.summary}</p>
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
      {item.link ? (
        <Link
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="pt-1 text-sm text-muted transition-colors hover:text-accent"
        >
          Open link →
        </Link>
      ) : null}
    </Card>
  );
}
