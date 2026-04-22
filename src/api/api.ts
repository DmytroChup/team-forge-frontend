import axios from 'axios';
import { authService } from '../services/authService';

const apiClient = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// --- Request Interceptor ---
// Adds the token to requests but skips public endpoints.
apiClient.interceptors.request.use(
    (config) => {
        const publicPaths = ['/api/auth/register', '/api/auth/login', '/api/auth/refresh-token'];
        if (config.url && publicPaths.some(path => config.url?.includes(path))) {
            return config;
        }

        const token = authService.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- Response Interceptor ---
// Handles expired tokens and other auth errors globally.
apiClient.interceptors.response.use(
    (response) => response,

    // If the response has an error...
    async (error) => {
        const originalRequest = error.config;

        if (originalRequest.url?.includes('/api/auth/login') ||
            originalRequest.url?.includes('/api/auth/register')) {
            throw error;
        }

        if (originalRequest.url?.includes('/api/auth/refresh-token')) {
            authService.clearLocalData();
            globalThis.location.href = '/login';
            throw error;
        }

        if (error.response?.status === 401 && !originalRequest._retry) {

            // If the token is ALREADY being refreshed by another request, queue this one
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        return apiClient(originalRequest);
                    })
                    .catch((err) => {
                        throw err;
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Attempt to get a new access token
                const newAccessToken = await authService.refreshToken();

                // Notify all queued requests that the token has been successfully refreshed
                processQueue(null, newAccessToken);

                // Retry the original request with the new token
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                // If the refresh failed (e.g., no cookie, or it was revoked)
                processQueue(refreshError, null);
                authService.clearLocalData();
                globalThis.location.href = '/login';
                throw refreshError;
            } finally {
                isRefreshing = false;
            }
        }

        throw error;
    }
);

export default apiClient;
