import type { Rank } from "../api/models.ts";

export const RANK_COLORS: Record<string, string> = {
    UNRANKED: "#888888",
    HERALD:   "#8b7355",
    GUARDIAN: "#7e9ca8",
    CRUSADER:  "#c0a97e",
    ARCHON:   "#8db0cf",
    LEGEND:   "#61a0c4",
    ANCIENT:  "#82b4d4",
    DIVINE:   "#c8a8e0",
    IMMORTAL: "#e8c84a",
};

export const ROMAN = ["I", "II", "III", "IV", "V"];

export const RANK_IMAGES: Record<Rank, string> = {
    UNRANKED: "/assets/ranks/medal_0.png",
    HERALD: "/assets/ranks/medal_1.png",
    GUARDIAN: "/assets/ranks/medal_2.png",
    CRUSADER: "/assets/ranks/medal_3.png",
    ARCHON: "/assets/ranks/medal_4.png",
    LEGEND: "/assets/ranks/medal_5.png",
    ANCIENT: "/assets/ranks/medal_6.png",
    DIVINE: "/assets/ranks/medal_7.png",
    IMMORTAL: "/assets/ranks/medal_8.png",
};

const RANK_TO_TIERS: Record<string, number[]> = {
    UNRANKED: [],
    HERALD:   [11, 12, 13, 14, 15],
    GUARDIAN: [21, 22, 23, 24, 25],
    CRUSADER: [31, 32, 33, 34, 35],
    ARCHON:   [41, 42, 43, 44, 45],
    LEGEND:   [51, 52, 53, 54, 55],
    ANCIENT:  [61, 62, 63, 64, 65],
    DIVINE:   [71, 72, 73, 74, 75],
    IMMORTAL: [80],
};

export function ranksToSearchParams(ranks: string[]): {
    rankTiers: number[];
    includeUnranked: boolean;
} {
    return {
        rankTiers: ranks
            .filter(r => r !== 'UNRANKED')
            .flatMap(r => RANK_TO_TIERS[r] ?? []),
        includeUnranked: ranks.includes('UNRANKED'),
    };
}

export function parseRankTier(rankTier?: number | null) {
    if (!rankTier || rankTier < 11) {
        return { rankKey: "UNRANKED", rankLabel: "Unranked", stars: 0 };
    }

    if (rankTier === 80) {
        return { rankKey: "IMMORTAL", rankLabel: "Immortal", stars: 0 };
    }

    const rankDigit = Math.floor(rankTier / 10);
    const starsDigit = rankTier % 10;

    const rankMap: Record<number, { key: string, label: string }> = {
        1: { key: "HERALD", label: "Herald" },
        2: { key: "GUARDIAN", label: "Guardian" },
        3: { key: "CRUSADER", label: "Crusader" },
        4: { key: "ARCHON", label: "Archon" },
        5: { key: "LEGEND", label: "Legend" },
        6: { key: "ANCIENT", label: "Ancient" },
        7: { key: "DIVINE", label: "Divine" },
    };

    const rankInfo = rankMap[rankDigit] || { key: "UNRANKED", label: "Unranked" };
    return { rankKey: rankInfo.key, rankLabel: rankInfo.label, stars: starsDigit };
}