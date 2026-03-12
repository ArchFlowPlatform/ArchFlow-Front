export interface ApiErrorDetails {
  [key: string]: string | number | boolean | null | string[] | undefined
}

export interface ApiError {
  code: string
  message: string
  status?: number
  details?: ApiErrorDetails
}

export interface ApiResponse<TData, TMeta = undefined> {
  success: boolean
  data?: TData
  error?: ApiError
  meta?: TMeta
}
