interface ProjectEmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
}

export default function ProjectEmptyState({
  title,
  description,
  actionLabel,
}: ProjectEmptyStateProps) {
  return (
    <section className="af-surface-lg flex min-h-[18rem] flex-col items-center justify-center border border-dashed border-white/10 bg-[#14121a]/45 px-6 py-8 text-center">
      <div className="max-w-[28rem] space-y-3">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <p className="af-text-secondary text-sm leading-relaxed">{description}</p>
        <div className="pt-1">
          <button
            type="button"
            className="af-surface-md af-focus-ring af-accent-hover inline-flex h-9 items-center justify-center px-3 text-sm text-white/76 transition hover:bg-white/[0.03] hover:text-[var(--accent-soft-35)]"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
