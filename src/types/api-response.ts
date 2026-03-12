/**
 * Standard envelope for all external API responses.
 * All HTTP services must return typed responses using this shape.
 */
export interface ApiResponse<T = unknown> {
  message: string
  success: boolean
  data: T
  errors: unknown[]
}
