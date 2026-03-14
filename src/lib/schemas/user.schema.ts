import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  type: z.string().optional(),
  passwordHash: z.string().optional(),
  avatarUrl: z.string().url().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UserSchemaType = z.infer<typeof UserSchema>;
