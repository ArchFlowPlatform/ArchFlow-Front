function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Extracts a user-facing message from a failed API call (Axios error or `Error`).
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Erro ao conectar. Tente novamente.",
): string {
  if (isRecord(error) && "response" in error) {
    const response = error.response as { data?: unknown } | undefined;
    const data = response?.data;
    if (isRecord(data) && typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
