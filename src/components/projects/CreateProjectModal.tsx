"use client";

import { useCallback, useState } from "react";
import { z } from "zod";
import { FolderPlus } from "lucide-react";

import ModalShell from "@/components/ui/ModalShell";
import InlineToast from "@/components/ui/InlineToast";
import { useToast } from "@/hooks/useToast";
import { getApiErrorMessage } from "@/lib/api-error";
import { createProject } from "@/features/projects/api/projects.api";
import type { CreateProjectRequest } from "@/types/requests";
import type { Project } from "@/types/project";

const inputCls =
  "af-focus-ring w-full rounded-md border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-white/20";
const errCls = "mt-1 text-[11px] text-red-400";
const labelCls =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50";

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Nome deve ter pelo menos 3 caracteres"),
  description: z.string(),
});

type FormData = z.infer<typeof formSchema>;

function toCreatePayload(data: FormData): CreateProjectRequest {
  const name = data.name.trim();
  const description = data.description.trim();
  const payload: CreateProjectRequest = { name };
  if (description) {
    payload.description = description;
  }
  return payload;
}

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  /** After persist + optional parent work (e.g. refetch). */
  onCreated: (project: Project) => Promise<void> | void;
}

export default function CreateProjectModal({
  open,
  onClose,
  onCreated,
}: CreateProjectModalProps) {
  const [form, setForm] = useState<FormData>({ name: "", description: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);

  const { toast, showError } = useToast();

  const reset = useCallback(() => {
    setForm({ name: "", description: "" });
    setErrors({});
  }, []);

  const inputWithError = useCallback(
    (field: keyof FormData) => {
      if (!errors[field]) return inputCls;
      return `${inputCls} border-red-400/70 focus:border-red-400/70`;
    },
    [errors],
  );

  const handleSubmit = useCallback(async () => {
    const result = formSchema.safeParse(form);
    if (!result.success) {
      const next: Partial<Record<keyof FormData, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormData;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    setSubmitting(true);
    try {
      const payload = toCreatePayload(result.data);
      const created = await createProject(payload);
      await onCreated(created);
      onClose();
      reset();
    } catch (e) {
      showError(getApiErrorMessage(e, "Não foi possível criar o projeto."));
    } finally {
      setSubmitting(false);
    }
  }, [form, onClose, onCreated, reset, showError]);

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
        title="Novo projeto"
        subtitle="Nome obrigatório; descrição é opcional."
        maxWidth="max-w-lg"
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
                "Criando…"
              ) : (
                <span className="inline-flex items-center gap-2">
                  <FolderPlus className="h-3.5 w-3.5" aria-hidden />
                  Criar projeto
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
              Dados do projeto
            </legend>

            <label className="block">
              <span className={labelCls}>Nome *</span>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                disabled={submitting}
                className={inputWithError("name")}
                placeholder="Ex: Portal do cliente"
                autoFocus
              />
              {errors.name ? <p className={errCls}>{errors.name}</p> : null}
            </label>

            <label className="block">
              <span className={labelCls}>Descrição</span>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                disabled={submitting}
                rows={3}
                className={inputWithError("description") + " resize-y min-h-[5rem]"}
                placeholder="Opcional — objetivos, contexto, público-alvo…"
              />
              {errors.description ? (
                <p className={errCls}>{errors.description}</p>
              ) : null}
            </label>
          </fieldset>
        </form>
      </ModalShell>
    </>
  );
}
