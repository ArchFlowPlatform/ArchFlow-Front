"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Save } from "lucide-react";
import { z } from "zod";

import ModalShell from "@/components/ui/ModalShell";
import InlineToast from "@/components/ui/InlineToast";
import { useToast } from "@/hooks/useToast";

import { updateSprint } from "@/features/sprints/api/sprints.api";

import type { UpdateSprintRequest } from "@/types/requests";
import type { Sprint } from "@/types/sprint";

const inputCls =
  "af-focus-ring w-full rounded-md border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-white/20";
const errCls = "mt-1 text-[11px] text-red-400";
const labelCls =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50";

const formSchema = z
  .object({
    name: z.string().refine((v) => v.trim().length > 0, "Nome é obrigatório"),
    goal: z.string().optional(),
    executionPlan: z.string().optional(),
    capacityHours: z.string().optional(),
    startDate: z.string().min(1, "Data de início é obrigatória"),
    endDate: z.string().min(1, "Data de fim é obrigatória"),
  })
  .refine(
    (data) => {
      const raw = (data.capacityHours ?? "").trim();
      if (raw === "") return true; // optional
      const value = Number(raw);
      return Number.isFinite(value) && Number.isInteger(value) && value >= 0;
    },
    {
      message: "Capacidade deve ser um número inteiro >= 0",
      path: ["capacityHours"],
    },
  )
  .refine(
    (data) => {
      const start = new Date(`${data.startDate}T00:00:00.000Z`).getTime();
      const end = new Date(`${data.endDate}T00:00:00.000Z`).getTime();
      return start < end;
    },
    {
      message: "Data de fim deve ser maior que a data de início",
      path: ["endDate"],
    },
  );

type EditSprintFormData = z.infer<typeof formSchema>;

function toUtcIsoDate(dateOnly: string): string {
  return `${dateOnly}T00:00:00.000Z`;
}

function toDateInputValue(dateOrDateTime: string): string {
  // Accept either date-only ("YYYY-MM-DD") or ISO datetime.
  if (!dateOrDateTime) return "";
  return dateOrDateTime.slice(0, 10);
}

interface EditSprintModalProps {
  projectId: string;
  sprint: Sprint;
  open: boolean;
  onClose: () => void;
  onUpdated: (sprint: Sprint) => Promise<void> | void;
}

export default function EditSprintModal({
  projectId,
  sprint,
  open,
  onClose,
  onUpdated,
}: EditSprintModalProps) {
  const [form, setForm] = useState<EditSprintFormData>({
    name: "",
    goal: "",
    executionPlan: "",
    capacityHours: "",
    startDate: "",
    endDate: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof EditSprintFormData, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);

  const { toast, showError, showSuccess } = useToast();

  const reset = useCallback(() => {
    setForm({
      name: sprint?.name ?? "",
      goal: sprint?.goal ?? "",
      executionPlan: sprint?.executionPlan ?? "",
      capacityHours:
        typeof sprint?.capacityHours === "number"
          ? String(sprint.capacityHours)
          : "",
      startDate: sprint?.startDate ? toDateInputValue(sprint.startDate) : "",
      endDate: sprint?.endDate ? toDateInputValue(sprint.endDate) : "",
    });
    setErrors({});
  }, [sprint]);

  // When modal opens or sprint changes, prefill.
  useEffect(() => {
    if (!open) return;
    reset();
  }, [open, reset]);

  const inputWithError = useCallback(
    (field: keyof EditSprintFormData) => {
      if (!errors[field]) return inputCls;
      return inputCls + " border-red-400/70 focus:border-red-400/70";
    },
    [errors],
  );

  const payload: UpdateSprintRequest | null = useMemo(() => {
    if (!open) return null;

    const capacityRaw = form.capacityHours?.trim() ?? "";
    const capacityHours =
      capacityRaw === "" ? undefined : Number(capacityRaw);

    if (!form.name.trim() || !form.startDate || !form.endDate) return null;

    // Don't trim multi-line fields aggressively; only trim at the edges.
    const nextGoal = (form.goal ?? "").trim();
    const nextExecutionPlan = (form.executionPlan ?? "").trim();
    const next: UpdateSprintRequest = {
      name: form.name.trim(),
      goal: nextGoal === "" ? undefined : nextGoal,
      executionPlan: nextExecutionPlan === "" ? undefined : nextExecutionPlan,
      startDate: toUtcIsoDate(form.startDate),
      endDate: toUtcIsoDate(form.endDate),
    };

    if (capacityHours !== undefined) {
      next.capacityHours = capacityHours;
    }

    return next;
  }, [form, open]);

  const handleSubmit = useCallback(async () => {
    const result = formSchema.safeParse(form);
    if (!result.success) {
      const nextErrors: Partial<Record<keyof EditSprintFormData, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof EditSprintFormData;
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }

    if (!payload) return;
    if (!sprint?.id) {
      showError("Nenhuma sprint selecionada para editar.");
      return;
    }

    setSubmitting(true);
    try {
      const updated = await updateSprint(projectId, sprint.id, payload);
      await onUpdated(updated);
      showSuccess("Sprint atualizada", `A sprint "${updated.name}" foi atualizada.`);
      onClose();
      reset();
    } catch (e) {
      showError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }, [
    form,
    payload,
    projectId,
    sprint,
    onUpdated,
    onClose,
    reset,
    showError,
    showSuccess,
  ]);

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
        title="Editar Sprint"
        subtitle="Atualize nome e intervalo de datas."
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
              {submitting ? (
                "Salvando…"
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Save className="h-3.5 w-3.5" aria-hidden />
                  Salvar
                </span>
              )}
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
                    onChange={(e) =>
                      setForm((p) => ({ ...p, startDate: e.target.value }))
                    }
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
                    onChange={(e) =>
                      setForm((p) => ({ ...p, endDate: e.target.value }))
                    }
                    disabled={submitting}
                    className={inputWithError("endDate") + " pl-10"}
                  />
                </div>
                {errors.endDate && <p className={errCls}>{errors.endDate}</p>}
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={labelCls}>Capacidade (horas)</span>
                <input
                  inputMode="numeric"
                  value={form.capacityHours ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, capacityHours: e.target.value }))
                  }
                  disabled={submitting}
                  className={inputWithError("capacityHours")}
                  placeholder="Ex: 40"
                />
              </label>

              <label className="block">
                <span className={labelCls}>Nome/Objetivo (goal)</span>
                <textarea
                  value={form.goal ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, goal: e.target.value }))
                  }
                  disabled={submitting}
                  className={inputWithError("goal")}
                  placeholder="Objetivo da sprint (opcional)"
                  rows={3}
                />
              </label>
            </div>

            <label className="block">
              <span className={labelCls}>Plano de execução</span>
              <textarea
                value={form.executionPlan ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, executionPlan: e.target.value }))
                }
                disabled={submitting}
                className={inputWithError("executionPlan")}
                placeholder="Como a sprint será executada (opcional)"
                rows={3}
              />
            </label>
          </fieldset>
        </form>
      </ModalShell>
    </>
  );
}

