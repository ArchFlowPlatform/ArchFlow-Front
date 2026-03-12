import type { ApiResponse } from "@/types/api.types"

export interface HomeStatus {
  message: string
  updatedAt: string
}

export type HomeStatusResponse = ApiResponse<HomeStatus>
