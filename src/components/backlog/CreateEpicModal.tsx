"use client";

import { useCallback, useState } from "react";
import ModalShell from "@/components/ui/ModalShell";
import SelectDropdown from "@/components/ui/SelectDropdown";
import { createEpicFormSchema, type CreateEpicFormData } from "@/lib/schemas/epic.schema";
import {
  BUSINESS_VALUE_OPTIONS,
  EPIC_STATUS_OPTIONS,
} from "@/lib/enum-labels";
import type { CreateEpicRequest } from "@/types/requests";

interface CreateEpicModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEpicRequest) => Promise<void>;
}

const INITIAL: CreateEpicFormData = {
  name: "",
  description: "",
  businessValue: "medium",
  status: "draft",
  priority: 0,
  color: "",
};

const labelCls =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50";
const inputCls =
  "af-focus-ring w-full rounded-md border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-white/20";
const errCls = "mt-1 text-[11px] text-red-400";

export default function CreateEpicModal({
  open,
  onClose,
  onSubmit,
}: CreateEpicModalProps) {
  const [form, setForm] = useState<CreateEpicFormData>({ ...INITIAL });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateEpicFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof CreateEpicFormData>(key: K, value: CreateEpicFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  const validate = useCallback((): CreateEpicFormData | null => {
    const result = createEpicFormSchema.safeParse(form);
    if (result.success) {
      setErrors({});
      return result.data;
    }
    const fieldErrors: typeof errors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof CreateEpicFormData;
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    setErrors(fieldErrors);
    return null;
  }, [form]);

  const handleSubmit = useCallback(async () => {
    const data = validate();
    if (!data || submitting) return;
    setSubmitting(true);
    try {
      const payload: CreateEpicRequest = {
        name: data.name,
        description: data.description || undefined,
        businessValue: data.businessValue,
        status: data.status,
        priority: data.priority,
        color: data.color || undefined,
      };
      await onSubmit(payload);
      setForm({ ...INITIAL });
      setErrors({});
      onClose();
    } finally {
      setSubmitting(false);
    }
  }, [validate, submitting, onSubmit, onClose]);

  const handleClose = useCallback(() => {
    if (submitting) return;
    setForm({ ...INITIAL });
    setErrors({});
    onClose();
  }, [submitting, onClose]);

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      title="Criar Epic"
      subtitle="Adicione um novo epic ao backlog do projeto."
      maxWidth="max-w-2xl"
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="af-focus-ring af-surface-md px-4 py-2 text-xs font-medium text-white/70 transition hover:text-white/90 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting}
            className="af-focus-ring af-surface-md af-accent-hover px-4 py-2 text-xs font-medium text-white/90 transition disabled:opacity-50"
          >
            {submitting ? "Criando…" : "Criar Epic"}
          </button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
        className="space-y-5"
      >
        {/* Section 1 — Basic Info */}
        <fieldset className="space-y-3">
          <legend className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
            Informações Básicas
          </legend>

          <label className="block">
            <span className={labelCls}>Nome *</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ex: Autenticação de usuários"
              autoFocus
              disabled={submitting}
              className={inputCls}
            />
            {errors.name && <p className={errCls}>{errors.name}</p>}
          </label>

          <label className="block">
            <span className={labelCls}>Descrição</span>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Descreva o epic…"
              rows={3}
              disabled={submitting}
              className={inputCls + " resize-y"}
            />
          </label>
        </fieldset>

        {/* Section 2 — Classification */}
        <fieldset className="space-y-3">
          <legend className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
            Classificação
          </legend>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <span className={labelCls}>Valor de Negócio</span>
              <SelectDropdown
                value={form.businessValue}
                options={BUSINESS_VALUE_OPTIONS}
                onChange={(v) => set("businessValue", v as CreateEpicFormData["businessValue"])}
                disabled={submitting}
              />
            </div>

            <div>
              <span className={labelCls}>Status</span>
              <SelectDropdown
                value={form.status}
                options={EPIC_STATUS_OPTIONS}
                onChange={(v) => set("status", v as CreateEpicFormData["status"])}
                disabled={submitting}
              />
            </div>
          </div>
        </fieldset>

        {/* Section 3 — Metadata */}
        <fieldset className="space-y-3">
          <legend className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
            Metadados
          </legend>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={labelCls}>Prioridade</span>
              <input
                type="number"
                min={0}
                value={form.priority}
                onChange={(e) => set("priority", Number(e.target.value))}
                disabled={submitting}
                className={inputCls}
              />
              {errors.priority && <p className={errCls}>{errors.priority}</p>}
            </label>

            <label className="block">
              <span className={labelCls}>Cor</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color || "#3498db"}
                  onChange={(e) => set("color", e.target.value)}
                  disabled={submitting}
                  className="h-10 w-10 shrink-0 cursor-pointer rounded border border-white/10 bg-transparent"
                />
                <input
                  type="text"
                  value={form.color}
                  onChange={(e) => set("color", e.target.value)}
                  placeholder="#3498db"
                  disabled={submitting}
                  className={inputCls}
                />
              </div>
            </label>
          </div>
        </fieldset>
      </form>
    </ModalShell>
  );
}
