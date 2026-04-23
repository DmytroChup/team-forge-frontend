/**
 * This file contains all the data transfer objects (DTOs) and type definitions
 * based on the backend's OpenAPI specification.
 */

// --- Enums ---

export const RANKS = [
    "UNRANKED",
    "HERALD", "GUARDIAN", "CRUSADER", "ARCHON",
    "LEGEND", "ANCIENT", "DIVINE", "IMMORTAL"
] as const;

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
    accessToken: string;
}

// --- Dota Profile Models ---

export interface DotaProfileResponse {
    profileId: number;
    nickname: string;
    avatarUrl?: string;
    estimatedMmr: number;
    rankTier: number;
    positions?: Position[];
    winRate?: number;
    totalMatches?: number;
    lookingForTeam: boolean;
    steamId?: string;
    aboutMe?: string;
}

export interface DotaProfileUpdateRequest {
    positions?: Position[];
    lookingForTeam?: boolean;
    aboutMe?: string;
}

export interface DotaProfileSearchRequest {
    rankTiers: number[];
    positions: Position[];
    includeUnranked: boolean;
}

// --- User Models ---

export interface UserResponse {
    id: number;
    nickname: string;
    email: string;
}
