import type { ApiResponse } from "@/types/api-response"
import { httpClient } from "@/services/api/http-client"

/**
 * Example service: calls an external API and returns typed data.
 * Replace with real resources (e.g. users.service.ts, products.service.ts).
 * All HTTP requests must live in /services; UI must never call httpClient directly.
 */
export async function getExample(): Promise<ApiResponse<{ id: string; name: string }>> {
  const response = await httpClient.get<ApiResponse<{ id: string; name: string }>>("/example")
  const envelope = response.data

  if (!envelope.success) {
    throw new Error(envelope.message ?? "Request failed.")
  }

  return envelope
}
