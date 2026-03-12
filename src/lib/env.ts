import { z } from "zod"

const PublicEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.url().optional(),
  NEXT_PUBLIC_API_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
})

const parsedEnv = PublicEnvSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_API_TIMEOUT_MS: process.env.NEXT_PUBLIC_API_TIMEOUT_MS,
})

export const env = {
  apiBaseUrl: parsedEnv.NEXT_PUBLIC_API_BASE_URL,
  apiTimeoutMs: parsedEnv.NEXT_PUBLIC_API_TIMEOUT_MS,
} as const
