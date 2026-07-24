import React, { useMemo, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator,
    TextInput,
    Share,
    Linking,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
    const { addDownload } = useDownloads();

    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [ratingValue, setRatingValue] = useState(0);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [relatedNotes, setRelatedNotes] = useState<Note[]>([]);

    useEffect(() => {
        let cancelled = false;
        async function loadNote() {
            setLoading(true);
            try {
                const res = await apiFetch<Note>(`/note/${id}`, { requiresAuth: false });
                if (cancelled) return;
                if (res.success && res.data) {
                    setNote(res.data);
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
        const ok = await addDownload(id);
        if (ok) {
            try {
                await apiFetch(`/notes/${id}/download`, { method: 'POST', requiresAuth: false });
            } catch {}
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
            await Share.share({
                message: shareMessage,
            });
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

    const [liked, setLiked] = useState(false);
    const [showLikePrompt, setShowLikePrompt] = useState(false);
    const [showHelpPrompt, setShowHelpPrompt] = useState(false);



    useEffect(() => {
        const timer = setTimeout(() => setShowHelpPrompt(true), 15000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (user?.id && note?.likedBy?.includes(user.id)) {
            setLiked(true);
        }
    }, [user, note?.likedBy]);

    const handleHelpYes = () => {
        setShowHelpPrompt(false);
        setShowRatingModal(true);
    };

    const handleHelpNo = () => {
        setShowHelpPrompt(false);
        showToast('Thanks for your feedback!', 'success');
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
                const newLiked = !(res as any).liked === false ? true : (res as any).liked;
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

    const MetaRow = ({ icon, label, value }: { icon: any; label: string; value: string | number }) => (
        <View style={styles.metaRow}>
            <Ionicons name={icon} size={16} color={colors.primary} />
            <Text style={styles.metaLabel}>{label}</Text>
            <Text style={styles.metaValue}>{value}</Text>
        </View>
    );

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
                        <Ionicons name="lock-closed" size={64} color="#7C3AED" />
                        <Text style={styles.premiumLockTitle}>Premium Note</Text>
                        <Text style={styles.premiumLockSub}>Upgrade to Premium to access this note and many more.</Text>
                        <TouchableOpacity style={styles.premiumLockBtn} onPress={() => router.push('/(drawer)/subscription')} activeOpacity={0.8}>
                            <Ionicons name="diamond" size={18} color="#FFFFFF" />
                            <Text style={styles.premiumLockBtnText}>Go Premium</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View>
                        <TouchableOpacity
                            style={styles.readPdfBtn}
                            onPress={() => {
                                if (!resolvedPdfUrl) {
                                    showToast('No PDF available for this note.', 'error');
                                    return;
                                }
                                router.push({
                                    pathname: '/pdf-viewer',
                                    params: { pdfUrl: resolvedPdfUrl, title: resolvedTitle, noteId: id },
                                });
                            }}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="document-text" size={28} color="#FFFFFF" />
                            <View style={styles.readPdfInfo}>
                                <Text style={styles.readPdfTitle}>Read PDF</Text>
                                <Text style={styles.readPdfSub}>Tap to open full-screen viewer</Text>
                            </View>
                            <Ionicons name="open-outline" size={20} color="rgba(255,255,255,0.8)" />
                        </TouchableOpacity>

                        <View style={styles.detailsCard}>
                            <Text style={styles.detailTitle}>{resolvedTitle}</Text>

                            {note?.isVerified && (
                                <View style={styles.verifiedRow}>
                                    <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                                    <Text style={styles.verifiedText}>Verified Note</Text>
                                </View>
                            )}

                            <View style={styles.statsRow}>
                                <View style={styles.stat}>
                                    <Ionicons name="download-outline" size={18} color={colors.primary} />
                                    <Text style={styles.statValue}>{note?.downloads || 0}</Text>
                                    <Text style={styles.statLabel}>Downloads</Text>
                                </View>
                                <View style={styles.stat}>
                                    <Ionicons name="eye-outline" size={18} color={colors.secondary} />
                                    <Text style={styles.statValue}>{note?.views || 0}</Text>
                                    <Text style={styles.statLabel}>Views</Text>
                                </View>
                                <TouchableOpacity style={styles.stat} onPress={handleLike} activeOpacity={0.7}>
                                    <Ionicons name={liked ? 'heart' : 'heart-outline'} size={18} color="#EF4444" />
                                    <Text style={styles.statValue}>{note?.likes || 0}</Text>
                                    <Text style={styles.statLabel}>Likes</Text>
                                </TouchableOpacity>
                                <View style={styles.stat}>
                                    <Ionicons name="star" size={18} color="#FFC107" />
                                    <Text style={styles.statValue}>{(note?.averageRating || 0).toFixed(1)}</Text>
                                    <Text style={styles.statLabel}>({note?.ratingCount || 0})</Text>
                                </View>
                            </View>

                            <View style={styles.uploaderCard}>
                                <View style={styles.uploaderHeader}>
                                    {note?.uploaderAvatar ? (
                                        <View style={styles.uploaderAvatar}>
                                            <Text style={styles.uploaderAvatarText}>{(note.uploaderName || 'A').charAt(0).toUpperCase()}</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.uploaderAvatar}>
                                            <Text style={styles.uploaderAvatarText}>{(note?.uploaderName || note?.uploadedBy?.name || 'A').charAt(0).toUpperCase()}</Text>
                                        </View>
                                    )}
                                    <View style={styles.uploaderInfo}>
                                        <Text style={styles.uploaderName}>{note?.uploaderName || note?.uploadedBy?.name || 'Anonymous'}</Text>
                                        {note?.uploaderCollege ? (
                                            <Text style={styles.uploaderCollege}>{note.uploaderCollege}</Text>
                                        ) : null}
                                    </View>
                                    {note?.uploadedBy?.id && (
                                        <View style={styles.contributorBadge}>
                                            <Ionicons name="ribbon-outline" size={12} color={colors.primary} />
                                            <Text style={styles.contributorBadgeText}>Contributor</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.uploaderMeta}>
                                    {note?.course ? (
                                        <View style={styles.uploaderMetaItem}>
                                            <Ionicons name="school-outline" size={14} color={colors.textSecondary} />
                                            <Text style={styles.uploaderMetaText}>{note.course}</Text>
                                        </View>
                                    ) : null}
                                    {(note as any)?.uploaderBranch ? (
                                        <View style={styles.uploaderMetaItem}>
                                            <Ionicons name="git-branch-outline" size={14} color={colors.textSecondary} />
                                            <Text style={styles.uploaderMetaText}>{(note as any).uploaderBranch}</Text>
                                        </View>
                                    ) : null}
                                    {note?.createdAt ? (
                                        <View style={styles.uploaderMetaItem}>
                                            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                                            <Text style={styles.uploaderMetaText}>{formatDate(note.createdAt)}</Text>
                                        </View>
                                    ) : null}
                                </View>
                            </View>

                            <View style={styles.metaSection}>
                                <MetaRow icon="layers-outline" label="Semester" value={note?.semester || 'N/A'} />
                                <MetaRow icon="book-outline" label="Subject" value={note?.subject || 'N/A'} />
                                {note?.unit ? <MetaRow icon="bookmark-outline" label="Unit" value={note.unit} /> : null}
                            </View>

                            {note?.description ? (
                                <View style={styles.descSection}>
                                    <Text style={styles.descLabel}>Description</Text>
                                    <Text style={styles.descText}>{note.description}</Text>
                                </View>
                            ) : null}

                            {note?.tags && note.tags.length > 0 ? (
                                <View style={styles.tagsSection}>
                                    <Text style={styles.tagsLabel}>Tags</Text>
                                    <View style={styles.tagsRow}>
                                        {note.tags.map((tag, i) => (
                                            <View key={i} style={styles.tag}>
                                                <Text style={styles.tagText}>{tag}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            ) : null}

                            <View style={styles.actionRow}>
                                <TouchableOpacity style={styles.actionBtn} onPress={handleDownload} activeOpacity={0.7}>
                                    <Ionicons name="download-outline" size={20} color={colors.textOnPrimary} />
                                    <Text style={styles.actionBtnText}>Download</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => { if (!user) { showToast('Sign in to rate notes.', 'error'); return; } setShowRatingModal(true); }} activeOpacity={0.7}>
                                    <Ionicons name="star-outline" size={20} color={colors.primary} />
                                    <Text style={styles.actionBtnSecondaryText}>Rate</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => { if (!user) { showToast('Sign in to report notes.', 'error'); return; } setShowReportModal(true); }} activeOpacity={0.7}>
                                    <Ionicons name="flag-outline" size={20} color="#EF4444" />
                                    <Text style={[styles.actionBtnSecondaryText, { color: '#EF4444' }]}>Report</Text>
                                </TouchableOpacity>
                            </View>

                            {showHelpPrompt && (
                                <View style={styles.helpPrompt}>
                                    <Text style={styles.helpPromptTitle}>Did this note help you?</Text>
                                    <View style={styles.helpPromptRow}>
                                        <TouchableOpacity style={styles.helpBtn} onPress={handleHelpYes} activeOpacity={0.7}>
                                            <Text style={styles.helpBtnIcon}>👍</Text>
                                            <Text style={styles.helpBtnText}>Yes</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.helpBtn} onPress={handleHelpNo} activeOpacity={0.7}>
                                            <Text style={styles.helpBtnIcon}>👎</Text>
                                            <Text style={styles.helpBtnText}>No</Text>
                                        </TouchableOpacity>
                                    </View>

                                </View>
                            )}
                        </View>

                        {relatedNotes.length > 0 && (
                            <View style={styles.relatedSection}>
                                <Text style={styles.relatedTitle}>Related Notes</Text>
                                {relatedNotes.map((rn) => (
                                    <TouchableOpacity
                                        key={rn.id}
                                        style={styles.relatedCard}
                                        onPress={() => router.push(`/note/${rn.id}`)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.relatedIcon}>
                                            <Ionicons name="document-text" size={20} color={colors.primary} />
                                        </View>
                                        <View style={styles.relatedInfo}>
                                            <Text style={styles.relatedName} numberOfLines={1}>{rn.title}</Text>
                                            <Text style={styles.relatedMeta}>{rn.subject} • {rn.downloads || 0} downloads</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
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
                                        color={star <= ratingValue ? '#FFC107' : colors.textLight}
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
                            <Ionicons name={liked ? 'heart-dislike' : 'heart'} size={40} color="#EF4444" />
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
    headerActions: { flexDirection: 'row', alignItems: 'center', marginRight: spacing.sm },
    headerButton: { padding: spacing.sm, marginLeft: spacing.xs },
    readPdfBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: colors.primary,
        borderRadius: 16,
        padding: spacing.lg,
        marginHorizontal: spacing.screenPadding,
        marginBottom: spacing.md,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    readPdfInfo: {
        flex: 1,
    },
    readPdfTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: '#FFFFFF',
    },
    readPdfSub: {
        fontSize: typography.fontSize.xs,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    detailsCard: {
        backgroundColor: colors.cardBackground, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: spacing.lg, marginTop: -24,
    },
    detailTitle: { fontSize: typography.fontSize.xxl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
    verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
    verifiedText: { fontSize: typography.fontSize.sm, color: '#10B981', fontWeight: typography.fontWeight.semibold },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg, marginBottom: spacing.lg },
    stat: { alignItems: 'center', gap: 4 },
    statValue: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
    statLabel: { fontSize: typography.fontSize.xs, color: colors.textSecondary },
    uploaderCard: {
        backgroundColor: colors.cardBackground, borderRadius: 16, padding: spacing.lg,
        marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border,
    },
    uploaderHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
    uploaderAvatar: {
        width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary,
        justifyContent: 'center', alignItems: 'center',
    },
    uploaderAvatarText: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: '#FFFFFF' },
    uploaderInfo: { flex: 1 },
    uploaderName: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary },
    uploaderCollege: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: 2 },
    contributorBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: 'rgba(79, 70, 229, 0.1)', borderRadius: 999,
        paddingHorizontal: 8, paddingVertical: 4,
    },
    contributorBadgeText: { fontSize: typography.fontSize.xs, color: colors.primary, fontWeight: typography.fontWeight.semibold },
    uploaderMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    uploaderMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    uploaderMetaText: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
    metaSection: { gap: spacing.sm, marginBottom: spacing.lg },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    metaLabel: { fontSize: typography.fontSize.sm, color: colors.textSecondary, width: 80 },
    metaValue: { fontSize: typography.fontSize.sm, color: colors.textPrimary, fontWeight: typography.fontWeight.medium, flex: 1 },
    descSection: { marginBottom: spacing.lg },
    descLabel: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.textSecondary, marginBottom: spacing.sm },
    descText: { fontSize: typography.fontSize.sm, color: colors.textPrimary, lineHeight: 22 },
    tagsSection: { marginBottom: spacing.lg },
    tagsLabel: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.textSecondary, marginBottom: spacing.sm },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    tag: { backgroundColor: 'rgba(79, 70, 229, 0.1)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
    tagText: { fontSize: typography.fontSize.xs, color: colors.primary, fontWeight: typography.fontWeight.medium },
    actionRow: { flexDirection: 'row', gap: spacing.sm },
    actionBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
        backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: spacing.sm,
    },
    actionBtnText: { color: colors.textOnPrimary, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold },
    actionBtnSecondary: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
        backgroundColor: colors.cardBackground, borderRadius: 14, paddingVertical: 14, paddingHorizontal: spacing.sm,
        borderWidth: 1, borderColor: colors.border,
    },
    actionBtnSecondaryText: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold, color: colors.primary },
    relatedSection: { padding: spacing.screenPadding },
    relatedTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginBottom: spacing.md },
    relatedCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBackground,
        borderRadius: 14, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, gap: spacing.md,
    },
    relatedIcon: {
        width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(79, 70, 229, 0.1)',
        justifyContent: 'center', alignItems: 'center',
    },
    relatedInfo: { flex: 1 },
    relatedName: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary },
    relatedMeta: { fontSize: typography.fontSize.xs, color: colors.textSecondary, marginTop: 2 },
    premiumLock: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xxl, gap: spacing.md, paddingVertical: 80 },
    premiumLockTitle: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', textAlign: 'center' },
    premiumLockSub: { fontSize: 14, color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', lineHeight: 20 },
    premiumLockBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: '#7C3AED', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, marginTop: spacing.md },
    premiumLockBtnText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
    modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    likeModal: { backgroundColor: '#1A1A2E', borderRadius: 24, padding: spacing.xl, width: '85%', maxWidth: 360, alignItems: 'center' },
    likeModalIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(239, 68, 68, 0.12)', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
    likeModalTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, textAlign: 'center' },
    likeModalSub: { fontSize: typography.fontSize.sm, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20, marginBottom: spacing.lg, paddingHorizontal: spacing.md },
    likeModalActions: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'center', width: '100%' },
    likeModalConfirm: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12, backgroundColor: '#EF4444' },
    likeModalConfirmText: { color: '#FFFFFF', fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.md },
    modal: { backgroundColor: '#1A1A2E', borderRadius: 24, padding: spacing.xl, width: '85%', maxWidth: 400 },
    modalTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginBottom: spacing.lg, textAlign: 'center' },
    starsRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.lg },
    modalActions: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'center' },
    modalCancel: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
    modalCancelText: { color: colors.textSecondary, fontWeight: typography.fontWeight.semibold },
    modalSubmit: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.primary },
    modalSubmitText: { color: colors.textOnPrimary, fontWeight: typography.fontWeight.semibold },
    reportOption: { padding: spacing.md, borderRadius: 12, backgroundColor: colors.cardBackground, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
    reportOptionActive: { borderColor: colors.primary, backgroundColor: 'rgba(79, 70, 229, 0.08)' },
    reportOptionText: { fontSize: typography.fontSize.sm, color: colors.textPrimary },
    reportOptionTextActive: { color: colors.primary, fontWeight: typography.fontWeight.semibold },
    helpPrompt: {
        marginTop: spacing.lg, backgroundColor: 'rgba(124, 58, 237, 0.08)',
        borderRadius: 16, padding: spacing.lg, borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.2)',
    },
    helpPromptTitle: {
        fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.md,
    },
    helpPromptRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md },
    helpBtn: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
        paddingHorizontal: spacing.lg, paddingVertical: spacing.sm + 2,
        borderRadius: 14, backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.border,
    },
    helpBtnIcon: { fontSize: 18 },
    helpBtnText: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary },
});
