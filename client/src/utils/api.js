import axios from "axios";
import { useAppStore } from "../store/index.js";

// Create a shared axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  timeout: 10000,
  withCredentials: true,
});

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor - runs BEFORE every request
api.interceptors.request.use(
  (config) => {
    // Get access token from localStorage
    const accessToken = localStorage.getItem("accessToken");

    // Add Authorization header if token exists
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Log request (optional - remove in production)
    console.log("🚀 Request:", config.method?.toUpperCase(), config.url);

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - runs AFTER every response
api.interceptors.response.use(
  (response) => {
    // Log successful response (optional - remove in production)
    console.log("✅ Response:", response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 498 errors (expired token from optional auth) - less aggressive refresh
    if (error.response?.status === 498 && !originalRequest._retry) {
      console.log(
        "🔄 Token expired (498) - attempting refresh for optional auth"
      );

      // Mark as retried to prevent infinite loops
      originalRequest._retry = true;

      try {
        // Get refresh token from localStorage
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          // No refresh token - clear tokens and retry anonymously
          console.log("clearing tokens");

          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          try {
            const { setChannelInfo, setIsLoggedIn } = useAppStore.getState();
            setChannelInfo(null);
            setIsLoggedIn(false);
          } catch {}
          console.log("⚠️ No refresh token - retrying request anonymously");

          // Ensure we don't send Authorization header
          if (originalRequest.headers) {
            delete originalRequest.headers.Authorization;
            delete originalRequest.headers.authorization;
          }

          return api(originalRequest);
        }

        // Call refresh token endpoint
        const response = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/api/v1/auth/refresh`,
          { refreshToken },
          { withCredentials: true }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data;

        // Store new tokens
        localStorage.setItem("accessToken", newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        console.log("✅ Token refreshed successfully for optional auth");

        // Retry original request with new token
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens and retry anonymously
        console.log(
          "❌ Token refresh failed for optional auth - retrying request anonymously"
        );
        console.log("clearing tokens");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        try {
          const { setChannelInfo, setIsLoggedIn } = useAppStore.getState();
          setChannelInfo(null);
          setIsLoggedIn(false);
        } catch {}

        if (originalRequest.headers) {
          delete originalRequest.headers.Authorization;
          delete originalRequest.headers.authorization;
        }

        return api(originalRequest);
      }
    }

    // Handle 401 errors (unauthorized/expired token) - aggressive refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("401 error");
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Get refresh token from localStorage
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          // No refresh token - redirect to login
          console.log("clearing tokens");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          try {
            const { setChannelInfo, setIsLoggedIn } = useAppStore.getState();
            setChannelInfo(null);
            setIsLoggedIn(false);
          } catch {}
          // window.location.href = "/";
          return Promise.reject(error);
        }

        // Call refresh token endpoint
        const response = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/api/v1/auth/refresh`,
          { refreshToken },
          { withCredentials: true }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data;

        // Store new tokens
        localStorage.setItem("accessToken", newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        // Process queued requests
        processQueue(null, newAccessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        processQueue(refreshError, null);
        console.log("clearing tokens");

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        try {
          const { setChannelInfo, setIsLoggedIn } = useAppStore.getState();
          setChannelInfo(null);
          setIsLoggedIn(false);
        } catch {}
        // window.location.href = "/";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    console.error("❌ API Error:", error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default api;
