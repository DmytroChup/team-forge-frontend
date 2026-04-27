import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Container, Title, Grid, Card, Text, MultiSelect, Button, Loader, Center,
    Badge, Avatar, Box, Stack, Flex, Pagination, Group, Checkbox, Select, ActionIcon, Tooltip, UnstyledButton
} from '@mantine/core';
import { IconAdjustmentsHorizontal, IconSearch, IconSortAscending, IconSortDescending } from '@tabler/icons-react';
import { profileService } from '../services/profileService';
import type { DotaProfileResponse, Rank, Position } from '../api/models';
import { RANKS, POSITIONS } from '../api/models';
import { isAxiosError } from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { authService } from "../services/authService.ts";
import { parseRankTier, ranksToSearchParams, RANK_COLORS, ROMAN, RANK_IMAGES } from '../utils/rankParser';

export function PlayerSearch() {
    const [searchParams, setSearchParams] = useSearchParams();

    const activePage = Number.parseInt(searchParams.get('page') || '1', 10);
    const sortBy = searchParams.get('sort') || null;
    const sortDirection = (searchParams.get('dir') || 'desc') as 'desc' | 'asc';
    const minWinRate = searchParams.get('win') ? Number.parseInt(searchParams.get('win')!, 10) : null;
    const minMatches = searchParams.get('matches') ? Number.parseInt(searchParams.get('matches')!, 10) : null;
    const requireSteam = searchParams.get('steam') === 'true';
    const lookingForTeam = searchParams.get('lft') === 'true';

    const ranksString = searchParams.get('ranks');
    const selectedRanks = useMemo(() => ranksString ? ranksString.split(',').filter(Boolean) as Rank[] : [], [ranksString]);

    const posString = searchParams.get('pos');
    const selectedPositions = useMemo(() => posString ? posString.split(',').filter(Boolean) as Position[] : [], [posString]);

    const [pendingRanks, setPendingRanks] = useState<Rank[]>(selectedRanks);
    const [pendingPositions, setPendingPositions] = useState<Position[]>(selectedPositions);

    const [players, setPlayers] = useState<DotaProfileResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(1);

    const currentNickname = authService.getCurrentUser()?.nickname;

    const updateFilters = useCallback((updates: Record<string, string | null>) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            let resetPage = false;

            const finalUpdates = {
                ...updates,
                ranks: pendingRanks.length > 0 ? pendingRanks.join(',') : null,
                pos: pendingPositions.length > 0 ? pendingPositions.join(',') : null,
            };

            Object.entries(finalUpdates).forEach(([key, value]) => {
                const currentValue = prev.get(key);
                const newValue = value === null || value === '' ? null : value;

                if (currentValue !== newValue) {
                    if (newValue === null) {
                        newParams.delete(key);
                    } else {
                        newParams.set(key, newValue);
                    }

                    if (key !== 'page') {
                        resetPage = true;
                    }
                }
            });

            if (resetPage) {
                newParams.delete('page');
            }

            return newParams;
        });
    }, [setSearchParams, pendingRanks, pendingPositions]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const hasFilters = selectedRanks.length > 0 || selectedPositions.length > 0 ||
                minWinRate !== null || minMatches !== null ||
                requireSteam || lookingForTeam;

            const sortParam = sortBy ? `${sortBy},${sortDirection}` : undefined;
            const pageIndex = activePage - 1;

            let data;

            if (hasFilters) {
                const { rankTiers, includeUnranked } = ranksToSearchParams(selectedRanks);
                const searchCriteria = {
                    rankTiers,
                    positions: selectedPositions,
                    includeUnranked,
                    minWinRate: minWinRate ?? undefined,
                    minMatches: minMatches ?? undefined,
                    requireSteam,
                    lookingForTeam
                };
                data = await profileService.searchPlayers(searchCriteria, { page: pageIndex, sort: sortParam });
            } else {
                data = await profileService.getAllPlayers({ page: pageIndex, sort: sortParam });
            }

            const playersList = data.content || [];
            const filteredData = currentNickname
                ? playersList.filter((p: DotaProfileResponse) => p.nickname !== currentNickname)
                : playersList;

            setPlayers(filteredData);
            setTotalPages(data.totalPages === 0 ? 1 : data.totalPages);
        } catch (err) {
            if (isAxiosError(err) && err.response) {
                setError(err.response.data.message || 'Failed to fetch player data.');
            } else {
                setError('An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
        }
    }, [activePage, sortBy, sortDirection,
        selectedRanks, selectedPositions,
        minWinRate, minMatches, requireSteam,
        lookingForTeam, currentNickname]);

    useEffect(() => {
        setPendingRanks(selectedRanks);
        setPendingPositions(selectedPositions);
    }, [selectedRanks, selectedPositions]);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    const handleSearchClick = () => {
        updateFilters({ page: '1' });
    };

    const handleClearSearch = () => {
        setPendingRanks([]);
        setPendingPositions([]);
        setSearchParams(new URLSearchParams());
    };

    const toggleRank = (rank: Rank) => {
        setPendingRanks(prev =>
            prev.includes(rank) ? prev.filter(r => r !== rank) : [...prev, rank]
        );
    };

    const renderFilterPill = (
        label: string,
        value: number | null,
        currentValue: number | null,
        filterKey: string
    ) => {
        const isActive = currentValue === value;
        return (
            <Box
                onClick={() => updateFilters({ [filterKey]: value === null ? null : value.toString() })}
                style={{
                    padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontFamily: "'Oxanium', sans-serif",
                    fontSize: 12, fontWeight: isActive ? 800 : 600, transition: 'all 0.2s ease', userSelect: 'none',
                    background: isActive ? 'rgba(34,211,238,.15)' : 'rgba(255,255,255,.02)',
                    color: isActive ? '#22d3ee' : '#94a3b8',
                    border: `1px solid ${isActive ? 'rgba(34,211,238,.3)' : 'rgba(255,255,255,.05)'}`,
                }}
            >
                {label}
            </Box>
        );
    };

    const renderPlayerCard = (player: DotaProfileResponse) => {
        const { nickname, rankTier, estimatedMmr, positions, avatarUrl, winRate, totalMatches } = player;
        const { rankKey, rankLabel, stars } = parseRankTier(rankTier);
        const rankColor = RANK_COLORS[rankKey];
        const starsLabel = stars > 0 ? ROMAN[Math.min(stars - 1, 4)] : "";
        const initials = nickname ? nickname.slice(0, 2).toUpperCase() : "??";

        return (
            <Grid.Col span={{ base: 12, md: 6 }} key={player.profileId}>
                <Card shadow="xl" padding="xl" radius="xl" component={Link} to={`/profile/${player.nickname}`}
                      style={{ height: '100%', background: "linear-gradient(135deg, rgba(5,14,24,0.9) 0%, rgba(7,21,32,0.9) 100%)",
                          border: "1px solid rgba(34,211,238,.07)", textDecoration: 'none', display: 'flex',
                          flexDirection: 'column', alignItems: 'center',
                          transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
                          cursor: 'pointer',
                          gap: 12,"&:hover": { transform: "translateY(-5px)", border: "1px solid rgba(34,211,238,.25)", boxShadow: "0 10px 30px rgba(34,211,238,.12)" } }}>
                    <Avatar src={avatarUrl || null} size={100} radius={90} style={{ border: "3px solid rgba(34,211,238,.3)", background: "linear-gradient(135deg, #0891b2, #22d3ee)", marginBottom: 8 }}>
                        <Text style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 900, fontSize: 28, color: "#001a1f" }}>{initials}</Text>
                    </Avatar>
                    <Text fw={800} size="xl" style={{ fontFamily: "'Oxanium', sans-serif", color: "#f1f5f9", letterSpacing: "-0.5px", fontSize: 24 }}>{nickname}</Text>
                    <Stack gap={4} align="center">
                        <Text size="sm" style={{ fontFamily: "'Oxanium', sans-serif", color: rankColor, fontWeight: 700 }}>{rankLabel.toUpperCase()} {starsLabel}</Text>
                        <Text size="xs" style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(148,163,184,.6)", letterSpacing: 0.5 }}>{estimatedMmr?.toLocaleString() ?? '—'} MMR</Text>
                    </Stack>
                    <Group grow style={{ width: '100%', marginTop: 8, marginBottom: 8 }}>
                        <Box style={{ textAlign: 'center', padding: '10px 0', background: 'rgba(255,255,255,.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,.05)' }}>
                            <Text style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 10, color: "rgba(148,163,184,.6)", letterSpacing: 1, textTransform: 'uppercase' }}>Win Rate</Text>
                            <Text style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 20, fontWeight: 800, color: winRate ? "#22d3ee" : "rgba(148,163,184,.4)" }}>{winRate == null ? '—' : `${winRate}%`}</Text>
                        </Box>
                        <Box style={{ textAlign: 'center', padding: '10px 0', background: 'rgba(255,255,255,.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,.05)' }}>
                            <Text style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 10, color: "rgba(148,163,184,.6)", letterSpacing: 1, textTransform: 'uppercase' }}>Matches</Text>
                            <Text style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 20, fontWeight: 800, color: totalMatches ? "#f1f5f9" : "rgba(148,163,184,.4)" }}>{totalMatches?.toLocaleString() ?? '—'}</Text>
                        </Box>
                    </Group>
                    <Box style={{ height: '0.5px', background: 'rgba(255,255,255,.05)', width: '100%', margin: '8px 0'}} />
                    <Flex gap={5} wrap="wrap" justify="center" style={{ flexGrow: 1, alignContent: 'center' }}>
                        {positions?.map(pos => (
                            <Badge key={pos} variant="outline" color="gray" size="sm" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: 0.5, color: 'rgba(148,163,184,.8)', borderColor: 'rgba(148,163,184,.2)' }}>{pos.replace("_", " ")}</Badge>
                        ))}
                    </Flex>
                </Card>
            </Grid.Col>
        );
    };

    return (
        <Box style={{ minHeight: 'calc(100vh - 60px)', background: 'radial-gradient(circle at 50% -20%, rgba(34, 211, 238, 0.08), transparent 70%)', paddingTop: 40, paddingBottom: 40 }}>
            <Container size="xl">
                <Flex justify="space-between" align="center" mb="lg">
                    <Title order={2} style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 900, fontSize: 32, color: "#f1f5f9", letterSpacing: "-1px" }}>
                        RECRUITMENT TERMINAL
                    </Title>
                    <Button onClick={handleClearSearch} variant="default" size="xs" leftSection={<IconSearch size={14} />} style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1, background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)", borderRadius: 8 }}>
                        CLEAR SEARCH
                    </Button>
                </Flex>

                <Box mb="xl" style={{ background: 'rgba(4, 9, 15, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(34,211,238,.12)', borderRadius: 16, padding: 32, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                    <Grid gutter="xl">
                        <Grid.Col span={12}>
                            <Text
                                style={{
                                    fontFamily: "'Oxanium', sans-serif",
                                    fontSize: 13,
                                    color: "#94a3b8",
                                    marginBottom: 12,
                                    fontWeight: 700,
                                    letterSpacing: 0.5,
                                    textTransform: 'uppercase'
                                }}
                            >
                                Skill Tier
                            </Text>
                            {/* Темная "полка" для рангов */}
                            <Box style={{
                                background: 'rgba(0, 0, 0, 0.25)', // Глубокий темный фон
                                border: '1px solid rgba(255,255,255,0.03)',
                                borderRadius: 16,
                                padding: '20px 24px', // Просторные отступы
                                boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.1)'
                            }}>
                                {/* Распределяем по ВСЕЙ ширине */}
                                <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
                                    {RANKS.map((rank) => {
                                        const isSelected = pendingRanks.includes(rank);
                                        return (
                                            <Tooltip
                                                key={rank}
                                                label={rank.replace('_', ' ')}
                                                position="top"
                                                withArrow
                                                offset={10}
                                            >
                                                <UnstyledButton
                                                    onClick={() => toggleRank(rank)}
                                                    style={{
                                                        width: 76,  // 🔥 Сделали крупными!
                                                        height: 76,
                                                        borderRadius: 16,
                                                        // Вместо грубой квадратной рамки - мягкое неоновое свечение и фон
                                                        border: isSelected ? '1px solid rgba(34,211,238,0.4)' : '1px solid transparent',
                                                        background: isSelected ? 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, rgba(0,0,0,0) 80%)' : 'transparent',
                                                        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',

                                                        // Главная магия фокуса:
                                                        // Не выбран: черно-белый, 35% видимости.
                                                        // Выбран: полная яркость + drop-shadow (тень по контуру самой медали, а не кнопки!)
                                                        filter: isSelected ? 'drop-shadow(0 0 12px rgba(34,211,238,0.6))' : 'grayscale(100%) opacity(35%)',
                                                        // Активная медаль слегка "всплывает" и увеличивается
                                                        transform: isSelected ? 'scale(1.1) translateY(-4px)' : 'scale(1)',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <img
                                                        src={RANK_IMAGES[rank]}
                                                        alt={rank}
                                                        style={{
                                                            width: 60, // 🔥 Сами иконки теперь массивные
                                                            height: 60,
                                                            objectFit: 'contain'
                                                        }}
                                                    />
                                                </UnstyledButton>
                                            </Tooltip>
                                        );
                                    })}
                                </Flex>
                            </Box>
                        </Grid.Col>

                        <Grid.Col span={12}>
                            <MultiSelect
                                label={<Text style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 12, color: "#94a3b8", marginBottom: 6, fontWeight: 700 }}>Role Priority</Text>}
                                placeholder="Select standard positions"
                                data={[...POSITIONS]}
                                value={pendingPositions}
                                onChange={(values) => setPendingPositions(values as Position[])}
                                clearable
                                styles={{ input: { background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.1)", fontFamily: "'DM Sans', sans-serif", color: "#f1f5f9" }, pill: { fontFamily: "'Oxanium', sans-serif", fontWeight: 600, fontSize: 11, background: 'rgba(34,211,238,.08)', color: '#22d3ee', border: '1px solid rgba(34,211,238,.2)' } }}
                            />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Text style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 12, color: "#94a3b8", marginBottom: 8, fontWeight: 700 }}>Total Matches</Text>
                            <Group gap={8}>
                                {renderFilterPill("Any", null, minMatches, 'matches')}
                                {renderFilterPill("500+", 500, minMatches, 'matches')}
                                {renderFilterPill("1000+", 1000, minMatches, 'matches')}
                                {renderFilterPill("2000+", 2000, minMatches, 'matches')}
                                {renderFilterPill("3000+", 3000, minMatches, 'matches')}
                            </Group>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Text style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 12, color: "#94a3b8", marginBottom: 8, fontWeight: 700 }}>Win Rate</Text>
                            <Group gap={8}>
                                {renderFilterPill("Any", null, minWinRate, 'win')}
                                {renderFilterPill("50%+", 50, minWinRate, 'win')}
                                {renderFilterPill("55%+", 55, minWinRate, 'win')}
                                {renderFilterPill("60%+", 60, minWinRate, 'win')}
                            </Group>
                        </Grid.Col>

                        <Grid.Col span={12}>
                            <Box style={{ height: '1px', background: 'rgba(255,255,255,.05)', width: '100%', margin: '8px 0 24px 0' }} />

                            <Flex justify="space-between" align="center" direction={{ base: 'column', md: 'row' }} gap="md">
                                <Group gap="xl">
                                    <Checkbox
                                        label="Steam account required"
                                        checked={requireSteam}
                                        onChange={(event) => updateFilters({ steam: event.currentTarget.checked ? 'true' : null })}
                                        color="cyan"
                                        styles={{ label: { fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: requireSteam ? "#f1f5f9" : "#94a3b8", cursor: "pointer", paddingLeft: 10 }, input: { cursor: "pointer", background: "rgba(255,255,255,.05)", borderColor: "rgba(255,255,255,.1)" } }}
                                    />
                                    <Checkbox
                                        label="Looking for team only"
                                        checked={lookingForTeam}
                                        onChange={(event) => updateFilters({ lft: event.currentTarget.checked ? 'true' : null })}
                                        color="cyan"
                                        styles={{ label: { fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: lookingForTeam ? "#f1f5f9" : "#94a3b8", cursor: "pointer", paddingLeft: 10 }, input: { cursor: "pointer", background: "rgba(255,255,255,.05)", borderColor: "rgba(255,255,255,.1)" } }}
                                    />
                                </Group>

                                <Group gap="xs">
                                    <Text style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 12, color: "#94a3b8", fontWeight: 700 }}>SORT BY:</Text>
                                    <Select
                                        placeholder="Default"
                                        value={sortBy}
                                        onChange={(val) => updateFilters({ sort: val })}
                                        data={[
                                            { value: 'estimatedMmr', label: 'MMR / Rank' },
                                            { value: 'winRate', label: 'Win Rate' },
                                            { value: 'totalMatches', label: 'Total Matches' }
                                        ]}
                                        clearable
                                        size="xs"
                                        styles={{ input: { background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.1)", fontFamily: "'DM Sans', sans-serif", color: "#f1f5f9", minWidth: 140 } }}
                                    />
                                    <ActionIcon
                                        variant="default"
                                        size="lg"
                                        onClick={() => updateFilters({ dir: sortDirection === 'desc' ? 'asc' : 'desc' })}
                                        disabled={!sortBy}
                                        style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.1)", color: sortBy ? "#22d3ee" : "#94a3b8" }}
                                    >
                                        {sortDirection === 'desc' ? <IconSortDescending size={18} /> : <IconSortAscending size={18} />}
                                    </ActionIcon>
                                </Group>

                                <Button
                                    onClick={handleSearchClick}
                                    loading={loading}
                                    size="md"
                                    leftSection={<IconAdjustmentsHorizontal size={18} />}
                                    style={{ background: "linear-gradient(135deg, #0891b2, #22d3ee)", color: "#001a1f", fontFamily: "'Oxanium', sans-serif", fontWeight: 800, letterSpacing: '0.5px', borderRadius: 10, boxShadow: '0 0 15px rgba(34,211,238,.3)', textTransform: 'uppercase', minWidth: 180 }}
                                >
                                    Search
                                </Button>
                            </Flex>
                        </Grid.Col>
                    </Grid>
                </Box>

                {loading && <Center py={100}><Loader color="cyan" /></Center>}

                {error && <Center py={100}><ErrorState message={error} /></Center>}

                {!loading && !error && (
                    <>
                        <Grid>
                            {players.length > 0 ? (
                                players.map(renderPlayerCard)
                            ) : (
                                <Grid.Col span={12}>
                                    <Center py={100}>
                                        <Text style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(148,163,184,.6)", fontSize: 14 }}>
                                            No players currently match the selected criteria.
                                        </Text>
                                    </Center>
                                </Grid.Col>
                            )}
                        </Grid>

                        {totalPages > 1 && (
                            <Center mt={40}>
                                <Pagination
                                    total={totalPages}
                                    value={activePage}
                                    onChange={(val) => updateFilters({ page: val.toString() })}
                                    color="cyan"
                                    radius="md"
                                    withEdges
                                    styles={{ control: { background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)", color: "#94a3b8", fontFamily: "'Oxanium', sans-serif", "&[data-active]": { background: "rgba(34,211,238,.1)", borderColor: "rgba(34,211,238,.3)", color: "#22d3ee" } } }}
                                />
                            </Center>
                        )}
                    </>
                )}
            </Container>
        </Box>
    );
}

function ErrorState({ message }: Readonly<{ message: string }>) {
    return (
        <Box
            style={{
                maxWidth: 420,
                width: "100%",
                background: "rgba(239,68,68,.06)",
                border: "0.5px solid rgba(239,68,68,.25)",
                borderRadius: 16,
                padding: "32px 28px",
                textAlign: "center",
            }}
        >
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none" style={{ margin: "0 auto 16px", display: "block" }}>
                <circle cx="16" cy="16" r="15" stroke="rgba(239,68,68,.5)" strokeWidth="1.5" />
                <path d="M11 11 L21 21 M21 11 L11 21" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <Text style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: 0.5, color: "#f87171", marginBottom: 8 }}>
                SEARCH UNIT ERROR
            </Text>
            <Text style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(148,163,184,.7)", lineHeight: 1.55 }}>
                {message}
            </Text>
        </Box>
    );
}
