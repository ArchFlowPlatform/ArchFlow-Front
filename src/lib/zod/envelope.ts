import { z } from "zod"
import type { ApiResponse } from "@/types/api-response"

/** Zod schema for the standard API response envelope. */
export const apiEnvelopeSchema = z.object({
  message: z.string(),
  success: z.boolean(),
  data: z.unknown(),
  errors: z.array(z.unknown()),
}) satisfies z.ZodType<ApiResponse>

/** Build a schema for a typed envelope (data is T). */
export function createEnvelopeSchema<T extends z.ZodType>(dataSchema: T) {
  return z.object({
    message: z.string(),
    success: z.boolean(),
    data: dataSchema,
    errors: z.array(z.unknown()),
  })
}
