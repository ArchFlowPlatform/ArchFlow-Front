/**
 * Error handling helpers for the frontend.
 * Services throw plain Error; UI consumes processed results.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return "An unexpected error occurred."
}
