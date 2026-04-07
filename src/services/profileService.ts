import apiClient from '../api/api';
import type {DotaProfileResponse, DotaProfileSearchRequest} from '../api/models';

/**
 * Fetches all Dota player profiles.
 * NOTE: This is not paginated and may be slow with many users.
 * Consider implementing pagination in the backend and frontend.
 * @returns A promise that resolves to an array of player profiles.
 */
const getAllPlayers = async (): Promise<DotaProfileResponse[]> => {
    const response = await apiClient.get<DotaProfileResponse[]>('/api/profiles/dota');
    return response.data;
};

/**
 * Searches for Dota player profiles based on specified criteria.
 * @param searchCriteria - The criteria to search for (ranks, positions).
 * @returns A promise that resolves to an array of matching player profiles.
 */
const searchPlayers = async (searchCriteria: DotaProfileSearchRequest): Promise<DotaProfileResponse[]> => {
    const response = await apiClient.post<DotaProfileResponse[]>('/api/profiles/dota/search', searchCriteria);
    return response.data;
};

export const profileService = {
    getAllPlayers,
    searchPlayers,
};
