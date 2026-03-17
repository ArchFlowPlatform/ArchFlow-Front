import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import type { ApiResponse } from "@/types/api";
import { getToken, clearToken } from "@/lib/auth-token";

const DEFAULT_BASE_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api")
    : process.env.API_BASE_URL ?? "http://localhost:3000/api";

const SIGN_IN_PATH = "/signin";

/**
 * HTTP client for API communication.
 * All API calls must go through services that use this client.
 * - Request: injects Authorization Bearer token when available.
 * - Response: on 401, clears token and redirects to sign-in.
 */
function createHttpClient(): AxiosInstance {
  const client = axios.create({
    baseURL: DEFAULT_BASE_URL,
    timeout: 30_000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  client.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 && typeof window !== "undefined") {
        clearToken();
        window.location.href = SIGN_IN_PATH;
      }
      return Promise.reject(error);
    }
  );

  return client;
}

export const httpClient = createHttpClient();

/**
 * Typed GET request. Returns ApiResponse<T>.
 */
export async function get<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const response = await httpClient.get<ApiResponse<T>>(url, config);
  return response.data;
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
