import { z } from "zod"
import { createEnvelopeSchema } from "@/lib/zod"
import type { HomeStatus } from "@/features/home/types/home.types"

export const HomeStatusSchema: z.ZodType<HomeStatus> = z.object({
  message: z.string().min(1),
  updatedAt: z.string().datetime(),
})

export const HomeStatusResponseSchema = createEnvelopeSchema(HomeStatusSchema)
