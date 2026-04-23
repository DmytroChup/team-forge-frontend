import { Group, Button, Box, Anchor, Text, Menu, Avatar, UnstyledButton, rem } from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useEffect, useState } from "react";
import type { UserResponse } from "../api/models";
import {
    IconLogout,
    IconSettings,
    IconChevronDown,
    IconDeviceGamepad2,
    IconSwords
} from '@tabler/icons-react';

export default function Navbar() {
    const isAuthenticated = authService.isAuthenticated();
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState<UserResponse | null>(
        authService.getCurrentUser()
    );

    useEffect(() => {
        if (isAuthenticated && !currentUser) {
            authService.fetchAndCacheCurrentUser().then(user => {
                setCurrentUser(user);
            });
        }
    }, [currentUser, isAuthenticated]);

    const handleLogout = async () => {
        await authService.logoutUser();
        navigate('/login');
    };

    // Генерируем инициалы для аватарки в меню
    const initials = currentUser?.nickname
        ? currentUser.nickname.slice(0, 2).toUpperCase()
        : "TF";

    return (
        <Box
            component="header"
            h={60}
            px="md"
            style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(4, 9, 15, 0.8)', // Полупрозрачный темный фон
                backdropFilter: 'blur(10px)', // Размытие заднего фона (эффект стекла)
                borderBottom: '1px solid rgba(34,211,238,.1)', // Фирменный голубой бордер
                position: 'sticky',
                top: 0,
                zIndex: 100,
            }}
        >
            <Group justify="space-between" style={{ width: '100%' }}>

                {/* ── Logo ── */}
                <Anchor
                    component={Link}
                    to="/"
                    style={{
                        fontFamily: "'Oxanium', sans-serif",
                        fontWeight: 800,
                        fontSize: 22,
                        letterSpacing: "-0.5px",
                        color: "#f1f5f9",
                        textDecoration: "none"
                    }}
                >
                    TEAM<Box component="span" style={{ color: "#22d3ee" }}>FORGE</Box>
                </Anchor>

                {isAuthenticated ? (
                    <Group>
                        <Button
                            component={Link}
                            to="/search"
                            variant="default"
                            style={{
                                background: "rgba(255,255,255,.03)",
                                border: "1px solid rgba(255,255,255,.1)",
                                fontFamily: "'Oxanium', sans-serif",
                                fontWeight: 600,
                                letterSpacing: 0.5,
                            }}
                        >
                            Player Search
                        </Button>

                        {/* ── Выпадающее меню профиля ── */}
                        {currentUser && (
                            <Menu
                                width={220}
                                position="bottom-end"
                                transitionProps={{ transition: 'pop-top-right' }}
                                withinPortal
                                shadow="xl"
                            >
                                <Menu.Target>
                                    <UnstyledButton
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '4px 12px 4px 4px',
                                            borderRadius: 30,
                                            background: 'rgba(34,211,238,.05)',
                                            border: '1px solid rgba(34,211,238,.2)',
                                            transition: 'background-color 150ms ease',
                                        }}
                                    >
                                        <Avatar
                                            size={30}
                                            radius={30}
                                            style={{
                                                background: 'linear-gradient(135deg, #0891b2, #22d3ee)',
                                                color: '#001a1f',
                                                fontFamily: "'Oxanium', sans-serif",
                                                fontWeight: 800,
                                                fontSize: 12
                                            }}
                                        >
                                            {initials}
                                        </Avatar>
                                        <Text
                                            ml="sm"
                                            mr="xs"
                                            size="sm"
                                            style={{
                                                fontFamily: "'Oxanium', sans-serif",
                                                fontWeight: 600,
                                                color: '#f1f5f9',
                                                maxWidth: 100,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {currentUser.nickname}
                                        </Text>
                                        <IconChevronDown size={14} stroke={2} color="#22d3ee" />
                                    </UnstyledButton>
                                </Menu.Target>

                                <Menu.Dropdown
                                    style={{
                                        background: '#04090f', // Темный фон меню
                                        border: '1px solid rgba(34,211,238,.15)',
                                    }}
                                >
                                    {/* Секция: Игровые профили */}
                                    <Menu.Label style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(148,163,184,.6)", fontSize: 10, letterSpacing: 1 }}>
                                        GAMING PROFILES
                                    </Menu.Label>
                                    <Menu.Item
                                        component={Link}
                                        to={`/profile/${currentUser.nickname}`}
                                        leftSection={<IconDeviceGamepad2 style={{ width: rem(16), height: rem(16) }} color="#22d3ee" />}
                                        style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 600 }}
                                    >
                                        Dota 2 Profile
                                    </Menu.Item>

                                    {/* Заглушка для будущей игры (CS2) */}
                                    <Menu.Item
                                        disabled
                                        leftSection={<IconSwords style={{ width: rem(16), height: rem(16) }} color="gray" />}
                                        style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 600 }}
                                    >
                                        CS2 Profile (Soon)
                                    </Menu.Item>

                                    <Menu.Divider color="rgba(34,211,238,.1)" />

                                    {/* Секция: Настройки аккаунта */}
                                    <Menu.Label style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(148,163,184,.6)", fontSize: 10, letterSpacing: 1 }}>
                                        ACCOUNT
                                    </Menu.Label>
                                    <Menu.Item
                                        component={Link}
                                        to="/settings"
                                        leftSection={<IconSettings style={{ width: rem(16), height: rem(16) }} color="#94a3b8" />}
                                        style={{ fontFamily: "'Oxanium', sans-serif" }}
                                    >
                                        Settings
                                    </Menu.Item>

                                    {/* Кнопка выхода */}
                                    <Menu.Item
                                        onClick={handleLogout}
                                        color="red"
                                        leftSection={<IconLogout style={{ width: rem(16), height: rem(16) }} />}
                                        style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 600, marginTop: 4 }}
                                    >
                                        Logout
                                    </Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
                        )}
                    </Group>
                ) : (
                    <Group>
                        <Button
                            component={Link}
                            to="/login"
                            variant="default"
                            style={{
                                background: "rgba(34,211,238,.05)",
                                border: "1px solid rgba(34,211,238,.2)",
                                color: "#22d3ee",
                                fontFamily: "'Oxanium', sans-serif",
                            }}
                        >
                            Sign In
                        </Button>
                        <Button
                            component={Link}
                            to="/register"
                            style={{
                                background: "linear-gradient(135deg, #0891b2, #22d3ee)",
                                color: "#001a1f",
                                fontFamily: "'Oxanium', sans-serif",
                                fontWeight: 800,
                            }}
                        >
                            Create Account
                        </Button>
                    </Group>
                )}
            </Group>
        </Box>
    );
}