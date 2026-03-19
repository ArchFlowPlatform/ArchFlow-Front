"use client";

import { useCallback, useMemo, useState } from "react";
import ModalShell from "@/components/ui/ModalShell";
import SelectDropdown from "@/components/ui/SelectDropdown";
import { createStoryFormSchema, type CreateStoryFormData } from "@/lib/schemas/story.schema";
import {
  BUSINESS_VALUE_OPTIONS,
  COMPLEXITY_OPTIONS,
  STORY_STATUS_OPTIONS,
} from "@/lib/enum-labels";
import type { CreateStoryRequest } from "@/types/requests";
import type { ProjectMember } from "@/types/project";

interface CreateStoryModalProps {
  open: boolean;
  epicId: number;
  epicName: string;
  members: ProjectMember[];
  onClose: () => void;
  onSubmit: (data: CreateStoryRequest) => Promise<void>;
}

const INITIAL: CreateStoryFormData = {
  title: "",
  persona: "",
  description: "",
  acceptanceCriteria: "",
  complexity: "medium",
  effort: undefined,
  dependencies: "",
  priority: 0,
  businessValue: "medium",
  status: "draft",
  assigneeId: null,
};

const labelCls =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50";
const inputCls =
  "af-focus-ring w-full rounded-md border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-white/20";
const errCls = "mt-1 text-[11px] text-red-400";

export default function CreateStoryModal({
  open,
  epicId,
  epicName,
  members,
  onClose,
  onSubmit,
}: CreateStoryModalProps) {
  const [form, setForm] = useState<CreateStoryFormData>({ ...INITIAL });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateStoryFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const memberOptions = useMemo(
    () => [
      { value: "", label: "Sem responsável" },
      ...members.map((m) => ({ value: m.userId, label: m.user?.name ?? m.userId })),
    ],
    [members],
  );

  function set<K extends keyof CreateStoryFormData>(key: K, value: CreateStoryFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  const validate = useCallback((): CreateStoryFormData | null => {
    const result = createStoryFormSchema.safeParse(form);
    if (result.success) {
      setErrors({});
      return result.data;
    }
    const fieldErrors: typeof errors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof CreateStoryFormData;
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
      const payload: CreateStoryRequest = {
        epicId,
        title: data.title,
        persona: data.persona,
        description: data.description,
        acceptanceCriteria: data.acceptanceCriteria || undefined,
        complexity: data.complexity,
        effort: data.effort,
        dependencies: data.dependencies || undefined,
        priority: data.priority,
        businessValue: data.businessValue,
        status: data.status,
        assigneeId: data.assigneeId || null,
      };
      await onSubmit(payload);
      setForm({ ...INITIAL });
      setErrors({});
      onClose();
    } finally {
      setSubmitting(false);
    }
  }, [validate, submitting, epicId, onSubmit, onClose]);

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
      title="Adicionar User Story"
      subtitle={`Epic: ${epicName}`}
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
            {submitting ? "Criando…" : "Criar Story"}
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
        {/* Section 1 — Core Story */}
        <fieldset className="space-y-3">
          <legend className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
            História Principal
          </legend>

          <label className="block">
            <span className={labelCls}>Título *</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Ex: Cadastro de usuário via e-mail"
              autoFocus
              disabled={submitting}
              className={inputCls}
            />
            {errors.title && <p className={errCls}>{errors.title}</p>}
          </label>

          <label className="block">
            <span className={labelCls}>Persona *</span>
            <input
              type="text"
              value={form.persona}
              onChange={(e) => set("persona", e.target.value)}
              placeholder="Ex: Usuário não autenticado"
              disabled={submitting}
              className={inputCls}
            />
            {errors.persona && <p className={errCls}>{errors.persona}</p>}
          </label>

          <label className="block">
            <span className={labelCls}>Descrição *</span>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Descreva a user story…"
              rows={3}
              disabled={submitting}
              className={inputCls + " resize-y"}
            />
            {errors.description && <p className={errCls}>{errors.description}</p>}
          </label>
        </fieldset>

        {/* Section 2 — Acceptance */}
        <fieldset className="space-y-3">
          <label className="block">
            <span className={labelCls}>Critérios de Aceite</span>
            <textarea
              value={form.acceptanceCriteria}
              onChange={(e) => set("acceptanceCriteria", e.target.value)}
              placeholder="- Dado que…&#10;- Quando…&#10;- Então…"
              rows={4}
              disabled={submitting}
              className={inputCls + " resize-y"}
            />
          </label>
        </fieldset>

        {/* Section 3 — Planning */}
        <fieldset className="space-y-3">
          <legend className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
            Planejamento
          </legend>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <span className={labelCls}>Complexidade</span>
              <SelectDropdown
                value={form.complexity}
                options={COMPLEXITY_OPTIONS}
                onChange={(v) => set("complexity", v as CreateStoryFormData["complexity"])}
                disabled={submitting}
              />
            </div>

            <label className="block">
              <span className={labelCls}>Esforço</span>
              <input
                type="number"
                min={0}
                value={form.effort ?? ""}
                onChange={(e) =>
                  set("effort", e.target.value === "" ? undefined : Number(e.target.value))
                }
                placeholder="Story points"
                disabled={submitting}
                className={inputCls}
              />
            </label>

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

            <div>
              <span className={labelCls}>Valor de Negócio</span>
              <SelectDropdown
                value={form.businessValue}
                options={BUSINESS_VALUE_OPTIONS}
                onChange={(v) => set("businessValue", v as CreateStoryFormData["businessValue"])}
                disabled={submitting}
              />
            </div>
          </div>

          <label className="block">
            <span className={labelCls}>Dependências</span>
            <input
              type="text"
              value={form.dependencies}
              onChange={(e) => set("dependencies", e.target.value)}
              placeholder="Ex: Story #12, API de pagamento"
              disabled={submitting}
              className={inputCls}
            />
          </label>
        </fieldset>

        {/* Section 4 — Assignment */}
        <fieldset className="space-y-3">
          <legend className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
            Atribuição
          </legend>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <span className={labelCls}>Status</span>
              <SelectDropdown
                value={form.status}
                options={STORY_STATUS_OPTIONS}
                onChange={(v) => set("status", v as CreateStoryFormData["status"])}
                disabled={submitting}
              />
            </div>

            <div>
              <span className={labelCls}>Responsável</span>
              <SelectDropdown
                value={form.assigneeId ?? ""}
                options={memberOptions}
                onChange={(v) => set("assigneeId", v || null)}
                disabled={submitting}
              />
            </div>
          </div>
        </fieldset>
      </form>
    </ModalShell>
  );
}
