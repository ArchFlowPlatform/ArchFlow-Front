import type { ApiResponse } from "@/types/api.types"

export interface HomeStatus {
  message: string
  updatedAt: string
}

export type HomeStatusResponse = ApiResponse<HomeStatus>

/** Single row in the status panel (label + value). */
export interface HomeStatusItem {
  label: string
  value: string
}

/** Group of component names for the component map section. */
export interface HomeComponentGroup {
  title: string
  description: string
  items: readonly string[]
}
