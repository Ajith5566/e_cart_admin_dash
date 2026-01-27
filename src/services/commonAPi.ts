import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

// Allow only valid HTTP methods
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export const commonApi = async <T = unknown>(
  httpRequest: HttpMethod,
  url: string,
  reqBody?: unknown,
  reqHeader?: Record<string, string>
): Promise<AxiosResponse<T>> => {
  
  const reqConfig: AxiosRequestConfig = {
    method: httpRequest,
    url,
    data: reqBody,
    headers: reqHeader ?? { "Content-Type": "application/json" },
  };

  // eslint wants this — return promise directly (no try/catch)
  return axios.request<T>(reqConfig);
};
