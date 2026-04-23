import apiClient from '../api/api';
import type { AuthResponse, LoginRequest, RegisterRequest, UserResponse} from '../api/models';

const TOKEN_KEY = 'accessToken';
const CURRENT_USER_KEY = 'currentUser';

/**
 * Registers a new user, and upon success, stores the token.
 * @param data - The user registration data.
 * @returns A promise that resolves to the authentication response.
 */
export const registerUser = async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
    if (response.data.accessToken) {
        setAccessToken(response.data.accessToken);
        await fetchAndCacheCurrentUser();
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
    if (response.data.accessToken) {
        setAccessToken(response.data.accessToken);
        await fetchAndCacheCurrentUser();
    }
    return response.data;
};

/**
 * Requests a new access token from the backend using the HttpOnly refresh token cookie.
 * Updates the access token in localStorage upon success.
 * @returns A promise that resolves to the new access token string.
 */
export const refreshToken = async (): Promise<string> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/refresh-token');
    const newAuthToken = response.data.accessToken;
    setAccessToken(newAuthToken);
    return newAuthToken;
};

/**
 * Logs the user out by making a request to the backend to revoke the session,
 * and then synchronously clears the local authentication data.
 */
export const logoutUser = async (): Promise<void> => {
    try {
        await apiClient.post('/api/auth/logout');
    } catch (error) {
        console.error("Logout request failed, but clearing local session anyway.", error);
    } finally {
        clearLocalData();
    }
};

/**
 * Synchronously clears the authentication token and cached user data from localStorage.
 * Typically used during logout or when a session completely expires.
 */
export const clearLocalData = (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
};

/**
 * Stores the JWT token in localStorage.
 * @param token - The JWT token.
 */
export const setAccessToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Retrieves the JWT token from localStorage.
 * @returns The token or null if it doesn't exist.
 */
export const getAccessToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

/**
 * Checks if the user is authenticated.
 * For simplicity, this just checks for the token's existence.
 * For production, you might want to decode the token and check its expiration.
 * @returns True if a token exists, false otherwise.
 */
export const isAuthenticated = (): boolean => {
    return !!getAccessToken();
};

/**
 * Calls GET /api/users/me and stores the result in localStorage.
 * Called once after login/register — after that use getCurrentUser() from cache.
 */
export const fetchAndCacheCurrentUser = async (): Promise<UserResponse | null> => {
    try {
        const response = await apiClient.get<UserResponse>('/api/users/me');
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.data));
        return response.data;
    } catch {
        return null;
    }
};

/**
 * Returns the cached user from localStorage — no network request.
 * Returns null if not logged in or cache is empty.
 */
export const getCurrentUser = (): UserResponse | null => {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as UserResponse;
    } catch {
        return null;
    }
};

export const authService = {
    registerUser,
    loginUser,
    refreshToken,
    logoutUser,
    clearLocalData,
    getAccessToken,
    isAuthenticated,
    getCurrentUser,
    fetchAndCacheCurrentUser,
};
