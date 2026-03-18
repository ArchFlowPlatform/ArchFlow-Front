"use client";

import type { Toast } from "@/hooks/useToast";

interface InlineToastProps {
  toast: Toast | null;
}

const variantStyles: Record<string, string> = {
  error: "bg-red-900/95 border-red-700/40",
  success: "bg-emerald-900/95 border-emerald-700/40",
  info: "bg-[#14121a]/95",
};

export default function InlineToast({ toast }: InlineToastProps) {
  if (!toast) return null;

  const style = variantStyles[toast.variant ?? "info"] ?? variantStyles.info;

  return (
    <div className="pointer-events-none fixed right-5 top-5 z-40 w-full max-w-sm">
      <div
        className={`af-surface-lg af-accent-panel px-4 py-3 shadow-[0_14px_40px_rgba(0,0,0,0.35)] ${style}`}
      >
        <p className="text-sm font-semibold text-white">{toast.title}</p>
        {toast.body && (
          <p className="af-text-secondary mt-1 text-xs leading-relaxed">
            {toast.body}
          </p>
        )}
      </div>
    </div>
  );
}
