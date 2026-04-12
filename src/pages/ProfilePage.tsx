import { Box, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/api';
import { PlayerProfile } from '../components/PlayerProfile';
import type { DotaProfileResponse } from '../api/models';
import classes from './ProfilePage.module.css';

// ── Loading state ─────────────────────────────────────────────────────────────
function LoadingState() {
    return (
        <Box style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, paddingTop: 80 }}>
            {/* Используем класс из модуля */}
            <div className={classes.spinner} />
            <Text style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "rgba(100,116,139,.6)" }}>
                Loading profile…
            </Text>
        </Box>
    );
}

// ── Error state ───────────────────────────────────────────────────────────────
function ErrorState({ message }: Readonly<{ message: string }>) {
    return (
        <Box
            style={{
                maxWidth: 420,
                width: "100%",
                background: "rgba(239,68,68,.06)",
                border: "0.5px solid rgba(239,68,68,.25)",
                borderRadius: 10,
                padding: "24px 28px",
                textAlign: "center",
            }}
        >
            {/* X icon drawn with SVG – no external dep */}
            <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                style={{ margin: "0 auto 12px", display: "block" }}
            >
                <circle cx="16" cy="16" r="15" stroke="rgba(239,68,68,.5)" strokeWidth="1" />
                <path d="M11 11 L21 21 M21 11 L11 21" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <Text
                style={{
                    fontFamily: "'Oxanium', sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    letterSpacing: 0.5,
                    color: "#f87171",
                    marginBottom: 6,
                }}
            >
                Profile not found
            </Text>
            <Text
                style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    color: "rgba(148,163,184,.7)",
                    lineHeight: 1.55,
                }}
            >
                {message}
            </Text>
        </Box>
    );
}

// ── ProfilePage ───────────────────────────────────────────────────────────────

export function ProfilePage() {
    const { id } = useParams<{ id: string }>();
    const [profile, setProfile] = useState<DotaProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!id) {
                setError("Player ID is missing from the URL.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const response = await apiClient.get<DotaProfileResponse>(
                    `/api/profiles/dota/${id}`
                );
                setProfile(response.data);
                setError(null);
            } catch (err) {
                setError("This player doesn't exist or their profile is unavailable.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        void fetchProfile();
    }, [id]);

    return (
        <div className={classes.pageRoot}>
            {loading && <LoadingState />}
            {!loading && error && <ErrorState message={error} />}
            {!loading && !error && profile && (
                <Box style={{ width: "100%", maxWidth: 640 }}>
                    <PlayerProfile profile={profile} />
                </Box>
            )}
        </div>
    );
}
