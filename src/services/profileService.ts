import apiClient from '../api/api';
import type { DotaProfileResponse, DotaProfileSearchRequest } from '../api/models';

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

/**
 * Fetches all Dota player profiles.
 * NOTE: This is not paginated and may be slow with many users.
 * Consider implementing pagination in the backend and frontend.
 * @returns A promise that resolves to an array of player profiles.
 */
const getAllPlayers = async (page: number = 0, size: number = 20): Promise<PageResponse<DotaProfileResponse>> => {
    const response = await apiClient.get<PageResponse<DotaProfileResponse>>(`/api/profiles/dota?page=${page}&size=${size}`);
    return response.data;
};

/**
 * Searches for Dota player profiles based on specified criteria.
 * @param searchCriteria - The criteria to search for (ranks, positions).
 * @param page
 * @param size
 * @returns A promise that resolves to an array of matching player profiles.
 */
const searchPlayers = async (searchCriteria: DotaProfileSearchRequest, page: number = 0, size: number = 20): Promise<PageResponse<DotaProfileResponse>> => {
    const response = await apiClient.post<PageResponse<DotaProfileResponse>>(`/api/profiles/dota/search?page=${page}&size=${size}`, searchCriteria);
    return response.data;
};

export const profileService = {
    getAllPlayers,
    searchPlayers,
};
