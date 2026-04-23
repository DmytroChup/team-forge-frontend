import { useState } from "react";
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
import type { RegisterRequest } from "../api/models";
import { AxiosError } from "axios";
import { IconAlertCircle } from "@tabler/icons-react";
import classes from "./RegisterPage.module.css";

const BrandGeometry = () => (
    <svg
        viewBox="0 0 420 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.16 }}
    >
        {/* Crossed diagonal lines */}
        <line x1="0" y1="0" x2="420" y2="600" stroke="#f59e0b" strokeWidth="0.6" />
        <line x1="420" y1="0" x2="0" y2="600" stroke="#f59e0b" strokeWidth="0.6" />
        {/* Central circle target */}
        <circle cx="210" cy="300" r="100" stroke="#f59e0b" strokeWidth="1" />
        <circle cx="210" cy="300" r="60" stroke="#f59e0b" strokeWidth="0.7" />
        <circle cx="210" cy="300" r="8" fill="rgba(245,158,11,0.3)" />
        {/* Corner ticks */}
        <path d="M20 20 L60 20 L60 60" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M400 20 L360 20 L360 60" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M20 580 L60 580 L60 540" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M400 580 L360 580 L360 540" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Horizontal rule pair */}
        <line x1="40" y1="80" x2="380" y2="80" stroke="#f59e0b" strokeWidth="0.4" strokeDasharray="3 6" />
        <line x1="40" y1="520" x2="380" y2="520" stroke="#f59e0b" strokeWidth="0.4" strokeDasharray="3 6" />
    </svg>
);

interface RegisterFormValues extends RegisterRequest {
    confirmPassword?: string;
}

export const RegisterPage = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const form = useForm<RegisterFormValues>({
        initialValues: { nickname: "", email: "", password: "", confirmPassword: "" },
        validate: {
            nickname: (v) => v.trim().length >= 3 ? null : "Nickname must be at least 3 characters",
            email: (v) => /^\S+@\S+\.\S+$/.test(v) ? null : "Please enter a valid email address",
            password: (v) => v && v.length >= 8 ? null : "Password must be at least 8 characters",
            confirmPassword: (v, vals) => v === vals.password ? null : "Passwords do not match",
        },
    });

    const handleSubmit = async (values: RegisterFormValues) => {
        setLoading(true);
        setError(null);
        try {
            await authService.registerUser({
                nickname: values.nickname,
                email: values.email,
                password: values.password
            });
            navigate('/search');
        } catch (err) {
            if (err instanceof AxiosError && err.response) {
                setError(err.response.data.message || 'Registration failed. Please try again.');
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
                background: "#080b04",
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
                        "linear-gradient(160deg, #100c01 0%, #16100 50%, #0c0801 100%)",
                    borderRight: "1px solid rgba(245,158,11,0.1)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Box
                    style={{
                        position: "absolute",
                        width: 420,
                        height: 420,
                        borderRadius: "50%",
                        background:
                            "radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        pointerEvents: "none",
                    }}
                />

                <BrandGeometry />

                <Box style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
                    {/* Hexagonal logo mark – amber edition */}
                    <Box style={{ width: 64, height: 64, margin: "0 auto 20px" }}>
                        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <polygon
                                points="32,4 60,20 60,44 32,60 4,44 4,20"
                                stroke="#f59e0b"
                                strokeWidth="1.5"
                                fill="rgba(245,158,11,0.06)"
                            />
                            <polygon
                                points="32,14 50,24 50,40 32,50 14,40 14,24"
                                stroke="#f59e0b"
                                strokeWidth="1"
                                fill="rgba(245,158,11,0.04)"
                            />
                            <text
                                x="32"
                                y="37"
                                textAnchor="middle"
                                fill="#f59e0b"
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
                        <Box component="span" style={{ color: "#f59e0b" }}>
                            FORGE
                        </Box>
                    </Text>

                    <Box
                        style={{
                            height: 2,
                            width: 80,
                            margin: "12px auto 20px",
                            background:
                                "linear-gradient(90deg, transparent, #f59e0b, transparent)",
                            boxShadow: "0 0 12px #f59e0b",
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

                {/* Rank badge decoration */}
                <Box
                    style={{
                        position: "absolute",
                        bottom: 48,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    {["Immortal", "Divine", "Ancient"].map((rank, i) => (
                        <Box
                            key={rank}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                opacity: 0.25 + i * 0.18,
                            }}
                        >
                            <Box
                                style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    background: "#f59e0b",
                                }}
                            />
                            <Text
                                style={{
                                    fontFamily: "'Oxanium', sans-serif",
                                    fontSize: 10,
                                    letterSpacing: 3,
                                    color: "rgba(245,158,11,0.7)",
                                    textTransform: "uppercase" as const,
                                }}
                            >
                                {rank}
                            </Text>
                        </Box>
                    ))}
                </Box>
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
                    <Stack gap={0} mb={32}>
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
                            Create account
                        </Text>
                        <Text
                            style={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: 14,
                                color: "rgba(100,116,139,0.9)",
                            }}
                        >
                            Join TeamForge and find your squad
                        </Text>
                    </Stack>

                    {error && (
                        <Alert icon={<IconAlertCircle size="1rem" />} title="Registration Error" color="red" mb="md" withCloseButton onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <Stack gap="md">
                            <TextInput
                                classNames={{ root: classes.input }}
                                label="Nickname"
                                placeholder="YourDotaAlias"
                                {...form.getInputProps("nickname")}
                            />

                            <TextInput
                                classNames={{ root: classes.input }}
                                label="Email"
                                placeholder="your@email.com"
                                type="email"
                                {...form.getInputProps("email")}
                            />

                            <PasswordInput
                                classNames={{ root: classes.input }}
                                label="Password"
                                placeholder="••••••••"
                                {...form.getInputProps("password")}
                            />

                            <PasswordInput
                                classNames={{ root: classes.input }}
                                label="Confirm Password"
                                placeholder="••••••••"
                                {...form.getInputProps("confirmPassword")}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                loading={loading}
                                classNames={{ root: classes.btn }}
                                mt={4}
                            >
                                {loading ? "Creating…" : "Join TeamForge"}
                            </Button>
                        </Stack>
                    </form>

                    <Divider
                        my="xl"
                        color="rgba(245,158,11,0.1)"
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
                                Already a member?
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
                        Already have an account?{" "}
                        <Anchor
                            component={Link}
                            to="/login"
                            style={{
                                fontFamily: "'Oxanium', sans-serif",
                                fontWeight: 700,
                                fontSize: 13,
                                color: "#f59e0b",
                                letterSpacing: "0.3px",
                            }}
                        >
                            Sign in
                        </Anchor>
                    </Text>
                </Box>
            </Box>
        </Box>
    );
};
