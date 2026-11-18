import type { ReactNode } from "react";
import { cx } from "@/lib/utils";

export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return <main className={cx("container-page flex-1 py-12 sm:py-16", className)}>{children}</main>;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-accent">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
      {description ? <p className="prose-muted mt-4 text-base sm:text-lg">{description}</p> : null}
    </div>
  );
}
