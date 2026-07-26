import React, { useMemo, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    Linking,
    Share,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { usePersonalNotes } from '../../hooks/usePersonalNotes';
import { useSaved } from '../../hooks/useSaved';
import { useDownloads } from '../../hooks/useDownloads';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { normalizePdfUrl } from '../../utils/localFile';
import { apiFetch } from '../../hooks/useApi';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import GradientBackground from '../../components/GradientBackground';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { Note } from '../../types/note';

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function NoteViewer() {
    const { id, title, pdfUrl: paramPdfUrl, isPremium: paramIsPremium } = useLocalSearchParams<{
        id: string;
        title: string;
        pdfUrl?: string;
        isPremium?: string;
    }>();

    const router = useRouter();
    const { showToast } = useToast();
    const { user } = useAuth();
    const { getNote } = usePersonalNotes();
    const { savedNotes, saveNote, unsaveNote } = useSaved();
    const { downloads, addDownload } = useDownloads();

    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [ratingValue, setRatingValue] = useState(0);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [relatedNotes, setRelatedNotes] = useState<Note[]>([]);
    const [liked, setLiked] = useState(false);
    const [showLikePrompt, setShowLikePrompt] = useState(false);

    useEffect(() => {
        let cancelled = false;
        async function loadNote() {
            setLoading(true);
            try {
                const res = await apiFetch<Note>(`/note/${id}`, { requiresAuth: false });
                if (cancelled) return;
                if (res.success && res.data) {
                    setNote(res.data);
                    if (user?.id && res.data.likedBy?.includes(user.id)) {
                        setLiked(true);
                    }
                    const relRes = await apiFetch<Note[]>(`/notes/${id}/related`, { requiresAuth: false });
                    if (!cancelled && relRes.success && relRes.data) setRelatedNotes(relRes.data);
                }
            } catch (e) {
                if (!cancelled) console.error('Load note error:', e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        loadNote();
        return () => { cancelled = true; };
    }, [id]);

    const now = new Date();
    const userIsPremium = user?.isPremium && user?.premiumEndDate ? new Date(user.premiumEndDate) > now : false;
    const noteIsPremium = paramIsPremium === 'true' || note?.isPremium === true;

    const storedNote = getNote(id);
    const savedNote = savedNotes.find((n) => n.id === id);

    const resolvedTitle = title || note?.title || storedNote?.title || savedNote?.title || 'Note';
    const resolvedPdfUrl = useMemo(() => {
        const fromStore = note?.pdfUrl || storedNote?.pdfUrl || savedNote?.pdfUrl;
        return normalizePdfUrl(fromStore || paramPdfUrl || '');
    }, [note?.pdfUrl, storedNote?.pdfUrl, savedNote?.pdfUrl, paramPdfUrl]);

    const isSaved = savedNotes.some((n) => n.id === id);

    const handleSave = async () => {
        if (isSaved) {
            const ok = await unsaveNote(id);
            showToast(ok ? 'Bookmark removed.' : 'Failed to remove bookmark.', ok ? 'info' : 'error');
        } else {
            const ok = await saveNote(id);
            showToast(ok ? 'Note saved to bookmarks!' : 'Failed to save.', ok ? 'success' : 'error');
        }
    };

    const isAlreadyDownloaded = downloads.some((d) => d.id === id);

    const handleDownload = async () => {
        if (noteIsPremium && !userIsPremium) {
            Alert.alert('Premium Note', 'Downloading premium notes requires a Premium subscription.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Go Premium', onPress: () => router.push('/(drawer)/subscription') },
            ]);
            return;
        }
        if (!user) {
            showToast('Sign in to download notes.', 'error');
            return;
        }
        if (isAlreadyDownloaded) {
            if (resolvedPdfUrl) {
                await Linking.openURL(resolvedPdfUrl).catch(() => showToast('Could not open file.', 'error'));
            }
            return;
        }
        const ok = await addDownload(id);
        if (ok) {
            if (resolvedPdfUrl) {
                await Linking.openURL(resolvedPdfUrl).catch(() => showToast('Could not open download link.', 'error'));
            }
            showToast('Download started!', 'success');
        } else {
            showToast('Could not record download.', 'error');
        }
    };

    const handleShare = async () => {
        try {
            const shareMessage = resolvedPdfUrl
                ? `Check out this note: ${resolvedTitle}\n\n${resolvedPdfUrl}\n\nShared via GetNotes`
                : `Check out this note: ${resolvedTitle}\n\nShared via GetNotes`;
            await Share.share({ message: shareMessage });
        } catch {}
    };

    const handleRate = async () => {
        if (ratingValue === 0) {
            showToast('Please select a rating.', 'error');
            return;
        }
        try {
            const res = await apiFetch(`/notes/${id}/rate`, {
                method: 'POST',
                body: JSON.stringify({ rating: ratingValue }),
            });
            if (res.success) {
                showToast('Rating submitted!', 'success');
                setShowRatingModal(false);
                setRatingValue(0);
                if (res.data) {
                    const { averageRating, ratingCount } = res.data as { averageRating: number; ratingCount: number };
                    setNote((prev) => prev ? { ...prev, averageRating, ratingCount } : prev);
                }
            } else {
                showToast(res.message || 'Failed to submit rating.', 'error');
            }
        } catch {
            showToast('Failed to submit rating.', 'error');
        }
    };

    const handleLike = () => {
        if (!user) {
            showToast('Sign in to like notes.', 'error');
            return;
        }
        setShowLikePrompt(true);
    };

    const handleConfirmLike = async () => {
        setShowLikePrompt(false);
        try {
            const res = await apiFetch(`/notes/${id}/like`, { method: 'POST' });
            if (res.success) {
                if (typeof (res as any).liked === 'boolean') {
                    setLiked((res as any).liked);
                    setNote((prev) => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            likes: (res as any).data?.likes ?? prev.likes,
                            likedBy: (res as any).data?.likedBy ?? prev.likedBy,
                        };
                    });
                    showToast((res as any).liked ? 'You liked this note!' : 'Like removed.', 'success');
                } else {
                    setLiked(true);
                    setNote((prev) => prev ? { ...prev, likes: (prev.likes || 0) + 1 } : prev);
                    showToast('You liked this note!', 'success');
                }
            }
        } catch {
            showToast('Failed to update like.', 'error');
        }
    };

    const handleReport = async () => {
        if (!reportReason) {
            showToast('Please select a reason.', 'error');
            return;
        }
        try {
            await apiFetch(`/notes/${id}/report`, {
                method: 'POST',
                body: JSON.stringify({ reason: reportReason, description: '' }),
            });
            showToast('Report submitted. Thank you!', 'success');
            setShowReportModal(false);
            setReportReason('');
        } catch {
            showToast('Failed to submit report.', 'error');
        }
    };

    if (loading) {
        return (
            <GradientBackground>
                <View style={styles.container}>
                    <LoadingSkeleton.ProfileHeader />
                </View>
            </GradientBackground>
        );
    }

    const pdfFileName = resolvedPdfUrl
        ? resolvedPdfUrl.split('/').pop()?.split('?')[0] || 'document.pdf'
        : null;

    return (
        <GradientBackground>
            <Stack.Screen
                options={{
                    headerTitle: resolvedTitle,
                    headerRight: () => (
                        <View style={styles.headerActions}>
                            <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
                                <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={22} color={colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
                                <Ionicons name="share-outline" size={22} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    ),
                }}
            />

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {noteIsPremium && !userIsPremium ? (
                    <View style={styles.premiumLock}>
                        <Ionicons name="lock-closed" size={56} color={colors.primary} />
                        <Text style={styles.premiumLockTitle}>Premium Note</Text>
                        <Text style={styles.premiumLockSub}>Upgrade to Premium to access this note and many more.</Text>
                        <TouchableOpacity style={styles.premiumLockBtn} onPress={() => router.push('/(drawer)/subscription')} activeOpacity={0.8}>
                            <Ionicons name="diamond" size={18} color="#FFFFFF" />
                            <Text style={styles.premiumLockBtnText}>Go Premium</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.content}>
                        <View style={styles.detailsCard}>
                            <Text style={styles.detailTitle}>{resolvedTitle}</Text>
                            {note?.isVerified && (
                                <View style={styles.verifiedRow}>
                                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                                    <Text style={styles.verifiedText}>Verified Note</Text>
                                </View>
                            )}
                            {note?.description ? (
                                <Text style={styles.descText}>{note.description}</Text>
                            ) : null}
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Contributed by</Text>
                            <Animated.View entering={FadeInRight.duration(400).springify()}>
                                <TouchableOpacity
                                    style={styles.contributorCard}
                                    onPress={() => {
                                        const uploaderId = note?.uploaderId || note?.uploadedBy?.id;
                                        if (uploaderId) router.push(`/contributor/${uploaderId}`);
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.contributorHeader}>
                                        <View style={styles.contributorAvatar}>
                                            <Text style={styles.contributorAvatarText}>
                                                {(note?.uploaderName || note?.uploadedBy?.name || 'A').charAt(0).toUpperCase()}
                                            </Text>
                                        </View>
                                        <View style={styles.contributorInfo}>
                                            <Text style={styles.contributorName}>{note?.uploaderName || note?.uploadedBy?.name || 'Anonymous'}</Text>
                                            {note?.uploaderCollege ? (
                                                <Text style={styles.contributorCollege}>{note.uploaderCollege}</Text>
                                            ) : null}
                                        </View>
                                        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                                    </View>

                                    {(note?.uploaderBadge || note?.uploadedBy?.badge) && (
                                        <View style={styles.contributorBadge}>
                                            <Ionicons name="ribbon" size={14} color="#F59E0B" />
                                            <Text style={styles.contributorBadgeText}>{note.uploaderBadge || note.uploadedBy?.badge}</Text>
                                            {note?.uploaderReputation ? (
                                                <Text style={styles.contributorRepText}>{note.uploaderReputation} pts</Text>
                                            ) : null}
                                        </View>
                                    )}

                                    <View style={styles.contributorMeta}>
                                        {note?.uploaderCourse || note?.course ? (
                                            <View style={styles.contributorMetaItem}>
                                                <Ionicons name="school-outline" size={13} color={colors.textSecondary} />
                                                <Text style={styles.contributorMetaText}>{note.uploaderCourse || note.course}</Text>
                                            </View>
                                        ) : null}
                                        {note?.uploaderBranch || (note?.uploadedBy as any)?.branch ? (
                                            <View style={styles.contributorMetaItem}>
                                                <Ionicons name="git-branch-outline" size={13} color={colors.textSecondary} />
                                                <Text style={styles.contributorMetaText}>{note?.uploaderBranch || (note?.uploadedBy as any)?.branch}</Text>
                                            </View>
                                        ) : null}
                                        {(note?.uploaderSemester || note?.semester) ? (
                                            <View style={styles.contributorMetaItem}>
                                                <Ionicons name="layers-outline" size={13} color={colors.textSecondary} />
                                                <Text style={styles.contributorMetaText}>Sem {note.uploaderSemester || note.semester}</Text>
                                            </View>
                                        ) : null}
                                        {(note?.uploadedAt || note?.createdAt) ? (
                                            <View style={styles.contributorMetaItem}>
                                                <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
                                                <Text style={styles.contributorMetaText}>{new Date(note.uploadedAt || note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                                            </View>
                                        ) : null}
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        </View>

                        {pdfFileName && (
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>PDF</Text>
                                <View style={styles.pdfCard}>
                                    <View style={styles.pdfIcon}>
                                        <Ionicons name="document-text" size={22} color={colors.primary} />
                                    </View>
                                    <View style={styles.pdfInfo}>
                                        <Text style={styles.pdfName} numberOfLines={1}>{pdfFileName}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.pdfOpenBtn}
                                        onPress={() => {
                                            if (!resolvedPdfUrl) {
                                                showToast('No PDF available.', 'error');
                                                return;
                                            }
                                            router.push({
                                                pathname: '/pdf-viewer',
                                                params: { pdfUrl: resolvedPdfUrl, title: resolvedTitle, noteId: id },
                                            });
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.pdfOpenText}>Open PDF</Text>
                                        <Ionicons name="open-outline" size={14} color={colors.primary} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        <View style={styles.section}>
                            <View style={styles.actionGrid}>
                                <TouchableOpacity
                                    style={[styles.actionCard, liked && styles.actionCardActive]}
                                    onPress={handleLike}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name={liked ? 'heart' : 'heart-outline'} size={22} color={liked ? '#EF4444' : colors.textSecondary} />
                                    <Text style={[styles.actionCardLabel, liked && { color: '#EF4444' }]}>{note?.likes || 0}</Text>
                                    <Text style={styles.actionCardTitle}>Like</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.actionCard}
                                    onPress={() => { if (!user) { showToast('Sign in to rate notes.', 'error'); return; } setShowRatingModal(true); }}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="star-outline" size={22} color="#F59E0B" />
                                    <Text style={styles.actionCardLabel}>{(note?.averageRating || 0).toFixed(1)}</Text>
                                    <Text style={styles.actionCardTitle}>Rate</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionCard, isSaved && styles.actionCardActive]}
                                    onPress={handleSave}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={22} color={isSaved ? colors.primary : colors.textSecondary} />
                                    <Text style={[styles.actionCardLabel, isSaved && { color: colors.primary }]}>{note?.saves || 0}</Text>
                                    <Text style={styles.actionCardTitle}>Save</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.actionCard} onPress={handleDownload} activeOpacity={0.7}>
                                    <Ionicons name={isAlreadyDownloaded ? 'checkmark-circle' : 'download-outline'} size={22} color={isAlreadyDownloaded ? colors.secondary : colors.textSecondary} />
                                    <Text style={[styles.actionCardLabel, isAlreadyDownloaded && { color: colors.secondary }]}>{note?.downloads || 0}</Text>
                                    <Text style={styles.actionCardTitle}>{isAlreadyDownloaded ? 'Open' : 'Download'}</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                style={styles.reportLink}
                                onPress={() => { if (!user) { showToast('Sign in to report notes.', 'error'); return; } setShowReportModal(true); }}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="flag-outline" size={14} color={colors.textLight} />
                                <Text style={styles.reportLinkText}>Report this note</Text>
                            </TouchableOpacity>
                        </View>

                        {note?.tags && note.tags.length > 0 ? (
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>Tags</Text>
                                <View style={styles.tagsRow}>
                                    {note.tags.map((tag, i) => (
                                        <View key={i} style={styles.tag}>
                                            <Text style={styles.tagText}>{tag}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ) : null}

                        {relatedNotes.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>Related Notes</Text>
                                {relatedNotes.map((rn) => (
                                    <TouchableOpacity
                                        key={rn.id}
                                        style={styles.relatedCard}
                                        onPress={() => router.push(`/note/${rn.id}`)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.relatedIcon}>
                                            <Ionicons name="document-text" size={18} color={colors.primary} />
                                        </View>
                                        <View style={styles.relatedInfo}>
                                            <Text style={styles.relatedName} numberOfLines={1}>{rn.title}</Text>
                                            <Text style={styles.relatedMeta}>{rn.subject} · {rn.downloads || 0} downloads</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            {showRatingModal && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>Rate this Note</Text>
                        <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity key={star} onPress={() => setRatingValue(star)}>
                                    <Ionicons
                                        name={star <= ratingValue ? 'star' : 'star-outline'}
                                        size={36}
                                        color={star <= ratingValue ? '#F59E0B' : colors.textLight}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowRatingModal(false)}>
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalSubmit} onPress={handleRate}>
                                <Text style={styles.modalSubmitText}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {showLikePrompt && (
                <View style={styles.modalOverlay}>
                    <View style={styles.likeModal}>
                        <View style={styles.likeModalIcon}>
                            <Ionicons name={liked ? 'heart-dislike' : 'heart'} size={36} color="#EF4444" />
                        </View>
                        <Text style={styles.likeModalTitle}>{liked ? 'Unlike this note?' : 'Like this note?'}</Text>
                        <Text style={styles.likeModalSub}>{liked ? 'Remove your like from this note.' : 'Show the uploader some love for sharing helpful notes.'}</Text>
                        <View style={styles.likeModalActions}>
                            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowLikePrompt(false)}>
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.likeModalConfirm} onPress={handleConfirmLike}>
                                <Ionicons name={liked ? 'heart-dislike' : 'heart'} size={18} color="#FFFFFF" />
                                <Text style={styles.likeModalConfirmText}>{liked ? 'Unlike' : 'Like'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {showReportModal && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>Report Note</Text>
                        {['copyright', 'inappropriate', 'spam', 'wrong_subject', 'duplicate', 'other'].map((reason) => (
                            <TouchableOpacity
                                key={reason}
                                style={[styles.reportOption, reportReason === reason && styles.reportOptionActive]}
                                onPress={() => setReportReason(reason)}
                            >
                                <Text style={[styles.reportOptionText, reportReason === reason && styles.reportOptionTextActive]}>
                                    {reason.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowReportModal(false)}>
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalSubmit, { backgroundColor: '#EF4444' }]} onPress={handleReport}>
                                <Text style={styles.modalSubmitText}>Report</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: spacing.screenPadding },
    headerActions: { flexDirection: 'row', alignItems: 'center', marginRight: spacing.sm },
    headerButton: { padding: spacing.sm, marginLeft: spacing.xs },
    detailsCard: { marginBottom: spacing.lg },
    detailTitle: { fontSize: typography.fontSize.xxl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginBottom: spacing.sm, letterSpacing: -0.3 },
    verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
    verifiedText: { fontSize: typography.fontSize.sm, color: colors.success, fontWeight: typography.fontWeight.semibold },
    descText: { fontSize: typography.fontSize.md, color: colors.textSecondary, lineHeight: 22 },
    section: { marginBottom: spacing.lg },
    sectionLabel: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.textSecondary, marginBottom: spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 },
    contributorCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    contributorHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
    contributorAvatar: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: 'rgba(91, 127, 255, 0.12)',
        borderWidth: 2, borderColor: 'rgba(91,127,255,0.20)',
        justifyContent: 'center', alignItems: 'center',
    },
    contributorAvatarText: { fontSize: 18, fontWeight: typography.fontWeight.bold, color: colors.primary },
    contributorInfo: { flex: 1 },
    contributorName: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
    contributorCollege: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: 2 },
    contributorBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(245,158,11,0.08)',
        borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5,
        marginBottom: spacing.sm,
    },
    contributorBadgeText: { fontSize: typography.fontSize.xs, color: '#F59E0B', fontWeight: typography.fontWeight.semibold },
    contributorRepText: { fontSize: typography.fontSize.xs, color: colors.textSecondary, marginLeft: 4 },
    contributorMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    contributorMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    contributorMetaText: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
    pdfCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBackground,
        borderRadius: 16, padding: spacing.cardPadding, borderWidth: 1, borderColor: colors.border, gap: spacing.md,
    },
    pdfIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(91, 127, 255, 0.10)', justifyContent: 'center', alignItems: 'center' },
    pdfInfo: { flex: 1 },
    pdfName: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary },
    pdfOpenBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: 'rgba(91, 127, 255, 0.08)' },
    pdfOpenText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.primary },
    actionGrid: { flexDirection: 'row', gap: spacing.sm },
    actionCard: {
        flex: 1, alignItems: 'center', backgroundColor: colors.cardBackground,
        borderRadius: 16, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border, gap: 4,
    },
    actionCardActive: { borderColor: colors.primary, backgroundColor: 'rgba(91, 127, 255, 0.05)' },
    actionCardLabel: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
    actionCardTitle: { fontSize: typography.fontSize.xs, color: colors.textSecondary },
    reportLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: spacing.md, paddingVertical: spacing.sm },
    reportLinkText: { fontSize: typography.fontSize.xs, color: colors.textLight },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    tag: { backgroundColor: 'rgba(91, 127, 255, 0.08)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
    tagText: { fontSize: typography.fontSize.xs, color: colors.primary, fontWeight: typography.fontWeight.medium },
    relatedCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBackground,
        borderRadius: 16, padding: spacing.cardPadding, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, gap: spacing.md,
    },
    relatedIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(91, 127, 255, 0.10)', justifyContent: 'center', alignItems: 'center' },
    relatedInfo: { flex: 1 },
    relatedName: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary },
    relatedMeta: { fontSize: typography.fontSize.xs, color: colors.textSecondary, marginTop: 2 },
    premiumLock: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xxl, gap: spacing.md, paddingVertical: 80 },
    premiumLockTitle: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', textAlign: 'center' },
    premiumLockSub: { fontSize: 14, color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', lineHeight: 20 },
    premiumLockBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, marginTop: spacing.md },
    premiumLockBtnText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
    modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    likeModal: { backgroundColor: colors.cardBackground, borderRadius: 24, padding: spacing.xl, width: '85%', maxWidth: 360, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    likeModalIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(239, 68, 68, 0.10)', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
    likeModalTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, textAlign: 'center' },
    likeModalSub: { fontSize: typography.fontSize.sm, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20, marginBottom: spacing.lg, paddingHorizontal: spacing.md },
    likeModalActions: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'center', width: '100%' },
    likeModalConfirm: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12, backgroundColor: '#EF4444' },
    likeModalConfirmText: { color: '#FFFFFF', fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.md },
    modal: { backgroundColor: colors.cardBackground, borderRadius: 24, padding: spacing.xl, width: '85%', maxWidth: 400, borderWidth: 1, borderColor: colors.border },
    modalTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginBottom: spacing.lg, textAlign: 'center' },
    starsRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.lg },
    modalActions: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'center' },
    modalCancel: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
    modalCancelText: { color: colors.textSecondary, fontWeight: typography.fontWeight.semibold },
    modalSubmit: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.primary },
    modalSubmitText: { color: colors.textOnPrimary, fontWeight: typography.fontWeight.semibold },
    reportOption: { padding: spacing.md, borderRadius: 12, backgroundColor: colors.cardBackground, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
    reportOptionActive: { borderColor: colors.primary, backgroundColor: 'rgba(91, 127, 255, 0.08)' },
    reportOptionText: { fontSize: typography.fontSize.sm, color: colors.textPrimary },
    reportOptionTextActive: { color: colors.primary, fontWeight: typography.fontWeight.semibold },
});
