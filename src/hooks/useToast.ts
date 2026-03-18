"use client";

import { useState, useEffect, useCallback } from "react";

export interface Toast {
  title: string;
  body: string;
  variant?: "error" | "success" | "info";
}

export interface UseToastResult {
  toast: Toast | null;
  showToast: (toast: Toast) => void;
  showError: (message: string) => void;
  showSuccess: (title: string, body?: string) => void;
  dismiss: () => void;
}

const AUTO_DISMISS_MS = 4200;

/**
 * Lightweight toast state for a single page/component.
 * Renders nothing on its own — pair with `<InlineToast>` or read `toast` directly.
 */
export function useToast(): UseToastResult {
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), AUTO_DISMISS_MS);
    return () => window.clearTimeout(id);
  }, [toast]);

  const showToast = useCallback((t: Toast) => setToast(t), []);

  const showError = useCallback(
    (message: string) =>
      setToast({ title: "Erro", body: message, variant: "error" }),
    []
  );

  const showSuccess = useCallback(
    (title: string, body = "") =>
      setToast({ title, body, variant: "success" }),
    []
  );

  const dismiss = useCallback(() => setToast(null), []);

  return { toast, showToast, showError, showSuccess, dismiss };
}
