import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export const commonApi = async <T = unknown>(
  httpRequest: HttpMethod,
  url: string,
  reqBody?: unknown,
  reqHeader?: Record<string, string>
): Promise<AxiosResponse<T>> => {

  const isFormData = reqBody instanceof FormData;

  const reqConfig: AxiosRequestConfig = {
    method: httpRequest,
    url,
    data: reqBody,
    withCredentials: true, // 🍪 send cookie
    headers: isFormData
      ? reqHeader // ❌ DO NOT set Content-Type for FormData
      : reqHeader ?? { "Content-Type": "application/json" },
  };

  return axios.request<T>(reqConfig);
};
