import axios, { type AxiosRequestConfig } from "axios";

import { env } from "@/env";

export const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Axios's default JSON Content-Type forces a FormData body to be
// JSON.stringify-ed, corrupting the upload. Strip it so the adapter can set
// its own multipart boundary instead.
apiClient.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    config.headers.delete("Content-Type");
  }
  return config;
});

export class ApiError extends Error {
  readonly status?: number;
  readonly data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function extractMessage(data: unknown, fallback: string): string {
  if (
    data &&
    typeof data === "object" &&
    "message" in data &&
    typeof (data as { message?: unknown }).message === "string"
  ) {
    return (data as { message: string }).message;
  }
  return fallback;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;
      return Promise.reject(
        new ApiError(extractMessage(data, error.message), status, data),
      );
    }
    return Promise.reject(error);
  },
);

type RequestConfig = Omit<AxiosRequestConfig, "url" | "method">;

async function unwrap<T>(promise: Promise<{ data: T }>): Promise<T> {
  const { data } = await promise;
  return data;
}

export const api = {
  get: <T>(url: string, config?: RequestConfig) =>
    unwrap<T>(apiClient.get<T>(url, config)),

  post: <T, D = unknown>(url: string, data?: D, config?: RequestConfig) =>
    unwrap<T>(apiClient.post<T>(url, data, config)),

  postForm: <T>(url: string, data: FormData, config?: RequestConfig) =>
    unwrap<T>(apiClient.post<T>(url, data, config)),

  put: <T, D = unknown>(url: string, data?: D, config?: RequestConfig) =>
    unwrap<T>(apiClient.put<T>(url, data, config)),

  putForm: <T>(url: string, data: FormData, config?: RequestConfig) =>
    unwrap<T>(apiClient.put<T>(url, data, config)),

  patch: <T, D = unknown>(url: string, data?: D, config?: RequestConfig) =>
    unwrap<T>(apiClient.patch<T>(url, data, config)),

  patchForm: <T>(url: string, data: FormData, config?: RequestConfig) =>
    unwrap<T>(apiClient.patch<T>(url, data, config)),

  delete: <T>(url: string, config?: RequestConfig) =>
    unwrap<T>(apiClient.delete<T>(url, config)),
};
