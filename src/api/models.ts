/**
 * This file contains all the data transfer objects (DTOs) and type definitions
 * based on the backend's OpenAPI specification.
 */

// --- Enums ---

export const RANKS = ["HERALD", "GUARDIAN", "CRUSADER", "ARCHON", "LEGEND", "ANCIENT", "DIVINE", "IMMORTAL"] as const;
export const POSITIONS = ["CARRY", "MID", "OFFLANE", "SOFT_SUPPORT", "HARD_SUPPORT"] as const;

export type Rank = typeof RANKS[number];
export type Position = typeof POSITIONS[number];

// --- Auth Models ---

export interface RegisterRequest {
    nickname: string;
    email: string;
    password?: string;
}

export interface LoginRequest {
    email: string;
    password?: string;
}

export interface AuthResponse {
    token: string;
}

// --- Dota Profile Models ---

export interface DotaProfileResponse {
    profileId: number;
    userId: number;
    nickname: string;
    avatarUrl?: string;
    mmr?: number;
    rank?: Rank;
    stars?: number;
    positions?: Position[];
    winRate?: number;
    totalMatches?: number;
    lookingForTeam: boolean;
    steamId?: string;
    aboutMe?: string;
}

export interface DotaProfileUpdateRequest {
    mmr?: number;
    positions?: Position[];
    lookingForTeam?: boolean;
    aboutMe?: string;
}

export interface DotaProfileSearchRequest {
    ranks?: Rank[];
    positions?: Position[];
}
