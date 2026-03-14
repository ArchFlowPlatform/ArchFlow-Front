import type { ReactNode } from "react";

interface SectionBlockProps {
  title: string;
  description?: string;
  count: number;
  children: ReactNode;
}

export default function SectionBlock({
  title,
  description,
  count,
  children,
}: SectionBlockProps) {
  return (
    <section className="space-y-3">
      <div className="af-separator-b flex items-start justify-between gap-3 pb-2">
        <div className="min-w-0">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
            {title}
          </h2>
          {description ? (
            <p className="af-text-tertiary mt-1 text-xs">{description}</p>
          ) : null}
        </div>
        <span className="af-surface-sm af-accent-chip inline-flex min-w-6 shrink-0 items-center justify-center px-1.5 py-0.5 text-[10px] text-white/80">
          {count}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </section>
  );
}
