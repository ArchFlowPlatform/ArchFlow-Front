"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Visual variant: "danger" shows red confirm button (default), "neutral" shows accent. */
  variant?: "danger" | "neutral";
  loading?: boolean;
}

/**
 * Confirmation dialog for destructive or important actions.
 * Focuses the cancel button on open so accidental Enter doesn't confirm.
 */
export default function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  const confirmClassName =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-500 focus:ring-red-500/40 text-white"
      : "af-accent-hover text-white/90";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <div
        className="af-surface-lg w-full max-w-md bg-[#14121a]/96 px-5 py-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          {variant === "danger" && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/15">
              <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            {description && (
              <p className="af-text-secondary mt-1.5 text-xs leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="af-focus-ring af-surface-md px-4 py-2 text-xs font-medium text-white/70 transition hover:text-white/90 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`af-focus-ring af-surface-md px-4 py-2 text-xs font-medium transition disabled:opacity-50 ${confirmClassName}`}
          >
            {loading ? "Aguarde…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
