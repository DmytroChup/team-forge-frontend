import { useEffect, useState } from "react";
import { Modal, Textarea, Switch, Button, Group, Box, Text, Stack } from "@mantine/core";
import type { DotaProfileResponse, Position } from "../api/models";
import { POSITIONS } from "../api/models";
import apiClient from "../api/api";
import classes from "./EditProfileModal.module.css";

// ── Types ─────────────────────────────────────────────────────────────────────

interface EditProfileModalProps {
    opened: boolean;
    onClose: () => void;
    profile: DotaProfileResponse;
    /** Called with the updated profile after a successful save */
    onSaved: (updated: DotaProfileResponse) => void;
    isCreating?: boolean;
}

// Human-readable position labels
const POSITION_LABELS: Record<Position, string> = {
    CARRY:        "Carry",
    MID:          "Mid",
    OFFLANE:      "Offlane",
    SOFT_SUPPORT: "Soft Support",
    HARD_SUPPORT: "Hard Support",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function EditProfileModal({ opened, onClose, profile, onSaved, isCreating = false }: Readonly<EditProfileModalProps>) {

    // Local form state – pre-filled from current profile
    const [positions,      setPositions]      = useState<Position[]>(profile.positions ?? []);
    const [lookingForTeam, setLookingForTeam] = useState(profile.lookingForTeam ?? false);
    const [aboutMe,        setAboutMe]        = useState(profile.aboutMe ?? "");
    const [loading,        setLoading]        = useState(false);
    const [error,          setError]          = useState<string | null>(null);

    // Sync state if profile changes while modal is closed
    useEffect(() => {
        if (opened) {
            setPositions(profile.positions ?? []);
            setLookingForTeam(profile.lookingForTeam ?? false);
            setAboutMe(profile.aboutMe ?? "");
            setError(null);
        }
    }, [opened, profile]);

    // ── Position chip toggle ───────────────────────────────────────────────────
    const togglePosition = (pos: Position) => {
        setPositions((prev) =>
            prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
        );
    };

    // ── Submit ─────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        setLoading(true);
        setError(null);

        try {
            // 1. Update DotaProfile fields (positions, lookingForTeam, aboutMe)
            const dotaResponse = await apiClient.put<DotaProfileResponse>(
                "/api/profiles/dota/me",
                { positions, lookingForTeam, aboutMe }
            );


            onSaved(dotaResponse.data);
            onClose();

        } catch (err) {
            setError("Failed to save changes. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ── Reset form to current profile when modal reopens ──────────────────────
    const handleClose = () => {
        setPositions(profile.positions ?? []);
        setLookingForTeam(profile.lookingForTeam ?? false);
        setAboutMe(profile.aboutMe ?? "");
        setError(null);
        onClose();
    };

    let submitButtonText = "Save changes";
    if (loading) {
        submitButtonText = "Saving…";
    } else if (isCreating) {
        submitButtonText = "Create Profile";
    }

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title={isCreating ? "Create Dota 2 Profile" : "Edit Dota 2 Profile"}
            centered
            size="md"
            classNames={{
                content: classes.modalContent,
                header:  classes.modalHeader,
                title:   classes.modalTitle,
                body:    classes.modalBody,
            }}
        >
            <Stack gap={20}>

                {/* ── Positions ── */}
                <Box>
                    <Text className={classes.fieldLabel}>Preferred roles</Text>
                    <div className={classes.positionGrid}>
                        {POSITIONS.map((pos) => (
                            <button
                                key={pos}
                                type="button"
                                onClick={() => togglePosition(pos)}
                                className={`${classes.posChip} ${positions.includes(pos) ? classes.posChipActive : ""}`}
                            >
                                {POSITION_LABELS[pos]}
                            </button>
                        ))}
                    </div>
                </Box>

                {/* ── LFG toggle ── */}
                <Box className={classes.lfgRow}>
                    <Box>
                        <Text className={classes.lfgLabel}>Looking for team</Text>
                        <Text className={classes.lfgSub}>Visible to other players searching for teammates</Text>
                    </Box>
                    <Switch
                        checked={lookingForTeam}
                        onChange={(e) => setLookingForTeam(e.currentTarget.checked)}
                        color="cyan"
                        classNames={{ root: classes.lfgSwitch }}
                    />
                </Box>

                {/* ── About me ── */}
                <Textarea
                    label="About me"
                    placeholder="Tell others about your playstyle, goals, schedule…"
                    value={aboutMe}
                    onChange={(e) => setAboutMe(e.currentTarget.value)}
                    minRows={3}
                    maxRows={6}
                    autosize
                    maxLength={1000}
                    classNames={{ root: classes.input }}
                />

                {/* ── Error message ── */}
                {error && (
                    <Text
                        style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 13,
                            color: "#f87171",
                            background: "rgba(239,68,68,.07)",
                            border: "0.5px solid rgba(239,68,68,.2)",
                            borderRadius: 7,
                            padding: "10px 14px",
                        }}
                    >
                        {error}
                    </Text>
                )}

                <div className={classes.divider} />

                {/* ── Actions ── */}
                <Group justify="flex-end" gap={10}>
                    <Button
                        variant="default"
                        onClick={handleClose}
                        disabled={loading}
                        classNames={{ root: classes.btnCancel }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        loading={loading}
                        classNames={{ root: classes.btnSave }}
                    >
                        {submitButtonText}
                    </Button>
                </Group>

            </Stack>
        </Modal>
    );
}