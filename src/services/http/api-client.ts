import axios, { AxiosError } from "axios"

import { env } from "@/lib/env"
import { createApiClientError } from "@/lib/errors"
import type { ApiError } from "@/types/api.types"

const DEFAULT_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
}

function mapAxiosError(error: AxiosError<unknown>): ApiError {
  const responseData = error.response?.data
  const fallbackMessage = error.message || "Request failed."

  if (
    responseData &&
    typeof responseData === "object" &&
    "error" in responseData &&
    responseData.error &&
    typeof responseData.error === "object"
  ) {
    const apiError = responseData.error as Partial<ApiError>

    return {
      code: apiError.code ?? "REQUEST_FAILED",
      message: apiError.message ?? fallbackMessage,
      status: apiError.status ?? error.response?.status,
      details: apiError.details,
    }
  }

  return {
    code: "REQUEST_FAILED",
    message: fallbackMessage,
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
