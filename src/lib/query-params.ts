export type QueryParamPrimitive = string | number | boolean
export type QueryParamValue =
  | QueryParamPrimitive
  | QueryParamPrimitive[]
  | null
  | undefined

export function createQueryParams(
  params: Record<string, QueryParamValue>
): URLSearchParams {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      continue
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, String(item))
      }

      continue
    }

    searchParams.set(key, String(value))
  }

  return searchParams
}
