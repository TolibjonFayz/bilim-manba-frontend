import { useRuntimeConfig } from "#app";
import axios from "axios";

export const useApi = () => {
  const config = useRuntimeConfig();

  const request = async <T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (process.client) {
      const token = localStorage.getItem("access_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${config.public.apiBase}${endpoint}`, {
      ...options,
      headers,
    });

    // 401 — token eskirgan
    if (response.status === 401) {
      if (process.client) {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
      throw new Error("Sessiya tugadi");
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Xato yuz berdi");
    }

    return data as T;
  };

  return {
    get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),

    post: <T>(endpoint: string, body: unknown) =>
      request<T>(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      }),

    put: <T>(endpoint: string, body: unknown) =>
      request<T>(endpoint, {
        method: "PUT",
        body: JSON.stringify(body),
      }),

    delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
  };
};

export const useApiClient = () => {
  const config = useRuntimeConfig();

  const axiosClient = axios.create({
    baseURL: config.public.apiBase,
  });

  axiosClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("access_token");

      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      } else {
        console.warn("API Request without token:", {
          method: config.method?.toUpperCase(),
          url: config.url,
          hasToken: false,
        });
      }
      return config;
    },
    (err) => {
      return Promise.reject(err);
    },
  );

  axiosClient.interceptors.response.use(
    (res) => {
      return res.data;
    },
    (err) => {
      const errorDetails = {
        status: err.response?.status,
        statusText: err.response?.statusText,
        message: err.response?.data?.message,
        data: err.response?.data,
        axiosMessage: err.message,
      };

      console.error("API Error Details:", errorDetails);

      return Promise.reject(err);
    },
  );

  return {
    axiosClient,
    get: axiosClient.get,
    post: axiosClient.post,
    put: axiosClient.put,
    patch: axiosClient.patch,
    delete: axiosClient.delete,
  };
};
