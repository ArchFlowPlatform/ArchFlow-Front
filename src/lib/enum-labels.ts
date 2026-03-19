import type {
  BusinessValue,
  EpicStatus,
  UserStoryStatus,
  UserStoryComplexity,
} from "@/types/enums";

export interface EnumOption<V extends string = string> {
  readonly value: V;
  readonly label: string;
  /** Tailwind classes for badge background + text color. */
  readonly cls: string;
}

export const BUSINESS_VALUE_OPTIONS: readonly EnumOption<BusinessValue>[] = [
  { value: "low", label: "Baixo", cls: "bg-slate-500/20 text-slate-300" },
  { value: "medium", label: "Médio", cls: "bg-blue-500/20 text-blue-300" },
  { value: "high", label: "Alto", cls: "bg-emerald-500/20 text-emerald-300" },
] as const;

export const EPIC_STATUS_OPTIONS: readonly EnumOption<EpicStatus>[] = [
  { value: "draft", label: "Rascunho", cls: "bg-slate-500/20 text-slate-300" },
  { value: "active", label: "Ativo", cls: "bg-blue-500/20 text-blue-300" },
  { value: "completed", label: "Concluído", cls: "bg-emerald-500/20 text-emerald-300" },
] as const;

export const STORY_STATUS_OPTIONS: readonly EnumOption<UserStoryStatus>[] = [
  { value: "draft", label: "Rascunho", cls: "bg-slate-500/20 text-slate-300" },
  { value: "ready", label: "Pronta", cls: "bg-blue-500/20 text-blue-300" },
  { value: "in_progress", label: "Em andamento", cls: "bg-amber-500/20 text-amber-300" },
  { value: "done", label: "Concluída", cls: "bg-emerald-500/20 text-emerald-300" },
] as const;

export const COMPLEXITY_OPTIONS: readonly EnumOption<UserStoryComplexity>[] = [
  { value: "low", label: "Baixa", cls: "bg-emerald-500/20 text-emerald-300" },
  { value: "medium", label: "Média", cls: "bg-amber-500/20 text-amber-300" },
  { value: "high", label: "Alta", cls: "bg-red-500/20 text-red-300" },
  { value: "very_high", label: "Muito Alta", cls: "bg-red-600/25 text-red-300" },
] as const;

export function getLabelFor<V extends string>(
  options: readonly EnumOption<V>[],
  value: string | null | undefined,
): string {
  if (!value) return "—";
  const match = options.find((o) => o.value === value);
  return match?.label ?? value;
}

export function getBadgeFor<V extends string>(
  options: readonly EnumOption<V>[],
  value: string | null | undefined,
): { label: string; cls: string } {
  if (!value) return { label: "—", cls: "" };
  const match = options.find((o) => o.value === value);
  return match
    ? { label: match.label, cls: match.cls }
    : { label: value, cls: "" };
}
