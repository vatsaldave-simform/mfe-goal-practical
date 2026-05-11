import axios from "axios";
export type { AxiosError } from "axios";
import { API_BASE_URL, ROUTES } from "@mfe/shared";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const AUTH_EXCLUDED_URLS = [
  ROUTES.AUTH.LOGIN,
  ROUTES.AUTH.REGISTER,
  ROUTES.AUTH.ME,
];

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string | undefined = error.config?.url;
    const is401 = error.response?.status === 401;
    const isExcluded = AUTH_EXCLUDED_URLS.some((excluded) =>
      url?.includes(excluded),
    );

    if (is401 && !isExcluded) {
      window.location.href = "/auth/login";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);
