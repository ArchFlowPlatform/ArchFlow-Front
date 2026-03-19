"use client";

import { useCallback, useMemo, useState } from "react";
import { z } from "zod";
import { CalendarDays, Plus } from "lucide-react";

import ModalShell from "@/components/ui/ModalShell";
import InlineToast from "@/components/ui/InlineToast";
import { useToast } from "@/hooks/useToast";

import { createSprint } from "@/features/sprints/api/sprints.api";
import type { CreateSprintRequest } from "@/types/requests";
import type { Sprint } from "@/types/sprint";

const inputCls =
  "af-focus-ring w-full rounded-md border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-white/20";
const errCls = "mt-1 text-[11px] text-red-400";
const labelCls =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50";

const formSchema = z
  .object({
    name: z.string().refine((v) => v.trim().length > 0, "Nome é obrigatório"),
    startDate: z.string().min(1, "Data de início é obrigatória"),
    endDate: z.string().min(1, "Data de fim é obrigatória"),
  })
  .refine(
    (data) => {
      // Both inputs are in YYYY-MM-DD; compare as UTC midnights.
      const start = new Date(`${data.startDate}T00:00:00.000Z`).getTime();
      const end = new Date(`${data.endDate}T00:00:00.000Z`).getTime();
      return start < end;
    },
    {
      message: "Data de fim deve ser maior que a data de início",
      path: ["endDate"],
    },
  );

type CreateSprintFormData = z.infer<typeof formSchema>;

function toUtcIsoDate(dateOnly: string): string {
  // Avoid timezone shifts by forcing UTC midnight.
  return `${dateOnly}T00:00:00.000Z`;
}

interface CreateSprintModalProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
  /**
   * Called after API success (sprint created).
   * Parent can `refetch` and/or `setSelectedSprintId`.
   */
  onCreated: (sprint: Sprint) => Promise<void> | void;
}

export default function CreateSprintModal({
  projectId,
  open,
  onClose,
  onCreated,
}: CreateSprintModalProps) {
  const [form, setForm] = useState<CreateSprintFormData>({
    name: "",
    startDate: "",
    endDate: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateSprintFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const { toast, showError, showSuccess } = useToast();

  const reset = useCallback(() => {
    setForm({ name: "", startDate: "", endDate: "" });
    setErrors({});
  }, []);

  const inputWithError = useCallback(
    (field: keyof CreateSprintFormData) => {
      if (!errors[field]) return inputCls;
      return inputCls + " border-red-400/70 focus:border-red-400/70";
    },
    [errors],
  );

  const payload: CreateSprintRequest | null = useMemo(() => {
    // Only convert when valid; still we recompute at submit-time.
    if (!form.name.trim() || !form.startDate || !form.endDate) return null;
    return {
      name: form.name.trim(),
      startDate: toUtcIsoDate(form.startDate),
      endDate: toUtcIsoDate(form.endDate),
    };
  }, [form.endDate, form.name, form.startDate]);

  const handleSubmit = useCallback(async () => {
    const result = formSchema.safeParse(form);
    if (!result.success) {
      const nextErrors: Partial<Record<keyof CreateSprintFormData, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof CreateSprintFormData;
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }

    if (!payload) {
      // Shouldn't happen because schema is valid.
      setErrors({
        endDate: "Dados inválidos. Revise os campos.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const created = await createSprint(projectId, payload);
      await onCreated(created);
      showSuccess("Sprint criada", `A sprint "${created.name}" já está disponível.`);
      onClose();
      reset();
    } catch (e) {
      showError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }, [form, payload, onCreated, onClose, projectId, reset, showError, showSuccess]);

  const handleCancel = useCallback(() => {
    if (submitting) return;
    onClose();
    reset();
  }, [onClose, reset, submitting]);

  return (
    <>
      <InlineToast toast={toast} />
      <ModalShell
        open={open}
        onClose={handleCancel}
        title="Criar Sprint"
        subtitle="Defina nome e intervalo de datas."
        maxWidth="max-w-2xl"
        footer={
          <>
            <button
              type="button"
              onClick={handleCancel}
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
              {submitting ? "Criando…" : <span className="inline-flex items-center gap-2"><Plus className="h-3.5 w-3.5" aria-hidden />Criar</span>}
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
          <fieldset className="space-y-3">
            <legend className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
              Informações da Sprint
            </legend>

            <label className="block">
              <span className={labelCls}>Nome *</span>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                disabled={submitting}
                className={inputWithError("name")}
                placeholder="Ex: Sprint 1 (Planejamento e Entrega)"
                autoFocus
              />
              {errors.name && <p className={errCls}>{errors.name}</p>}
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={labelCls}>Data de início *</span>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1 text-white/40" />
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                    disabled={submitting}
                    className={inputWithError("startDate") + " pl-10"}
                  />
                </div>
                {errors.startDate && <p className={errCls}>{errors.startDate}</p>}
              </label>

              <label className="block">
                <span className={labelCls}>Data de fim *</span>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1 text-white/40" />
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                    disabled={submitting}
                    className={inputWithError("endDate") + " pl-10"}
                  />
                </div>
                {errors.endDate && <p className={errCls}>{errors.endDate}</p>}
              </label>
            </div>
          </fieldset>
        </form>
      </ModalShell>
    </>
  );
}

