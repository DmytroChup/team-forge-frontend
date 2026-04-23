import {
    Box,
    TextInput,
    PasswordInput,
    Button,
    Text,
    Anchor,
    Divider,
    Stack,
    Alert,
} from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "@mantine/form";
import { authService } from "../services/authService";
import { AxiosError } from "axios";
import { IconAlertCircle } from "@tabler/icons-react";
import classes from "./LoginPage.module.css";
import { useState } from "react";

const BrandGeometry= () => (
    <svg
        viewBox="0 0 420 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.18 }}
    >
        {/* Large rotating diamond */}
        <rect x="130" y="160" width="160" height="160" rx="6" transform="rotate(45 210 240)" stroke="#22d3ee" strokeWidth="1.5" />
        {/* Inner diamond */}
        <rect x="155" y="185" width="110" height="110" rx="4" transform="rotate(45 210 240)" stroke="#22d3ee" strokeWidth="0.8" />
        {/* Corner brackets */}
        <path d="M40 40 L40 80 L80 80" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M380 40 L380 80 L340 80" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M40 560 L40 520 L80 520" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M380 560 L380 520 L340 520" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" />
        {/* Horizontal scan lines */}
        <line x1="0" y1="100" x2="420" y2="100" stroke="#22d3ee" strokeWidth="0.4" strokeDasharray="4 8" />
        <line x1="0" y1="460" x2="420" y2="460" stroke="#22d3ee" strokeWidth="0.4" strokeDasharray="4 8" />
        {/* Dot grid */}
        {Array.from({ length: 6 }, (_, row) =>
            Array.from({ length: 4 }, (_, col) => (
                <circle
                    key={`${row}-${col}`}
                    cx={50 + col * 100}
                    cy={490 + row * 20}
                    r="1.5"
                    fill="#22d3ee"
                />
            ))
        )}
    </svg>
);

