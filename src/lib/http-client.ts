import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import type { ApiResponse } from "@/types/api";
import { shareInFlightGet } from "@/lib/in-flight-get";

const DEFAULT_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.API_BASE_URL ??
  "http://localhost:5064/api";

const SIGN_IN_PATH = "/signin";

/** Public routes that must never trigger auth redirect (prevents redirect loop). */
const PUBLIC_ROUTES = ["/signin", "/signup"];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * HTTP client for API communication.
 * Integration plan Step 1 (HTTP client + auth), adapted for **httpOnly cookies**:
 * - No `Authorization: Bearer` header; session is sent via `withCredentials: true`.
 * - **401 on GET /auth/me:** do not redirect — caller treats as anonymous (landing, etc.).
 * - **401 on other routes:** redirect to `/signin` when not already on a public route.
 *
 * Backend must set `Access-Control-Allow-Credentials: true` for cookies to work.
 */
function isAuthMeRequest(config: { url?: string }): boolean {
  const path = config.url ?? "";
  return path.includes("/auth/me");
}

function createHttpClient(): AxiosInstance {
  const client = axios.create({
    baseURL: DEFAULT_BASE_URL,
    timeout: 30_000,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 && typeof window !== "undefined") {
        if (error.config && isAuthMeRequest(error.config)) {
          return Promise.reject(error);
        }
        const pathname = window.location.pathname;
        if (!isPublicRoute(pathname)) {
          window.location.href = SIGN_IN_PATH;
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
}

export const httpClient = createHttpClient();

/**
 * Typed GET request. Returns ApiResponse<T>.
 * Identical concurrent GETs (same URL, no AbortSignal) share one request.
 */
export async function get<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  if (config?.signal) {
    const response = await httpClient.get<ApiResponse<T>>(url, config);
    return response.data;
  }
  const key = url;
  return shareInFlightGet(key, async () => {
    const response = await httpClient.get<ApiResponse<T>>(url, config);
    return response.data;
  });
}

/**
 * Typed POST request. Returns ApiResponse<T>.
 */
export async function post<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const response = await httpClient.post<ApiResponse<T>>(url, data, config);
  return response.data;
}

/**
 * Typed PUT request. Returns ApiResponse<T>.
 */
export async function put<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const response = await httpClient.put<ApiResponse<T>>(url, data, config);
  return response.data;
}

/**
 * Typed PATCH request. Returns ApiResponse<T>.
 */
export async function patch<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const response = await httpClient.patch<ApiResponse<T>>(url, data, config);
  return response.data;
}

/**
 * Typed DELETE request. Returns ApiResponse<T>.
 */
export async function del<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const response = await httpClient.delete<ApiResponse<T>>(url, config);
  return response.data;
}
