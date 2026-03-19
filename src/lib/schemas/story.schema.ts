import { z } from "zod";

export const createStoryFormSchema = z.object({
  title: z
    .string()
    .refine((v) => v.trim().length > 0, "Título é obrigatório"),
  persona: z
    .string()
    .refine((v) => v.trim().length > 0, "Persona é obrigatória"),
  description: z
    .string()
    .refine((v) => v.trim().length > 0, "Descrição é obrigatória"),
  acceptanceCriteria: z.string().default(""),
  complexity: z.enum(["low", "medium", "high", "very_high"]).default("medium"),
  effort: z.coerce.number().int().min(0).optional(),
  dependencies: z.string().default(""),
  priority: z.coerce.number().int().min(0, "Prioridade deve ser >= 0").default(0),
  businessValue: z.enum(["low", "medium", "high"]).default("medium"),
  status: z.enum(["draft", "ready", "in_progress", "done"]).default("draft"),
  assigneeId: z.string().nullable().optional(),
});

export type CreateStoryFormData = z.infer<typeof createStoryFormSchema>;
