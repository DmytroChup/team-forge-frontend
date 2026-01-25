import { Container, Paper, Title, Button, TextInput, PasswordInput } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
    const navigate = useNavigate();

    return (
        <Container size={420} my={40}>
            <Title ta="center">Welcome Back</Title>
            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <TextInput label="Username" placeholder="Dendi" required />
                <PasswordInput label="Password" placeholder="Your password" required mt="md" />

                <Button fullWidth mt="xl" onClick={() => {
                    alert("Login logic coming soon (Requires Spring Security)");
                    navigate('/profile');
                }}>
                    Sign In
                </Button>
            </Paper>
        </Container>
    );
}