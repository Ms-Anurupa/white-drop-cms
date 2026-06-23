import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { API_URL } from "../ConfigResolver";
import authStore from "./Store/authStore";

/**
 * Extend axios config to support opt-in auth
 */
export interface AuthAxiosRequestConfig extends InternalAxiosRequestConfig {
  withAuth?: boolean; 
  noTimeOut?: boolean;
}

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 150000,
});

/**
 * REQUEST INTERCEPTOR
 * Attach token ONLY if withAuth === true
 */
api.interceptors.request.use(
  (config: AuthAxiosRequestConfig) => {
    if (config.withAuth) {
      // Useing .getState() to pull the token directly from the synchronized store
      const token = authStore.getState().authToken;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    if (config.noTimeOut) {
      config.timeout = 0; 
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
 * Handle unauthorized access globally
 */
let isRedirecting = false;

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error?.response?.status;
    const config = error.config as AuthAxiosRequestConfig;

    // Only logout & redirect if auth was expected
    if (status === 401 && config?.withAuth && !isRedirecting) {
      isRedirecting = true;
      
      //Clearing the state via store's logout action instead of hitting localStorage manually
      authStore.getState().logOut();
      authStore.getState().openAuthModal();
      if (typeof window !== "undefined") {
        if (window.location.pathname !== "/") {
          window.location.href = "/";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;