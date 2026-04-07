import axios from 'axios';
import { authService } from '../services/authService';

const apiClient = axios.create({
    baseURL: 'http://localhost:8080',
});

// --- Request Interceptor ---
// Adds the token to requests, but skips public endpoints.
apiClient.interceptors.request.use(
    (config) => {
        const publicPaths = ['/api/auth/register', '/api/auth/login'];
        if (config.url && publicPaths.includes(config.url)) {
            return config;
        }

        const token = authService.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- Response Interceptor ---
// Handles expired tokens and other auth errors globally.
apiClient.interceptors.response.use(
    (response) => response,
    
    // If the response has an error...
    (error) => {
        const originalRequest = error.config;
        console.log(originalRequest)

        // Check if the error is a 401 Unauthorized error
        if (error.response?.status === 401 && !originalRequest.url.includes('api/auth/')) {
            console.log("Authentication error (401). Logging out.");
            
            // Perform the logout
            authService.logoutUser();
            
            // Redirect to the login page.
            globalThis.location.href = '/login';
        }
        
        // For all other errors, just pass them along to the component's catch block.
        return Promise.reject(error);
    }
);

export default apiClient;
