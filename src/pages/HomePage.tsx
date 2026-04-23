import { Container, Title, Text, Button, Group, Box } from '@mantine/core';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { authService } from '../services/authService';

export function HomePage() {
    const isAuthenticated = authService.isAuthenticated();

    return (
        <>
            {/* ── Header Navigation ── */}
            <Navbar />

            <Box
                style={{
                    // Full height minus Navbar height
                    minHeight: 'calc(100vh - 60px)',
                    // Cyberpunk glowing effect from the top
                    background: 'radial-gradient(circle at 50% -20%, rgba(34, 211, 238, 0.15), transparent 60%)',
                    display: 'flex',
                    alignItems: 'center',
                    paddingBottom: '10vh'
                }}
            >
                <Container size="md" style={{ textAlign: 'center' }}>
                    {/* ── Hero Title with Neon Effect ── */}
                    <Title
                        order={1}
                        style={{
                            fontFamily: "'Oxanium', sans-serif",
                            fontWeight: 900,
                            fontSize: 'clamp(3.5rem, 8vw, 6rem)',
                            lineHeight: 1.1,
                            letterSpacing: '-2px',
                            marginBottom: '24px',
                            background: 'linear-gradient(135deg, #f1f5f9 20%, #22d3ee 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0px 4px 24px rgba(34, 211, 238, 0.3))'
                        }}
                    >
                        FORGE YOUR<br />DREAM TEAM
                    </Title>

                    {/* ── Subtitle Description ── */}
                    <Text
                        size="lg"
                        mb="xl"
                        style={{
                            fontFamily: "'DM Sans', sans-serif",
                            color: 'rgba(148,163,184, 0.9)',
                            maxWidth: '600px',
                            margin: '0 auto 40px auto',
                            lineHeight: 1.6,
                            fontSize: '1.2rem'
                        }}
                    >
                        Stop losing MMR with randoms. Find perfect teammates, synchronize your roles, and dominate ranked matchmaking.
                    </Text>

                    {/* ── Dynamic Call-to-Action Buttons ── */}
                    <Group justify="center" gap="md">
                        {isAuthenticated ? (
                            <>
                                <Button
                                    component={Link}
                                    to="/search"
                                    size="lg"
                                    style={{
                                        background: "linear-gradient(135deg, #0891b2, #22d3ee)",
                                        color: "#001a1f",
                                        fontFamily: "'Oxanium', sans-serif",
                                        fontWeight: 800,
                                        letterSpacing: '0.5px',
                                        boxShadow: '0 0 20px rgba(34,211,238,.3)',
                                    }}
                                >
                                    START SEARCHING
                                </Button>
                                <Button
                                    component={Link}
                                    to={`/profile/${authService.getCurrentUser()?.nickname}`}
                                    size="lg"
                                    variant="default"
                                    style={{
                                        background: "rgba(34,211,238,.05)",
                                        border: "1px solid rgba(34,211,238,.2)",
                                        color: "#22d3ee",
                                        fontFamily: "'Oxanium', sans-serif",
                                        fontWeight: 600,
                                    }}
                                >
                                    MY PROFILE
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    component={Link}
                                    to="/register"
                                    size="lg"
                                    style={{
                                        background: "linear-gradient(135deg, #0891b2, #22d3ee)",
                                        color: "#001a1f",
                                        fontFamily: "'Oxanium', sans-serif",
                                        fontWeight: 800,
                                        letterSpacing: '0.5px',
                                        boxShadow: '0 0 20px rgba(34,211,238,.3)'
                                    }}
                                >
                                    JOIN THE FORGE
                                </Button>
                                <Button
                                    component={Link}
                                    to="/login"
                                    size="lg"
                                    variant="default"
                                    style={{
                                        background: "rgba(255,255,255,.03)",
                                        border: "1px solid rgba(255,255,255,.1)",
                                        color: "#f1f5f9",
                                        fontFamily: "'Oxanium', sans-serif",
                                        fontWeight: 600,
                                    }}
                                >
                                    SIGN IN
                                </Button>
                            </>
                        )}
                    </Group>
                </Container>
            </Box>
        </>
    );
}