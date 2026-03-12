import { apiClient } from "@/services/http/api-client"
import { parseApiResponse } from "@/services/http/api-response"
import { createApiClientError } from "@/lib/errors"
import { createQueryParams } from "@/lib/query-params"
import { HomeStatusResponseSchema } from "@/features/home/schemas/home.schema"
import type { HomeStatus } from "@/features/home/types/home.types"

export async function getHomeStatus(): Promise<HomeStatus> {
  const searchParams = createQueryParams({ source: "home" })
  const response = await apiClient.get(`/api/home/status?${searchParams.toString()}`)
  const parsedResponse = parseApiResponse(response.data, HomeStatusResponseSchema)

  if (!parsedResponse.data) {
    throw createApiClientError({
      code: "MISSING_HOME_STATUS",
      message: "The home status response did not include data.",
    })
  }

  return parsedResponse.data
}
