import { cx } from "@/lib/utils/cx";
import type { BadgeProps, BadgeTone } from "../types/landing.types";

const tones: Record<BadgeTone, string> = {
  default: "bg-white/5 text-white/80 hover:bg-white/8",
  accent: "bg-white/5 text-white/80 hover:text-[var(--af-primary)]",
  solid: "bg-white/5 text-white hover:text-[var(--af-primary)] hover:bg-white/7",
  subtle: "bg-white/4 text-white/70 hover:bg-white/6",
};

export default function Badge({ children, tone = "default" }: BadgeProps) {
  return (
    <span
      className={cx(
        "af-surface-sm af-surface-hover inline-flex items-center px-3 py-1 text-xs font-medium transition",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
