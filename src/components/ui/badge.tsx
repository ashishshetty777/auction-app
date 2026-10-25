import * as React from "react";
import { cn } from "@/lib/utils";
import { CATEGORY_META } from "@/lib/constants";
import { PlayerCategory } from "@/types";

/** Category tag: a solid ink chip with night text. The label is always written out. */
function CategoryTag({
  category,
  size = "sm",
  className,
}: {
  category: PlayerCategory;
  size?: "sm" | "md" | "lg" | "stage";
  className?: string;
}) {
  const meta = CATEGORY_META[category];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[3px] font-display font-bold uppercase leading-none tracking-[0.08em] text-night",
        meta.fill,
        size === "sm" && "h-5 px-1.5 text-[12px]",
        size === "md" && "h-7 px-2.5 text-[15px]",
        size === "lg" && "h-9 px-3 text-xl",
        size === "stage" && "h-[clamp(2.5rem,4vw,4.5rem)] px-[0.6em] text-[clamp(1.5rem,2.6vw,3rem)]",
        className
      )}
    >
      {meta.label}
    </span>
  );
}

/** Small quiet status pill. */
function StatusPill({
  tone = "neutral",
  className,
  children,
}: {
  tone?: "neutral" | "sold" | "live";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-[12px] font-semibold uppercase tracking-[0.08em]",
        tone === "neutral" && "border-rule-strong text-ink-2",
        tone === "sold" && "border-ball/60 bg-ball/15 text-[#ff9aa0]",
        tone === "live" && "border-turf/50 bg-turf/10 text-turf",
        className
      )}
    >
      {children}
    </span>
  );
}

export { CategoryTag, StatusPill };
