import { Avatar, Badge, Group, Text, Box, Button, Stack, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { DotaProfileResponse } from "../api/models";
import classes from './DotaProfile.module.css';
import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { EditProfileModal } from "./EditProfileModal";
import apiClient from "../api/api";
import { parseRankTier, RANK_COLORS, ROMAN } from '../utils/rankParser';

const BannerGeo = () => (
    <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.12, pointerEvents: "none" }}
        viewBox="0 0 700 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="0" y1="0" x2="700" y2="160" stroke="#22d3ee" strokeWidth="0.6" />
      <line x1="700" y1="0" x2="0" y2="160" stroke="#22d3ee" strokeWidth="0.6" />
      <line x1="0" y1="53" x2="700" y2="53" stroke="#22d3ee" strokeWidth="0.4" strokeDasharray="4 10" />
      <line x1="0" y1="107" x2="700" y2="107" stroke="#22d3ee" strokeWidth="0.4" strokeDasharray="4 10" />
      <circle cx="580" cy="80" r="55" stroke="#22d3ee" strokeWidth="0.5" />
      <circle cx="580" cy="80" r="28" stroke="#22d3ee" strokeWidth="0.5" />
      <path d="M30 20 L30 50 L60 50" stroke="#22d3ee" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M670 20 L670 50 L640 50" stroke="#22d3ee" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
);

interface StatCardProps {
  label: string;
  value: string;
  accent?: boolean;
}
const StatCard = ({ label, value, accent }: StatCardProps) => (
    <Box
        className={classes.statCard}
        style={{
          border: `0.5px solid ${accent ? "rgba(34,211,238,.2)" : "rgba(255,255,255,.07)"}`,
        }}
    >
      <Text
          style={{
            fontFamily: "'Oxanium', sans-serif",
            fontWeight: 800,
            fontSize: 20,
            color: accent ? "#22d3ee" : "#f1f5f9",
            lineHeight: 1,
            marginBottom: 5,
          }}
      >
        {value}
      </Text>
      <Text
          style={{
            fontFamily: "'Oxanium', sans-serif",
            fontSize: 9,
            letterSpacing: 1.5,
            textTransform: "uppercase" as const,
            color: "rgba(100,116,139,.65)",
          }}
      >
        {label}
      </Text>
    </Box>
);

// ── Section divider ───────────────────────────────────────────────────────────
const SectionLabel = ({ children }: { children: ReactNode }) => (
    <Text
        style={{
          fontFamily: "'Oxanium', sans-serif",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase" as const,
          color: "rgba(100,116,139,.5)",
          marginBottom: 10,
        }}
    >
      {children}
    </Text>
);

// ── Main component ────────────────────────────────────────────────────────────

interface PlayerProfileProps {
    profile: DotaProfileResponse;
    isOwner?: boolean;
    onDeleted?: () => void;
}

