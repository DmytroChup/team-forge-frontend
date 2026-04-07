import apiClient from '../api/api';
import type {AuthResponse, LoginRequest, RegisterRequest} from '../api/models';

const TOKEN_KEY = 'authToken';

/**
 * Registers a new user, and upon success, stores the token.
 * @param data - The user registration data.
 * @returns A promise that resolves to the authentication response.
 */
export const registerUser = async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
    if (response.data.token) {
        setToken(response.data.token);
    }
    return response.data;
};

/**
 * Logs a user in, and upon success, stores the token.
 * @param data - The user login credentials.
 * @returns A promise that resolves to the authentication response.
 */
export const loginUser = async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
    if (response.data.token) {
        setToken(response.data.token);
    }
    return response.data;
};

/**
 * Logs the user out by removing the token.
 */
export const logoutUser = (): void => {
    localStorage.removeItem(TOKEN_KEY);
};

/**
 * Stores the JWT token in localStorage.
 * @param token - The JWT token.
 */
export const setToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Retrieves the JWT token from localStorage.
 * @returns The token or null if it doesn't exist.
 */
export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

/**
 * Checks if the user is authenticated.
 * For simplicity, this just checks for the token's existence.
 * For production, you might want to decode the token and check its expiration.
 * @returns True if a token exists, false otherwise.
 */
export const isAuthenticated = (): boolean => {
    const token = getToken();
    return !!token;
};

export const authService = {
    registerUser,
    loginUser,
    logoutUser,
    getToken,
    isAuthenticated,
};
