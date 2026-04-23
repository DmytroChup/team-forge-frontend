import { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Title,
    Grid,
    Card,
    Text,
    MultiSelect,
    Button,
    Loader,
    Center,
    Badge,
    Avatar,
    Box,
    Stack,
    Flex,
    Pagination
} from '@mantine/core';
import { IconAdjustmentsHorizontal, IconSearch } from '@tabler/icons-react';
import { profileService } from '../services/profileService';
import type { DotaProfileResponse, Rank, Position } from '../api/models';
import { RANKS, POSITIONS } from '../api/models';
import { isAxiosError } from 'axios';
import { Link } from 'react-router-dom';
import { authService } from "../services/authService.ts";
import { parseRankTier, ranksToSearchParams, RANK_COLORS, ROMAN } from '../utils/rankParser';

export function PlayerSearch() {
    const [players, setPlayers] = useState<DotaProfileResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for filters
    const [selectedRanks, setSelectedRanks] = useState<Rank[]>([]);
    const [selectedPositions, setSelectedPositions] = useState<Position[]>([]);

    const [activePage, setActivePage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isSearchMode, setIsSearchMode] = useState(false);

    const currentNickname = authService.getCurrentUser()?.nickname;

    const handleApiError = useCallback((err: unknown) => {
        if (isAxiosError(err) && err.response) {
            setError(err.response.data.message || 'Failed to fetch player data.');
        } else {
            setError('An unexpected error occurred.');
        }
    }, []);

    const fetchAllPlayers = useCallback(async (pageIndex: number = 0) => {
        setLoading(true);
        setError(null);
        try {
            const data = await profileService.getAllPlayers(pageIndex);
            const playersList = data.content || [];

            const filteredData = currentNickname
                ? playersList.filter((p: DotaProfileResponse) => p.nickname !== currentNickname)
                : playersList;

            setPlayers(filteredData);
            setTotalPages(data.totalPages === 0 ? 1 : data.totalPages);
            setIsSearchMode(false);
        } catch (err) {
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    }, [currentNickname, handleApiError]);

    const executeSearch = useCallback(async (pageIndex: number = 0) => {
        setLoading(true);
        setError(null);
        try {
            const { rankTiers, includeUnranked } = ranksToSearchParams(selectedRanks);
            const searchCriteria = {
                rankTiers,
                positions: selectedPositions,
                includeUnranked,
            };
            const data = await profileService.searchPlayers(searchCriteria, pageIndex);

            const playersList = data.content || [];

            const filteredData = currentNickname
                ? playersList.filter((p: DotaProfileResponse) => p.nickname !== currentNickname)
                : playersList;

            setPlayers(filteredData);
            setTotalPages(data.totalPages === 0 ? 1 : data.totalPages);
            setIsSearchMode(true);
        } catch (err) {
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    }, [selectedRanks, selectedPositions, currentNickname, handleApiError]);

    const handleSearchClick = () => {
        setActivePage(1);
        void executeSearch(0);
    };

    const handleClearSearch = () => {
        setSelectedRanks([]);
        setSelectedPositions([]);
        setActivePage(1);
        void fetchAllPlayers(0);
    };

    useEffect(() => {
        const springPage = activePage - 1;
        if (isSearchMode) {
            void executeSearch(springPage);
        } else {
            void fetchAllPlayers(springPage);
        }
        // Intentional: This effect should ONLY trigger on page change.
        // executeSearch and fetchAllPlayers are recreated when filters change,
        // but the actual search should only be triggered via handleSearchClick.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activePage]);

    const renderPlayerCard = (player: DotaProfileResponse) => {
        const { nickname, rankTier, estimatedMmr, positions, avatarUrl } = player;
        const { rankKey, rankLabel, stars } = parseRankTier(rankTier);
        const rankColor = RANK_COLORS[rankKey];
        const starsLabel = stars > 0 ? ROMAN[Math.min(stars - 1, 4)] : "";

        const initials = nickname
            ? nickname.slice(0, 2).toUpperCase()
            : "??";

        return (
            <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }} key={player.profileId}>
                <Card
                    shadow="xl"
                    padding="xl"
                    radius="xl"
                    component={Link}
                    to={`/profile/${player.nickname}`}
                    style={{
                        height: '100%',
                        background: "linear-gradient(135deg, rgba(5,14,24,0.9) 0%, rgba(7,21,32,0.9) 100%)",
                        border: "1px solid rgba(34,211,238,.07)",
                        textDecoration: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
                        cursor: 'pointer',
                        gap: 12,
                        "&:hover": {
                            transform: "translateY(-5px)",
                            border: "1px solid rgba(34,211,238,.25)",
                            boxShadow: "0 10px 30px rgba(34,211,238,.12)"
                        }
                    }}
                >
                    {/* Avatar */}
                    <Avatar
                        src={avatarUrl || null}
                        size={90}
                        radius={90}
                        style={{
                            border: "3px solid rgba(34,211,238,.3)",
                            background: "linear-gradient(135deg, #0891b2, #22d3ee)",
                            marginBottom: 8
                        }}
                    >
                        <Text style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 900, fontSize: 28, color: "#001a1f" }}>
                            {initials}
                        </Text>
                    </Avatar>

                    {/* Nickname */}
                    <Text
                        fw={800}
                        size="xl"
                        style={{
                            fontFamily: "'Oxanium', sans-serif",
                            color: "#f1f5f9",
                            letterSpacing: "-0.5px"
                        }}
                    >
                        {nickname}
                    </Text>

                    {/* MMR and Rank */}
                    <Stack gap={4} align="center">
                        <Text
                            size="sm"
                            style={{
                                fontFamily: "'Oxanium', sans-serif",
                                color: rankColor,
                                fontWeight: 700
                            }}
                        >
                            {rankLabel.toUpperCase()} {starsLabel}
                        </Text>
                        <Text
                            size="xs"
                            style={{
                                fontFamily: "'DM Sans', sans-serif",
                                color: "rgba(148,163,184,.6)",
                                letterSpacing: 0.5
                            }}
                        >
                            {estimatedMmr?.toLocaleString() ?? '—'} MMR
                        </Text>
                    </Stack>

                    {/* Divider */}
                    <Box style={{ height: '0.5px', background: 'rgba(255,255,255,.05)', width: '100%', margin: '8px 0'}} />

                    {/* Roles */}
                    <Flex gap={5} wrap="wrap" justify="center" style={{ flexGrow: 1, alignContent: 'center' }}>
                        {positions?.map(pos => (
                            <Badge
                                key={pos}
                                variant="outline"
                                color="gray"
                                size="xs"
                                style={{
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontSize: 9,
                                    letterSpacing: 0.5,
                                    color: 'rgba(148,163,184,.8)',
                                    borderColor: 'rgba(148,163,184,.2)'
                                }}
                            >
                                {pos.replace("_", " ")}
                            </Badge>
                        ))}
                    </Flex>
                </Card>
            </Grid.Col>
        );
    };

    return (
        <Box
            style={{
                minHeight: 'calc(100vh - 60px)',
                background: 'radial-gradient(circle at 50% -20%, rgba(34, 211, 238, 0.08), transparent 70%)',
                paddingTop: 40,
                paddingBottom: 40
            }}
        >
            <Container size="xl">
                <Flex justify="space-between" align="center" mb="lg">
                    <Title
                        order={2}
                        style={{
                            fontFamily: "'Oxanium', sans-serif",
                            fontWeight: 900,
                            fontSize: 32,
                            color: "#f1f5f9",
                            letterSpacing: "-1px"
                        }}
                    >
                        RECRUITMENT TERMINAL
                    </Title>
                    <Button
                        onClick={handleClearSearch}
                        variant="default"
                        size="xs"
                        leftSection={<IconSearch size={14} />}
                        style={{
                            fontFamily: "'Oxanium', sans-serif",
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: 1,
                            background: "rgba(255,255,255,.02)",
                            border: "1px solid rgba(255,255,255,.05)",
                            borderRadius: 8
                        }}
                    >
                        CLEAR SEARCH
                    </Button>
                </Flex>

                {/* ── Filter Panel (Stylized) ── */}
                <Box
                    mb="xl"
                    style={{
                        background: 'rgba(4, 9, 15, 0.4)', // Стеклянный эффект
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(34,211,238,.12)',
                        borderRadius: 16,
                        padding: 24,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                    }}
                >
                    <Grid gutter="md" align="flex-end">
                        <Grid.Col span={{ base: 12, md: 5 }}>
                            <MultiSelect
                                label={
                                    <Text style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 12, color: "#94a3b8", marginBottom: 6, fontWeight: 700 }}>
                                        Skill Tier
                                    </Text>
                                }
                                placeholder="Select rank tiers"
                                data={[...RANKS]}
                                value={selectedRanks}
                                onChange={(values) => setSelectedRanks(values as Rank[])}
                                clearable
                                styles={{
                                    input: { background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.1)", fontFamily: "'DM Sans', sans-serif" },
                                    pill: { fontFamily: "'Oxanium', sans-serif", fontWeight: 600, fontSize: 11, background: 'rgba(34,211,238,.08)', color: '#22d3ee', border: '1px solid rgba(34,211,238,.2)' }
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 5 }}>
                            <MultiSelect
                                label={
                                    <Text style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 12, color: "#94a3b8", marginBottom: 6, fontWeight: 700 }}>
                                        Role Priority
                                    </Text>
                                }
                                placeholder="Select standard positions"
                                data={[...POSITIONS]}
                                value={selectedPositions}
                                onChange={(values) => setSelectedPositions(values as Position[])}
                                clearable
                                styles={{
                                    input: { background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.1)", fontFamily: "'DM Sans', sans-serif" },
                                    pill: { fontFamily: "'Oxanium', sans-serif", fontWeight: 600, fontSize: 11, background: 'rgba(34,211,238,.08)', color: '#22d3ee', border: '1px solid rgba(34,211,238,.2)' }
                                }}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 2 }}>
                            <Button
                                onClick={handleSearchClick}
                                loading={loading}
                                fullWidth
                                size="md"
                                leftSection={<IconAdjustmentsHorizontal size={18} />}
                                style={{
                                    background: "linear-gradient(135deg, #0891b2, #22d3ee)",
                                    color: "#001a1f",
                                    fontFamily: "'Oxanium', sans-serif",
                                    fontWeight: 800,
                                    letterSpacing: '0.5px',
                                    borderRadius: 10,
                                    boxShadow: '0 0 15px rgba(34,211,238,.3)',
                                    textTransform: 'uppercase'
                                }}
                            >
                                Search
                            </Button>
                        </Grid.Col>
                    </Grid>
                </Box>

                {/* ── Results Area ── */}
                {loading && <Center py={100}><Loader color="cyan" /></Center>}

                {error && (
                    <Center py={100}>
                        <ErrorState message={error} />
                    </Center>
                )}

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
                                    onChange={setActivePage}
                                    color="cyan"
                                    radius="md"
                                    withEdges
                                    styles={{
                                        control: {
                                            background: "rgba(255,255,255,.02)",
                                            border: "1px solid rgba(255,255,255,.05)",
                                            color: "#94a3b8",
                                            fontFamily: "'Oxanium', sans-serif",
                                            "&[data-active]": {
                                                background: "rgba(34,211,238,.1)",
                                                borderColor: "rgba(34,211,238,.3)",
                                                color: "#22d3ee"
                                            }
                                        }
                                    }}
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
