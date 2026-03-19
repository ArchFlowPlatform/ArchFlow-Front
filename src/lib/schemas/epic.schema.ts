import { z } from "zod";

export const createEpicFormSchema = z.object({
  name: z.string().refine((v) => v.trim().length > 0, "Nome é obrigatório"),
  description: z.string().default(""),
  businessValue: z.enum(["low", "medium", "high"]).default("medium"),
  status: z.enum(["draft", "active", "completed"]).default("draft"),
  priority: z.coerce.number().int().min(0, "Prioridade deve ser >= 0").default(0),
  color: z.string().default(""),
});

export type CreateEpicFormData = z.infer<typeof createEpicFormSchema>;
