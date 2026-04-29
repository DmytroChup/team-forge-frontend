import apiClient from '../api/api';
import type { DotaProfileResponse, DotaProfileSearchRequest } from '../api/models';
import { DEFAULT_PAGE_SIZE } from "../utils/constants.ts";

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface PageableParams {
    page?: number;
    size?: number;
    sort?: string;
}

/**
 * Fetches all Dota player profiles.
 * NOTE: This is not paginated and may be slow with many users.
 * Consider implementing pagination in the backend and frontend.
 * @returns A promise that resolves to an array of player profiles.
 */
const getAllPlayers = async (
    params: PageableParams = {}
): Promise<PageResponse<DotaProfileResponse>> => {
    const { page = 0, size = DEFAULT_PAGE_SIZE, sort } = params;

    let url = `/api/profiles/dota?page=${page}&size=${size}`;
    if(sort) {
        url += `&sort=${sort}`;
    }
    const response = await apiClient.get<PageResponse<DotaProfileResponse>>(url);
    return response.data;
};

/**
 * Searches for Dota player profiles based on specified criteria.
 * @param searchCriteria - The criteria to search for (ranks, positions).
 * @param params
 * @returns A promise that resolves to an array of matching player profiles.
 */
const searchPlayers = async (
    searchCriteria: DotaProfileSearchRequest,
    params: PageableParams = {}
): Promise<PageResponse<DotaProfileResponse>> => {
    const { page = 0, size = DEFAULT_PAGE_SIZE, sort } = params;

    let url = `/api/profiles/dota/search?page=${page}&size=${size}`;
    if(sort) {
        url += `&sort=${sort}`;
    }
    const response = await apiClient.post<PageResponse<DotaProfileResponse>>(url, searchCriteria);
    return response.data;
};

export const profileService = {
    getAllPlayers,
    searchPlayers,
};
