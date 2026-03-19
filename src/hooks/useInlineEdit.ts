"use client";

import { useState, useCallback } from "react";

export interface UseInlineEditOptions<T extends Record<string, unknown>> {
  onSave: (changed: Partial<T>) => Promise<void>;
}

export interface UseInlineEditResult<T extends Record<string, unknown>> {
  editingField: keyof T | null;
  editValue: unknown;
  saving: boolean;
  startEdit: (field: keyof T, currentValue: unknown) => void;
  setEditValue: (value: unknown) => void;
  commitEdit: (originalValue: unknown) => Promise<void>;
  cancelEdit: () => void;
}

/**
 * Generic hook for inline single-field editing with dirty checking.
 * Only sends a PATCH when the value actually changed.
 */
export function useInlineEdit<T extends Record<string, unknown>>({
  onSave,
}: UseInlineEditOptions<T>): UseInlineEditResult<T> {
  const [editingField, setEditingField] = useState<keyof T | null>(null);
  const [editValue, setEditValue] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);

  const startEdit = useCallback((field: keyof T, currentValue: unknown) => {
    setEditingField(field);
    setEditValue(currentValue);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingField(null);
    setEditValue(null);
  }, []);

  const commitEdit = useCallback(
    async (originalValue: unknown) => {
      if (editingField === null || saving) return;

      if (editValue === originalValue) {
        cancelEdit();
        return;
      }

      setSaving(true);
      try {
        await onSave({ [editingField]: editValue } as Partial<T>);
        cancelEdit();
      } finally {
        setSaving(false);
      }
    },
    [editingField, editValue, saving, onSave, cancelEdit],
  );

  return {
    editingField,
    editValue,
    saving,
    startEdit,
    setEditValue,
    commitEdit,
    cancelEdit,
  };
}
