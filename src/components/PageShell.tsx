import type { ReactNode } from "react";
import { cx } from "@/lib/utils";

export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  // Default vertical padding only when the page does not pass its own spacing classes.
  // Plain string join cannot resolve Tailwind py-* vs pt-*/pb-* conflicts.
  return (
    <main className={cx("container-page flex-1", className ?? "py-12 sm:py-16")}>{children}</main>
  );
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
    <div className="max-w-2xl">
      {eyebrow ? (
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.24em] text-accent">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="font-display text-3xl leading-tight text-foreground sm:text-4xl">{title}</h1>
      {description ? (
        <p className="prose-muted mt-4 max-w-xl text-[15px] sm:text-base">{description}</p>
      ) : null}
      <div className="rule mt-8 max-w-[8rem]" />
    </div>
  );
}
