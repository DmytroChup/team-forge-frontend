import { Container, Title, Text} from '@mantine/core';
import Navbar from '../components/Navbar';

export function HomePage() {
    return (
        <>
            <Navbar />
            <Container size="md" style={{ textAlign: 'center', paddingTop: '100px' }}>
                <Title order={1} style={{ fontSize: '4rem', marginBottom: '20px' }}>
                    TeamForge
                </Title>
                <Text size="xl" c="dimmed" mb="xl">
                    Your ultimate platform to find the perfect teammates for Dota 2.
                </Text>
            </Container>
        </>
    );
}
