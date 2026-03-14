/**
 * Standard API response envelope.
 * Frontend consumes external API with this format.
 */
export interface ApiResponse<T> {
  message: string;
  success: boolean;
  data: T;
  errors: unknown[];
}