export const LoginPage = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const form = useForm({
        initialValues: {
            email: "",
            password: "",
        },
        validate: {
            email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : "Please enter a valid email address"),
            password: (v) => (v ? null : "Password cannot be empty"),
        },
    });

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);
        setError(null);
        try {
            await authService.loginUser({ email: values.email, password: values.password });
            navigate('/search');
        } catch (err) {
            if (err instanceof AxiosError && err.response) {
                setError(err.response.data.message || 'Login failed. Check your credentials.');
            } else {
                setError('An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            style={{
                minHeight: "100vh",
                display: "flex",
                background: "#04090f",
                fontFamily: "'DM Sans', sans-serif",
            }}
        >
            {/* ── LEFT: Brand panel ── */}
            <Box
                className={classes.brand}
                style={{
                    width: "45%",
                    minHeight: "100vh",
                    position: "relative",
                    overflow: "hidden",
                    background:
                        "linear-gradient(160deg, #050e18 0%, #071520 50%, #030d16 100%)",
                    borderRight: "1px solid rgba(34,211,238,0.1)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0,
                }}
            >
                {/* Radial glow behind the logo */}
                <Box
                    style={{
                        position: "absolute",
                        width: 400,
                        height: 400,
                        borderRadius: "50%",
                        background:
                            "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        pointerEvents: "none",
                    }}
                />

                <BrandGeometry />

                {/* Logo */}
                <Box style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
                    {/* Icon mark */}
                    <Box
                        style={{
                            width: 64,
                            height: 64,
                            margin: "0 auto 20px",
                            position: "relative",
                        }}
                    >
                        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <polygon
                                points="32,4 60,20 60,44 32,60 4,44 4,20"
                                stroke="#22d3ee"
                                strokeWidth="1.5"
                                fill="rgba(34,211,238,0.06)"
                            />
                            <polygon
                                points="32,14 50,24 50,40 32,50 14,40 14,24"
                                stroke="#22d3ee"
                                strokeWidth="1"
                                fill="rgba(34,211,238,0.04)"
                            />
                            <text
                                x="32"
                                y="37"
                                textAnchor="middle"
                                fill="#22d3ee"
                                fontSize="18"
                                fontFamily="Oxanium"
                                fontWeight="800"
                            >
                                TF
                            </text>
                        </svg>
                    </Box>

                    <Text
                        style={{
                            fontFamily: "'Oxanium', sans-serif",
                            fontWeight: 800,
                            fontSize: 42,
                            letterSpacing: "-1px",
                            color: "#f1f5f9",
                            lineHeight: 1,
                            marginBottom: 6,
                        }}
                    >
                        TEAM
                        <Box component="span" style={{ color: "#22d3ee" }}>
                            FORGE
                        </Box>
                    </Text>

                    {/* Glowing underline */}
                    <Box
                        style={{
                            height: 2,
                            width: 80,
                            margin: "12px auto 20px",
                            background: "linear-gradient(90deg, transparent, #22d3ee, transparent)",
                            boxShadow: "0 0 12px #22d3ee",
                        }}
                    />

                    <Text
                        style={{
                            fontFamily: "'Oxanium', sans-serif",
                            fontSize: 11,
                            letterSpacing: 4,
                            color: "rgba(148,163,184,0.7)",
                            textTransform: "uppercase" as const,
                        }}
                    >
                        Dota 2 · Find Your Team
                    </Text>
                </Box>

                {/* Bottom quote */}
                <Text
                    style={{
                        position: "absolute",
                        bottom: 40,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 12,
                        color: "rgba(100,116,139,0.6)",
                        letterSpacing: 0.3,
                        textAlign: "center",
                        padding: "0 40px",
                    }}
                >
                    "Forge alliances. Dominate the Ancient."
                </Text>
            </Box>

            {/* ── RIGHT: Form panel ── */}
            <Box
                className={classes.form}
                style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "60px 40px",
                }}
            >
                <Box style={{ width: "100%", maxWidth: 380 }}>
                    <Stack gap={0} mb={36}>
                        <Text
                            style={{
                                fontFamily: "'Oxanium', sans-serif",
                                fontWeight: 700,
                                fontSize: 26,
                                color: "#f1f5f9",
                                letterSpacing: "-0.3px",
                                marginBottom: 6,
                            }}
                        >
                            Welcome back
                        </Text>
                        <Text
                            style={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: 14,
                                color: "rgba(100,116,139,0.9)",
                            }}
                        >
                            Sign in to your TeamForge account
                        </Text>
                    </Stack>

                    {error && (
                        <Alert icon={<IconAlertCircle size="1rem" />} title="Login Error" color="red" mb="md" withCloseButton onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <Stack gap="lg">
                            <TextInput
                                classNames={{ root: classes.input }}
                                label="Email"
                                placeholder="your@email.com"
                                {...form.getInputProps('email')}
                            />

                            <PasswordInput
                                classNames={{ root: classes.input }}
                                label="Password"
                                placeholder="••••••••"
                                {...form.getInputProps('password')}
                            />

                            <Box style={{ display: "flex", justifyContent: "flex-end", marginTop: -8 }}>
                                <Anchor
                                    component={Link}
                                    to="/forgot-password"
                                    style={{
                                        fontFamily: "'DM Sans', sans-serif",
                                        fontSize: 12,
                                        color: "rgba(34,211,238,0.7)",
                                    }}
                                >
                                    Forgot password?
                                </Anchor>
                            </Box>

                            <Button
                                type="submit"
                                fullWidth
                                loading={loading}
                                classNames={{ root: classes.btn }}
                            >
                                {loading ? "Signing in…" : "Sign In"}
                            </Button>
                        </Stack>
                    </form>

                    <Divider
                        my="xl"
                        color="rgba(34,211,238,0.1)"
                        label={
                            <Text
                                style={{
                                    fontFamily: "'Oxanium', sans-serif",
                                    fontSize: 10,
                                    letterSpacing: 2,
                                    color: "rgba(100,116,139,0.5)",
                                    textTransform: "uppercase" as const,
                                }}
                            >
                                New here?
                            </Text>
                        }
                        labelPosition="center"
                    />

                    <Text
                        ta="center"
                        style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 13,
                            color: "rgba(100,116,139,0.8)",
                        }}
                    >
                        Don't have an account?{" "}
                        <Anchor
                            component={Link}
                            to="/register"
                            style={{
                                fontFamily: "'Oxanium', sans-serif",
                                fontWeight: 700,
                                fontSize: 13,
                                color: "#22d3ee",
                                letterSpacing: "0.3px",
                            }}
                        >
                            Create one
                        </Anchor>
                    </Text>
                </Box>
            </Box>
        </Box>
    );
};
