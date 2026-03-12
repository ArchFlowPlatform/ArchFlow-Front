import type { ApiError } from "@/types/api.types"

export class ApiClientError extends Error {
  public readonly code: string
  public readonly status?: number
  public readonly details?: ApiError["details"]

  constructor(error: ApiError) {
    super(error.message)
    this.name = "ApiClientError"
    this.code = error.code
    this.status = error.status
    this.details = error.details
  }
}

export function createApiClientError(error: ApiError): ApiClientError {
  return new ApiClientError(error)
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return "An unexpected error occurred."
}
