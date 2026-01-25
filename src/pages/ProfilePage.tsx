import {Container, Title, Loader, Center, Text, Button, Stack} from '@mantine/core';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { PlayerProfile } from '../components/PlayerProfile';
import type { Player } from '../types';
import {useNavigate, useParams} from "react-router-dom";

export function ProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [player, setPlayer] = useState<Player | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get<Player>(`http://localhost:8080/api/players/${id}`);
                setPlayer(response.data);
            } catch (err) {
                console.error(err);
                setError(`Failed to load profile. Maybe player with ID ${id} doesn't exist?`);
            } finally {
                setLoading(false);
            }
        };

        void fetchProfile();
    }, [id]);

    if (loading) return <Center mt="xl"><Loader /></Center>;
    if (error) return (
      <Container size="md" py="xl">
          <Stack align="center">
              <Text c="red" mb="md">{error}</Text>
              <Button onClick={() => navigate('/register')}>Go to Registration</Button>
          </Stack>
      </Container>
    );

    return (
        <Container size="md" py="xl">
            <Title ta="center" mb="lg">My Profile</Title>
            {player && <PlayerProfile player={player} />}
        </Container>
    );
}