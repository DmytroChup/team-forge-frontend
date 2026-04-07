import { useState, useEffect } from 'react';
import { Container, Title, Grid, Card, Text, MultiSelect, Button, Loader, Alert, Center, Badge } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { profileService } from '../services/profileService';
import type { DotaProfileResponse, Rank, Position } from '../api/models';
import { RANKS, POSITIONS } from '../api/models';
import { AxiosError } from 'axios';
import { Link } from 'react-router-dom';

export function PlayerSearch() {
    const [players, setPlayers] = useState<DotaProfileResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for filters
    const [selectedRanks, setSelectedRanks] = useState<Rank[]>([]);
    const [selectedPositions, setSelectedPositions] = useState<Position[]>([]);

    const fetchAllPlayers = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await profileService.getAllPlayers();
            setPlayers(data);
        } catch (err) {
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch all players on initial component mount
        fetchAllPlayers();
    }, []);

    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        try {
            const searchCriteria = { ranks: selectedRanks, positions: selectedPositions };
            const data = await profileService.searchPlayers(searchCriteria);
            setPlayers(data);
        } catch (err) {
            handleApiError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApiError = (err: unknown) => {
        if (err instanceof AxiosError && err.response) {
            setError(err.response.data.message || 'Failed to fetch player data.');
        } else {
            setError('An unexpected error occurred.');
        }
    };

    const renderPlayerCard = (player: DotaProfileResponse) => (
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={player.profileId}>
            <Card shadow="sm" padding="lg" radius="md" withBorder component={Link} to={`/profile/${player.profileId}`}>
                <Center>
                    <img src={player.avatarUrl} alt={`${player.nickname}'s avatar`} style={{ width: 100, height: 100, borderRadius: '50%' }} />
                </Center>
                <Text fw={500} ta="center" mt="md">{player.nickname}</Text>
                <Text size="sm" c="dimmed" ta="center">MMR: {player.mmr ?? 'N/A'}</Text>
                
                <Center mt="sm">
                    {player.rank && <Badge color="blue">{player.rank} {player.stars}</Badge>}
                </Center>

                <Text size="xs" mt="md">Positions:</Text>
                <Center>
                    {player.positions?.map(pos => <Badge key={pos} variant="light" color="gray" m={2}>{pos}</Badge>)}
                </Center>
            </Card>
        </Grid.Col>
    );

    return (
        <Container my="xl">
            <Title order={2} mb="lg">Player Search</Title>
            
            <Grid gutter="md" mb="xl">
                <Grid.Col span={{ base: 12, md: 5 }}>
                    <MultiSelect
                        label="Filter by Rank"
                        placeholder="Select ranks"
                        data={[...RANKS]} // Use spread to satisfy Mantine's type requirement for data
                        value={selectedRanks}
                        onChange={(values) => setSelectedRanks(values as Rank[])} // Cast the string[] back to Rank[]
                        clearable
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 5 }}>
                    <MultiSelect
                        label="Filter by Position"
                        placeholder="Select positions"
                        data={[...POSITIONS]} // Use spread for consistency
                        value={selectedPositions}
                        onChange={(values) => setSelectedPositions(values as Position[])} // Cast the string[] back to Position[]
                        clearable
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 2 }} style={{ alignSelf: 'flex-end' }}>
                    <Button onClick={handleSearch} loading={loading} fullWidth>Search</Button>
                </Grid.Col>
            </Grid>

            {loading && <Center><Loader /></Center>}

            {error && (
                <Alert icon={<IconAlertCircle size="1rem" />} title="Error" color="red" withCloseButton onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {!loading && !error && (
                <Grid>
                    {players.length > 0 ? (
                        players.map(renderPlayerCard)
                    ) : (
                        <Grid.Col span={12}>
                            <Center><Text>No players found matching your criteria.</Text></Center>
                        </Grid.Col>
                    )}
                </Grid>
            )}
        </Container>
    );
}
