interface SystemBadgeProps {
  children: string;
  className?: string;
}

export default function SystemBadge({
  children,
  className = "",
}: SystemBadgeProps) {
  return (
    <span
      className={`af-surface-sm inline-flex items-center bg-white/5 px-2 py-0.5 text-[10px] text-white/72 ${className}`.trim()}
    >
      {children}
    </span>
  );
}
