import axios, { AxiosError } from "axios"

import { env } from "@/lib/env"

const DEFAULT_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
} as const

/**
 * Axios instance for external API calls.
 * baseURL is configurable via NEXT_PUBLIC_API_BASE_URL.
 * All HTTP requests must go through this client or services that use it.
 */
export const httpClient = axios.create({
  baseURL: env.apiBaseUrl ?? "",
  timeout: env.apiTimeoutMs,
  headers: DEFAULT_HEADERS,
})

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<unknown>) => {
    const message =
      error.response?.data && typeof error.response.data === "object" && "message" in error.response.data
        ? String((error.response.data as { message?: unknown }).message)
        : error.message || "Request failed."
    return Promise.reject(new Error(message))
  }
)
