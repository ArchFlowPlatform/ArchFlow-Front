import { z } from "zod";

export const ProjectStatusSchema = z.enum(["active", "archived", "deleted"]);

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  ownerId: z.string(),
  status: ProjectStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ProjectSchemaType = z.infer<typeof ProjectSchema>;