export function DotaProfile({ profile: initialProfile, isOwner = false, onDeleted }: Readonly<PlayerProfileProps>) {
    const [profile, setProfile] = useState<DotaProfileResponse>(initialProfile);
    const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

    const [deleteModalOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        setProfile(initialProfile);
    }, [initialProfile]);

    const handleRefreshStats = async () => {
        setIsRefreshing(true); // Включаем загрузку
        try {
            const response = await apiClient.post<DotaProfileResponse>("/api/profiles/dota/me/refresh-stats");
            setProfile(response.data);
        } catch (error) {
            console.error("Failed to refresh stats:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleDeleteProfile = async () => {
        setIsDeleting(true);
        try {
            await apiClient.delete("/api/profiles/dota/me");
            closeDelete();
            if (onDeleted) {
                onDeleted();
            }
        } catch (error) {
            console.error("Failed to delete profile:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const {
        avatarUrl,
        nickname,
        lookingForTeam,
        rankTier,
        estimatedMmr,
        positions,
        winRate,
        totalMatches,
        aboutMe,
        steamId
    } = profile;

    const { rankKey, rankLabel, stars } = parseRankTier(rankTier);

    const rankColor = RANK_COLORS[rankKey];
    const starsLabel = stars > 0 ? ROMAN[Math.min(stars - 1, 4)] : "";
    const estimatedMmrLabel = estimatedMmr?.toLocaleString() ?? "—";
    const winRateLabel = winRate == null ? "—" : `${Math.round(winRate)}%`;
    const matchesLabel = totalMatches?.toLocaleString() ?? "—";

    const initials = nickname
      ? nickname.slice(0, 2).toUpperCase()
      : "??";

    const fullRankDisplay = starsLabel ? `${rankLabel} ${starsLabel}` : rankLabel;

    return (
        <>
            {isOwner && (
                <EditProfileModal
                    opened={editOpened}
                    onClose={closeEdit}
                    profile={profile}
                    onSaved={(updated) => setProfile(updated)}
                />
            )}

            <Modal
                opened={deleteModalOpened}
                onClose={closeDelete}
                title="Delete Dota 2 Profile"
                centered
                overlayProps={{ blur: 3, opacity: 0.5 }}
                styles={{
                    content: { background: '#04090f', border: '1px solid rgba(239,68,68,.3)' },
                    header: { background: 'transparent' },
                    title: { fontFamily: "'Oxanium', sans-serif", color: '#f87171', fontWeight: 700 }
                }}
            >
                <Stack gap="md">
                    <Text style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(148,163,184,.9)" }}>
                        Are you sure you want to delete your Dota 2 profile? This will remove your stats, preferred roles, and you will no longer appear in the player search.
                    </Text>
                    <Text style={{ fontFamily: "'DM Sans', sans-serif", color: "#f87171", fontSize: 14, fontWeight: 600 }}>
                        This action cannot be undone.
                    </Text>
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={closeDelete} disabled={isDeleting} style={{ border: 'none', background: 'rgba(255,255,255,.05)' }}>
                            Cancel
                        </Button>
                        <Button color="red" onClick={handleDeleteProfile} loading={isDeleting} style={{ fontFamily: "'Oxanium', sans-serif" }}>
                            Yes, delete profile
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            <Box className={classes.profileWrap}>

                {/* ── Banner ── */}
                <Box
                    className={classes.banner}
                    style={{
                        height: 160,
                        position: "relative",
                        overflow: "hidden",
                        background: "linear-gradient(135deg, #050e18 0%, #071520 60%, #050d18 100%)",
                        borderRadius: "12px 12px 0 0",
                        border: "0.5px solid rgba(34,211,238,.12)",
                        borderBottom: "none",
                    }}
                >
                    <BannerGeo />

                    {/* Radial glow */}
                    <Box
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "radial-gradient(ellipse 70% 80% at 50% -20%, rgba(34,211,238,.1) 0%, transparent 70%)",
                            pointerEvents: "none",
                        }}
                    />

                    {/* Rank watermark */}
                    <Text
                        style={{
                            position: "absolute",
                            bottom: 12,
                            right: 20,
                            fontFamily: "'Oxanium', sans-serif",
                            fontSize: 48,
                            fontWeight: 800,
                            letterSpacing: -1,
                            color: rankColor,
                            opacity: 0.12,
                            userSelect: "none",
                            lineHeight: 1,
                        }}
                    >
                        {rankLabel.toUpperCase()}
                    </Text>
                </Box>

                {/* ── Card body ── */}
                <Box
                    style={{
                        background: "linear-gradient(145deg, var(--mantine-color-dark-7) 0%, var(--mantine-color-dark-8) 100%)",
                        border: "0.5px solid rgba(34,211,238,.1)",
                        borderTop: "none",
                        borderRadius: "0 0 12px 12px",
                        padding: "0 28px 28px",
                    }}
                >
                    {/* ── Avatar row ── */}
                    <Box style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: -36, marginBottom: 20 }}>
                        <Box style={{ position: "relative" }}>
                            <Avatar
                                src={avatarUrl || null}
                                size={80}
                                radius={999}
                                style={{
                                    border: "3px solid var(--mantine-color-dark-8)",
                                    background: "linear-gradient(135deg, #0891b2, #22d3ee)",
                                }}
                            >
                                <Text style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 800, fontSize: 22, color: "#001a1f" }}>
                                    {initials}
                                </Text>
                            </Avatar>

                            {/* Online dot */}
                            <Box
                                style={{
                                    position: "absolute",
                                    bottom: 4,
                                    right: 4,
                                    width: 12,
                                    height: 12,
                                    borderRadius: "50%",
                                    background: "#22c55e",
                                    border: "2px solid var(--mantine-color-dark-8)",
                                }}
                            />
                        </Box>

                        {lookingForTeam && (
                            <Badge
                                style={{
                                    background: "rgba(34,197,94,.12)",
                                    border: "0.5px solid rgba(34,197,94,.35)",
                                    color: "#4ade80",
                                    fontFamily: "'Oxanium', sans-serif",
                                    fontSize: 10,
                                    fontWeight: 700,
                                    letterSpacing: 1.5,
                                    padding: "5px 12px",
                                    borderRadius: 99,
                                    marginBottom: 8,
                                }}
                            >
                                LFG
                            </Badge>
                        )}

                        {isOwner && (
                            <Group gap={8}>
                                <Button
                                    onClick={handleRefreshStats}
                                    loading={isRefreshing}
                                    disabled={!steamId}
                                    title={steamId ? "Update statistics" : "Link your Steam account to refresh stats"}
                                    variant="default"
                                    size="xs"
                                    style={{
                                        background: steamId ? "rgba(34,211,238,.05)" : "rgba(255,255,255,.02)",
                                        border: steamId ? "0.5px solid rgba(34,211,238,.35)" : "0.5px solid rgba(255,255,255,.1)",
                                        color: steamId ? "#22d3ee" : "rgba(255,255,255,.3)",
                                        borderRadius: 7,
                                        fontFamily: "'Oxanium', sans-serif",
                                        fontSize: 10,
                                        fontWeight: 700,
                                        letterSpacing: 1.2,
                                        height: 30,
                                        padding: "0 14px",
                                    }}
                                >
                                    Refresh stats
                                </Button>
                                <Button
                                    onClick={openEdit}
                                    variant="default"
                                    size="xs"
                                    style={{
                                        background: "rgba(255,255,255,.05)",
                                        border: "0.5px solid rgba(34,211,238,.25)",
                                        borderRadius: 7,
                                        fontFamily: "'Oxanium', sans-serif",
                                        fontSize: 10,
                                        fontWeight: 700,
                                        letterSpacing: 1.2,
                                        color: "rgba(34,211,238,.8)",
                                        height: 30,
                                        padding: "0 14px",
                                    }}
                                >
                                    Edit profile
                                </Button>

                                <Button
                                    onClick={openDelete}
                                    variant="default"
                                    size="xs"
                                    style={{
                                        background: "rgba(239,68,68,.05)",
                                        border: "0.5px solid rgba(239,68,68,.25)",
                                        borderRadius: 7,
                                        fontFamily: "'Oxanium', sans-serif",
                                        fontSize: 10,
                                        fontWeight: 700,
                                        letterSpacing: 1.2,
                                        color: "rgba(239,68,68,.8)",
                                        height: 30,
                                        padding: "0 14px",
                                    }}
                                >
                                    Delete
                                </Button>
                            </Group>
                        )}
                    </Box>

                    {/* ── Name block ── */}
                    <Box style={{ marginBottom: 20 }}>
                        <Text
                            style={{
                                fontFamily: "'Oxanium', sans-serif",
                                fontWeight: 800,
                                fontSize: 26,
                                color: "#f1f5f9",
                                letterSpacing: -0.5,
                                lineHeight: 1.1,
                            }}
                        >
                            {nickname}
                        </Text>
                        <Group gap={8} mt={6}>
                            <Text
                                style={{
                                    fontFamily: "'Oxanium', sans-serif",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: rankColor,
                                    letterSpacing: 0.5,
                                }}
                            >
                                {rankLabel} {starsLabel}
                            </Text>
                            {estimatedMmr !== undefined && (
                                <>
                                    <Box style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(100,116,139,.5)" }} />
                                    <Text style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 13, color: "rgba(148,163,184,.7)" }}>
                                        {estimatedMmrLabel} MMR
                                    </Text>
                                </>
                            )}
                        </Group>
                    </Box>

                    {/* ── Stats grid ── */}
                    <Box style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 8, marginBottom: 24 }}>
                        <StatCard label="MMR"      value={estimatedMmrLabel}     accent />
                        <StatCard label="Win rate" value={winRateLabel} />
                        <StatCard label="Matches"  value={matchesLabel} />
                        <StatCard label="Rank"     value={fullRankDisplay} />
                    </Box>

                    {/* ── Roles ── */}
                    {positions && positions.length > 0 && (
                        <Box style={{ marginBottom: 24 }}>
                            <SectionLabel>Preferred roles</SectionLabel>
                            <Group gap={6}>
                                {positions.map((pos) => (
                                    <span key={pos} className={classes.roleTag}>
                      {pos.replace("_", " ")}
                    </span>
                                ))}
                            </Group>
                        </Box>
                    )}

                    {/* ── Divider ── */}
                    <Box style={{ height: "0.5px", background: "rgba(34,211,238,.1)", marginBottom: 24 }} />

                    {/* ── About ── */}
                    {aboutMe && (
                        <Box>
                            <SectionLabel>About</SectionLabel>
                            <Text
                                style={{
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontSize: 14,
                                    color: "rgba(148,163,184,.85)",
                                    lineHeight: 1.65,
                                }}
                            >
                                {aboutMe}
                            </Text>
                        </Box>
                    )}
                </Box>
            </Box>
        </>
    );
}
