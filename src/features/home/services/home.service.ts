import type { ApiResponse } from "@/types/api-response"
import { httpClient } from "@/services/api/http-client"
import { createQueryParams } from "@/lib/query-params"
import { HomeStatusResponseSchema } from "@/features/home/schemas/home.schema"
import type { HomeStatus } from "@/features/home/types/home.types"

/** External API path for status (configure baseURL via NEXT_PUBLIC_API_BASE_URL). */
const STATUS_PATH = "/status"

export async function getHomeStatus(): Promise<HomeStatus> {
  const search = createQueryParams({ source: "home" }).toString()
  const url = search ? `${STATUS_PATH}?${search}` : STATUS_PATH
  const response = await httpClient.get<ApiResponse<HomeStatus>>(url)
  const parsed = HomeStatusResponseSchema.safeParse(response.data)

  if (!parsed.success) {
    throw new Error("Invalid response from external API.")
  }

  const envelope = parsed.data
  if (!envelope.success || envelope.data == null) {
    throw new Error(envelope.message ?? "Request failed.")
  }

  return envelope.data
}
