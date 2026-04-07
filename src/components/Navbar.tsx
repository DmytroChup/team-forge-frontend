import { Group, Button, Box, Anchor } from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function Navbar() {
    const isAuthenticated = authService.isAuthenticated();
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logoutUser();
        navigate('/login');
    };

    return (
        <Box
            component="header"
            h={60}
            px="md"
            style={{
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid var(--mantine-color-default-border)'
            }}
        >
            <Group justify="space-between" style={{ width: '100%' }}>
                <Anchor component={Link} to="/" fw={700} size="lg">
                    TeamForge
                </Anchor>

                {isAuthenticated ? (
                    <Group>
                        <Button component={Link} to="/search" variant="default">
                            Player Search
                        </Button>
                        <Button onClick={handleLogout} variant="outline">
                            Logout
                        </Button>
                    </Group>
                ) : (
                    <Group>
                        <Button component={Link} to="/login" variant="default">
                            Login
                        </Button>
                        <Button component={Link} to="/register">
                            Register
                        </Button>
                    </Group>
                )}
            </Group>
        </Box>
    );
}