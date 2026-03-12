import { z } from "zod"

import { createApiClientError } from "@/lib/errors"
import type { ApiError, ApiResponse } from "@/types/api.types"

const ApiErrorSchema: z.ZodType<ApiError> = z.object({
  code: z.string(),
  message: z.string(),
  status: z.number().int().positive().optional(),
  details: z.record(
    z.string(),
    z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.null(),
      z.array(z.string()),
      z.undefined(),
    ])
  ).optional(),
})

export function createApiResponseSchema<
  TData extends z.ZodType,
  TMeta extends z.ZodType | undefined = undefined,
>(
  dataSchema: TData,
  metaSchema?: TMeta
) {
  return z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: ApiErrorSchema.optional(),
    meta: metaSchema ? metaSchema.optional() : z.undefined().optional(),
  }).superRefine((value, context) => {
    if (value.success && value.data === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Successful responses must include data.",
        path: ["data"],
      })
    }

    if (!value.success && value.error === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Failed responses must include an error payload.",
        path: ["error"],
      })
    }
  })
}

export function parseApiResponse<TData, TMeta = undefined>(
  payload: unknown,
  schema: z.ZodType<ApiResponse<TData, TMeta>>
): ApiResponse<TData, TMeta> {
  const parsedResponse = schema.safeParse(payload)

  if (!parsedResponse.success) {
    throw createApiClientError({
      code: "INVALID_RESPONSE",
      message: "The API returned an invalid response payload.",
      details: {
        issues: parsedResponse.error.issues.map((issue) => issue.message).join(", "),
      },
    })
  }

  const responsePayload = parsedResponse.data

  if (!responsePayload.success) {
    throw createApiClientError(
      responsePayload.error ?? {
        code: "REQUEST_FAILED",
        message: "The API returned an error response.",
      }
    )
  }

  return responsePayload
}
