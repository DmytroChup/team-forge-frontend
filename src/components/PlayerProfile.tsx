import { Card, Image, Text, Badge, Group, Center } from '@mantine/core';
import { IconBrandSteam, IconBrandDiscord } from '@tabler/icons-react';
import type { Player } from "../types.ts";

interface PlayerProfileProps {
    player: Player;
}

export function PlayerProfile({ player }: Readonly<PlayerProfileProps>) {
    return (
        <Center>
            <Card shadow="sm" padding="lg" radius="md" withBorder w={400} mt={50}>
                <Card.Section>
                    <Image
                        src="https://cdn.dribbble.com/users/1169343/screenshots/7044451/media/94403f905c6d37016d8a39626b4860cc.png"
                        height={160}
                        alt="Dota Background"
                    />
                </Card.Section>

                <Group justify="space-between" mt="md" mb="xs">
                    <Text fw={700} fz="xl">{player.username}</Text>
                    <Badge color="pink" variant="light">
                        {player.rank} {player.rank !== 'IMMORTAL' && `(${player.stars}★)`}
                    </Badge>
                </Group>

                <Text size="sm" c="dimmed" mb="md">
                    Positions: {player.positions.join(', ')}
                </Text>

                <Group gap="xs" mb="md">
                    <Badge leftSection={<IconBrandSteam size={14} />} color="blue" variant="outline">
                        {player.steamId}
                    </Badge>
                    <Badge leftSection={<IconBrandDiscord size={14} />} color="indigo" variant="outline">
                        {player.discordId}
                    </Badge>
                </Group>
            </Card>
        </Center>
    );
}