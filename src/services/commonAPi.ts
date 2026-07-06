import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL as string;



const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(null)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    const is401 = error.response?.status === 401;
    const isRefreshUrl = original.url?.includes("/admin/refresh");
    const isLoginUrl = original.url?.includes("/admin/login");
    const alreadyRetried = original._retry;

    if (!is401 || isRefreshUrl || isLoginUrl || alreadyRetried) {
  return Promise.reject(error);
}

    // ✅ if we intentionally logged out, don't attempt refresh at all
    if (sessionStorage.getItem("logged_out") === "true") {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => api(original))
        .catch((err) => Promise.reject(err));
    }

    original._retry = true;
    isRefreshing = true;

    try {
      await axios.post(
        `${BASE_URL}/admin/refresh`,
        {},
        { withCredentials: true }
      );
      processQueue(null);
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError);
      // ✅ only redirect if not already on the login page — breaks the reload loop
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

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
    withCredentials: true,
    headers: isFormData
      ? reqHeader
      : reqHeader ?? { "Content-Type": "application/json" },
  };

  return api.request<T>(reqConfig);
};