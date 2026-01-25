import {
    TextInput,
    NumberInput,
    Select,
    MultiSelect,
    Button,
    Paper,
    Title,
    Container,
    Group
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconBrandSteam, IconBrandDiscord } from '@tabler/icons-react';
import axios from 'axios';
import type { Player } from "../types.ts";

interface RegisterFormProps {
    onSuccess: (player: Player) => void;
}

interface FormValues {
    username: string;
    steamId: string;
    discordId: string;
    rank: string;
    stars: number;
    positions: string[];
}

export function RegisterForm({ onSuccess }: Readonly<RegisterFormProps>) {
    const form = useForm<FormValues>({
        initialValues: {
            username: '',
            steamId: '',
            discordId: '',
            rank: '',
            stars: 1,
            positions: [],
        },

        validate: {
            username: (value) => (value.length < 2 ? 'Username is too short' : null),
            steamId: (value) => (/^\d{17}$/.test(value) ? null : 'Steam ID must be exactly 17 digits'),
            discordId: (value) => (value.length < 5 ? 'Invalid Discord ID' : null),
            rank: (value) => (value ? null : 'Please select a rank'),
            positions: (value) => (value.length === 0 ? 'Select at least one position' : null),
        },
    });

    const handleSubmit = async (values: FormValues) => {
        try {
            const response = await axios.post<Player>("http://localhost:8080/api/players", values);

            console.log("Success:", response.data);
            onSuccess(response.data);
            form.reset();

        } catch (error) {
            if(axios.isAxiosError(error) && error.response) {
                const data = error.response.data as { message: string }
                const errorMessage = data.message || 'Something went wrong';

                alert(`Error: ${errorMessage}`);
            } else {
              console.error("Unknown error:", error);
              alert('Network error or server is down');
            }
        }
    };

    return (
        <Container size={420} my={40}>
            <Title ta="center">Join TeamForge</Title>

            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <form onSubmit={form.onSubmit(handleSubmit)}>

                    <TextInput
                        label="Username"
                        placeholder="Dendi"
                        required
                        mt="md"
                        {...form.getInputProps('username')}
                    />

                    <TextInput
                        label="Steam ID (64)"
                        placeholder="765611..."
                        description="Your 64-bit Steam ID"
                        required
                        mt="md"
                        rightSection={<IconBrandSteam size={16} />}
                        {...form.getInputProps('steamId')}
                    />

                    <TextInput
                        label="Discord ID"
                        placeholder="Your numeric Discord ID"
                        mt="md"
                        required
                        rightSection={<IconBrandDiscord size={16} />}
                        {...form.getInputProps('discordId')}
                    />

                    <Group grow mt="md">
                        <Select
                            label="Rank"
                            placeholder="Select Medal"
                            data={['HERALD', 'GUARDIAN', 'CRUSADER', 'ARCHON', 'LEGEND', 'ANCIENT', 'DIVINE', 'IMMORTAL']}
                            required
                            {...form.getInputProps('rank')}
                        />
                        <NumberInput
                            label="Stars"
                            min={1}
                            max={5}
                            disabled={form.values.rank === 'IMMORTAL'}
                            {...form.getInputProps('stars')}
                        />
                    </Group>

                    <MultiSelect
                        label="Positions"
                        placeholder="Select positions"
                        data={['CARRY', 'MID', 'OFFLANE', 'SOFT_SUPPORT', 'HARD_SUPPORT']}
                        mt="md"
                        required
                        {...form.getInputProps('positions')}
                    />

                    <Button fullWidth mt="xl" type="submit">
                        Create Profile
                    </Button>
                </form>
            </Paper>
        </Container>
    );
}