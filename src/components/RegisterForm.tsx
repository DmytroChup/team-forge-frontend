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

interface FormValues {
    username: string;
    steamId: string;
    discordId: string;
    rank: string;
    stars: number;
    positions: string[];
}

export function RegisterForm() {
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

    const handleSubmit = (values: FormValues) => {
        console.log('Form is valid, sending:', values);
        alert(JSON.stringify(values, null, 2));
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