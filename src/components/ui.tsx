"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cx } from "@/lib/utils";

export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        "surface p-5 transition-colors hover:border-border-strong hover:bg-card-hover sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
