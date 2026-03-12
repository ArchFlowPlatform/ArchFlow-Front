import axios, { AxiosError } from "axios"

import { env } from "@/lib/env"
import { createApiClientError } from "@/lib/errors"
import type { ApiError } from "@/types/api.types"

const DEFAULT_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
} as const

const ERROR_CODE_FALLBACK = "REQUEST_FAILED"
const FALLBACK_MESSAGE = "Request failed."

function isApiErrorPayload(value: unknown): value is Record<string, unknown> & { error: object } {
  return (
    value !== null &&
    typeof value === "object" &&
    "error" in value &&
    value.error !== null &&
    typeof value.error === "object"
  )
}

function mapAxiosError(error: AxiosError<unknown>): ApiError {
  const responseData = error.response?.data
  const message = error.message || FALLBACK_MESSAGE

  if (responseData && isApiErrorPayload(responseData)) {
    const apiError = responseData.error as Partial<ApiError>
    return {
      code: apiError.code ?? ERROR_CODE_FALLBACK,
      message: apiError.message ?? message,
      status: apiError.status ?? error.response?.status,
      details: apiError.details,
    }
  }

  return {
    code: ERROR_CODE_FALLBACK,
    message,
    status: error.response?.status,
  }
}

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeoutMs,
  headers: DEFAULT_HEADERS,
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<unknown>) => {
    return Promise.reject(createApiClientError(mapAxiosError(error)))
  }
)
