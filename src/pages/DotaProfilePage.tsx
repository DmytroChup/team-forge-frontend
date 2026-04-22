import { Box, Button, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/api';
import { DotaProfile } from '../components/DotaProfile.tsx';
import type { DotaProfileResponse } from '../api/models';
import classes from './ProfilePage.module.css';
import { getCurrentUser } from "../services/authService.ts";
import { isAxiosError } from "axios";
import { EditProfileModal } from "../components/EditProfileModal.tsx";

// ── Loading state ─────────────────────────────────────────────────────────────
function LoadingState() {
    return (
        <Box style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, paddingTop: 80 }}>
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

// ── DotaProfilePage ───────────────────────────────────────────────────────────────

export function DotaProfilePage() {
    const { nickname } = useParams<{ nickname: string }>();
    const [profile, setProfile] = useState<DotaProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [createModalOpened, setCreateModalOpened] = useState(false);

    const currentUser = getCurrentUser();
    const isOwner = !!currentUser && currentUser.nickname === nickname;

    useEffect(() => {
        const fetchProfile = async () => {
            if (!nickname) {
                setError("Nickname is missing from the URL.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const response = await apiClient.get<DotaProfileResponse>(
                    `/api/profiles/dota/by-nickname/${nickname}`
                );
                setProfile(response.data);
                setError(null);
            } catch (err: unknown) {
                if (isAxiosError(err)) {
                    if (err.response?.status === 404 && isOwner) {
                        setProfile(null);
                        setError(null);
                    } else {
                        setError("This player doesn't exist or their profile is unavailable.");
                    }
                } else {
                    setError("An unexpected error occurred.");
                }
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        void fetchProfile();
    }, [nickname, isOwner]);

    return (
        <div className={classes.pageRoot} style={{ display: 'flex', justifyContent: 'center', paddingTop: '40px' }}>
            {loading && <LoadingState />}
            {!loading && error && <ErrorState message={error} />}

            {!loading && !error && !profile && isOwner && (
                <Box
                    style={{
                        maxWidth: 480,
                        width: "100%",
                        background: "rgba(34,211,238,.03)",
                        border: "1px dashed rgba(34,211,238,.3)",
                        borderRadius: 12,
                        padding: "40px 28px",
                        textAlign: "center",
                    }}
                >
                    <Text
                        style={{
                            fontFamily: "'Oxanium', sans-serif",
                            fontWeight: 800,
                            fontSize: 22,
                            color: "#f1f5f9",
                            marginBottom: 8,
                            letterSpacing: "-0.5px"
                        }}
                    >
                        INITIATE DOTA 2 LINK
                    </Text>
                    <Text
                        style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 14,
                            color: "rgba(148,163,184,.8)",
                            marginBottom: 28,
                            lineHeight: 1.6
                        }}
                    >
                        You don't have a Dota 2 profile set up yet. Create one to specify your roles, let others know you're looking for a team, and track your stats.
                    </Text>
                    <Button
                        onClick={() => setCreateModalOpened(true)}
                        size="md"
                        style={{
                            background: "linear-gradient(135deg, #0891b2, #22d3ee)",
                            color: "#001a1f",
                            fontFamily: "'Oxanium', sans-serif",
                            fontWeight: 800,
                            letterSpacing: '0.5px',
                            boxShadow: '0 0 15px rgba(34,211,238,.2)'
                        }}
                    >
                        CREATE DOTA 2 PROFILE
                    </Button>

                    <EditProfileModal
                        opened={createModalOpened}
                        onClose={() => setCreateModalOpened(false)}
                        isCreating={true}
                        profile={{
                            nickname: currentUser?.nickname,
                            positions: [],
                            lookingForTeam: true,
                            aboutMe: "",
                        } as unknown as DotaProfileResponse}
                        onSaved={(updatedProfile) => {
                            setProfile(updatedProfile);
                            setCreateModalOpened(false);
                        }}
                    />
                </Box>
            )}

            {!loading && !error && profile && (
                <Box style={{ width: "100%", maxWidth: 640 }}>
                    <DotaProfile
                        profile={profile}
                        isOwner={isOwner}
                        onDeleted={() => setProfile(null)}
                    />
                </Box>
            )}
        </div>
    );
}
