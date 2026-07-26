import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Modal,
    FlatList,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GradientBackground from '../components/GradientBackground';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { usePersonalNotes } from '../hooks/usePersonalNotes';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { publishCommunityNote } from '../hooks/useCommunityNotes';
import { Note, Course } from '../types/note';
import { apiFetch } from '../hooks/useApi';
import DriveFilePickerModal from '../components/DriveFilePickerModal';
import { PickedDriveFile, uploadFileToServer } from '../hooks/useDriveFiles';

import AnimatedStepper from '../components/upload-wizard/AnimatedStepper';
import WizardStep from '../components/upload-wizard/WizardStep';
import SelectionCard from '../components/upload-wizard/SelectionCard';
import ReviewSummary from '../components/upload-wizard/ReviewSummary';
import GradientButton from '../components/upload-wizard/GradientButton';
import FormField from '../components/upload-wizard/FormField';
import StepHeader from '../components/upload-wizard/StepHeader';
import GlassCard from '../components/upload-wizard/GlassCard';
import ProgressIndicator from '../components/upload-wizard/ProgressIndicator';

// ─── Dark theme shorthand ────────────────────────────────────────────────────

const D = colors.dark;

// ─── Picker Modal ────────────────────────────────────────────────────────────

interface PickerOption {
    id: string;
    name: string;
    subtitle?: string;
}

function PickerModal({
    visible,
    title,
    options,
    onSelect,
    onClose,
    loading,
}: {
    visible: boolean;
    title: string;
    options: PickerOption[];
    onSelect: (item: PickerOption) => void;
    onClose: () => void;
    loading?: boolean;
}) {
    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={pickerStyles.overlay}>
                <View style={pickerStyles.container}>
                    <View style={pickerStyles.header}>
                        <Text style={pickerStyles.title}>{title}</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={8}>
                            <Ionicons name="close" size={24} color={D.text} />
                        </TouchableOpacity>
                    </View>
                    {loading ? (
                        <ActivityIndicator size="large" color={D.primary} style={{ marginTop: 40 }} />
                    ) : (
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={pickerStyles.option}
                                    onPress={() => onSelect(item)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={pickerStyles.optionName}>{item.name}</Text>
                                    {item.subtitle ? (
                                        <Text style={pickerStyles.optionSub}>{item.subtitle}</Text>
                                    ) : null}
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={pickerStyles.list}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}

const pickerStyles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: D.overlay, justifyContent: 'flex-end' },
    container: { backgroundColor: D.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%', paddingBottom: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: D.border },
    title: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: D.text },
    list: { padding: spacing.md },
    option: { padding: spacing.md, borderRadius: 12, backgroundColor: D.surfaceElevated, marginBottom: spacing.sm, borderWidth: 1, borderColor: D.border },
    optionName: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold, color: D.text },
    optionSub: { fontSize: typography.fontSize.sm, color: D.textSecondary, marginTop: 4 },
});

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['Course', 'Semester', 'Subject', 'Upload'] as const;

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function UploadNoteScreen() {
    const router = useRouter();
    const { showToast } = useToast();
    const { user } = useAuth();
    const { addNote, markPublished } = usePersonalNotes();

    const hasAcademicProfile = Boolean(user?.course && (user as any)?.college && (user as any)?.branch);

    const [step, setStep] = useState(0);
    const [previousStep, setPreviousStep] = useState(0);

    // ── Form state ──────────────────────────────────────────────────────────
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [unit, setUnit] = useState('');
    const [pickedFile, setPickedFile] = useState<PickedDriveFile | null>(null);
    const [pickerVisible, setPickerVisible] = useState(false);
    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // ── Picker state ────────────────────────────────────────────────────────
    const [courses, setCourses] = useState<PickerOption[]>([]);
    const [semesters, setSemesters] = useState<PickerOption[]>([]);
    const [subjects, setSubjects] = useState<PickerOption[]>([]);

    const insets = useSafeAreaInsets();

    const [selectedCourse, setSelectedCourse] = useState<PickerOption | null>(null);
    const [selectedSemester, setSelectedSemester] = useState<PickerOption | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<PickerOption | null>(null);
    const [customSubject, setCustomSubject] = useState('');
    const [showCustomSubjectInput, setShowCustomSubjectInput] = useState(false);

    const [loadingSemesters, setLoadingSemesters] = useState(false);
    const [loadingSubjects, setLoadingSubjects] = useState(false);

    const [courseSearch, setCourseSearch] = useState('');

    // ── Derived ─────────────────────────────────────────────────────────────

    const filteredCourses = useMemo(() => {
        if (!courseSearch.trim()) return courses;
        const q = courseSearch.toLowerCase();
        return courses.filter((c) => c.name.toLowerCase().includes(q));
    }, [courses, courseSearch]);

    const resolvedSubjectName = selectedSubject
        ? selectedSubject.id === '__custom__'
            ? customSubject.trim()
            : selectedSubject.name
        : '';

    const completedSteps = useMemo(() => {
        const completed: number[] = [];
        if (selectedCourse) completed.push(0);
        if (selectedSemester) completed.push(1);
        if (selectedSubject && resolvedSubjectName) completed.push(2);
        if (pickedFile && title.trim()) completed.push(3);
        return completed;
    }, [selectedCourse, selectedSemester, selectedSubject, resolvedSubjectName, pickedFile, title]);

    // ── Load courses ────────────────────────────────────────────────────────

    useEffect(() => {
        async function loadCourses() {
            try {
                const res = await apiFetch<Course[]>('/courses', { requiresAuth: false });
                if (res.success && res.data) {
                    setCourses(res.data.map((c) => ({ id: c.id || c._id || '', name: c.name })));
                }
            } catch (e) {
                console.warn('Could not load courses');
            }
        }
        loadCourses();
    }, []);

    // ── Step navigation ─────────────────────────────────────────────────────

    const goToStep = useCallback(
        (newStep: number) => {
            setPreviousStep(step);
            setStep(newStep);
        },
        [step]
    );

    const handleBack = useCallback(() => {
        if (step > 0) {
            goToStep(step - 1);
        } else {
            router.back();
        }
    }, [step, goToStep, router]);

    // ── Handlers ────────────────────────────────────────────────────────────

    const handleSelectCourse = async (course: PickerOption) => {
        setSelectedCourse(course);
        setSelectedSemester(null);
        setSelectedSubject(null);
        setShowCustomSubjectInput(false);
        setSemesters([]);
        setSubjects([]);
        goToStep(1);
        setLoadingSemesters(true);
        try {
            const res = await apiFetch<Array<{ id: string; number: number }>>(
                `/courses/${course.id}/semesters`,
                { requiresAuth: false }
            );
            if (res.success && res.data) {
                setSemesters(
                    res.data.map((s) => ({
                        id: s.id,
                        name: `Semester ${s.number}`,
                        subtitle: `${s.number}th Semester`,
                    }))
                );
            }
        } catch (e) {
            console.warn('Could not load semesters');
        } finally {
            setLoadingSemesters(false);
        }
    };

    const handleSelectSemester = async (semester: PickerOption) => {
        setSelectedSemester(semester);
        setSelectedSubject(null);
        setShowCustomSubjectInput(false);
        setSubjects([]);
        goToStep(2);
        setLoadingSubjects(true);
        try {
            const res = await apiFetch<Array<{ id: string; name: string; noteCount: number }>>(
                `/courses/semester/${semester.id}/subjects`,
                { requiresAuth: false }
            );
            if (res.success && res.data) {
                setSubjects([
                    ...res.data.map((s) => ({ id: s.id, name: s.name, subtitle: `${s.noteCount} notes` })),
                    { id: '__custom__', name: 'Other (custom subject)', subtitle: 'Subject not in the list' },
                ]);
            }
        } catch (e) {
            console.warn('Could not load subjects');
        } finally {
            setLoadingSubjects(false);
        }
    };

    const handleSelectSubject = (subject: PickerOption) => {
        if (subject.id === '__custom__') {
            setSelectedSubject(subject);
            setShowCustomSubjectInput(true);
        } else {
            setSelectedSubject(subject);
            setShowCustomSubjectInput(false);
            goToStep(3);
        }
    };

    const proceedFromCustomSubject = () => {
        if (!customSubject.trim()) {
            showToast('Please enter a subject name.', 'error');
            return;
        }
        goToStep(3);
    };

    const handleSubmit = async () => {
        if (!hasAcademicProfile) {
            showToast('Please complete your academic profile first.', 'error');
            router.push('/(drawer)/profile');
            return;
        }

        const trimmedTitle = title.trim();
        const trimmedDesc = description.trim();
        const trimmedUnit = unit.trim();
        const trimmedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);

        if (!trimmedTitle) {
            showToast('Please enter a note title.', 'error');
            return;
        }
        if (!resolvedSubjectName) {
            showToast('Please select or enter a subject.', 'error');
            return;
        }

        try {
            setIsSaving(true);
            let fileForNote = pickedFile;

            if (user && fileForNote?.uri && !fileForNote.uploadedUrl) {
                setIsUploadingFile(true);
                setUploadProgress(0);
                const uploaded = await uploadFileToServer(fileForNote.uri, fileForNote.name, (pct) => {
                    setUploadProgress(pct);
                });
                setIsUploadingFile(false);
                if (uploaded.ok) {
                    fileForNote = { ...fileForNote, uploadedUrl: uploaded.url, viewUrl: uploaded.url, shareUrl: uploaded.url };
                } else {
                    setIsSaving(false);
                    showToast(uploaded.message || 'Upload failed. Please try again.', 'error');
                    return;
                }
            }

            const noteData: Record<string, any> = {
                title: trimmedTitle,
                description: trimmedDesc,
                course: selectedCourse?.name || '',
                courseId: selectedCourse?.id || undefined,
                semester: selectedSemester ? parseInt(selectedSemester.name.replace('Semester ', '')) : undefined,
                semesterId: selectedSemester?.id || undefined,
                subject: resolvedSubjectName,
                subjectId: selectedSubject?.id === '__custom__' ? undefined : selectedSubject?.id,
                unit: trimmedUnit || undefined,
                tags: trimmedTags,
                pdfUrl: fileForNote?.uploadedUrl || fileForNote?.viewUrl || fileForNote?.shareUrl || undefined,
                noteType: fileForNote ? 'pdf' : 'text',
                isPublished: true,
                needsReview: selectedSubject?.id === '__custom__',
            };

            const newNote = await addNote(noteData as any);
            setIsSaving(false);

            if (!user) {
                showToast('Note saved locally. Sign in to share with the community.', 'success');
                router.replace('/notes');
                return;
            }

            const publishResult = await publishCommunityNote({
                ...newNote,
                course: selectedCourse?.name || '',
                courseId: selectedCourse?.id || undefined,
                semester: selectedSemester ? parseInt(selectedSemester.name.replace('Semester ', '')) : undefined,
                semesterId: selectedSemester?.id || undefined,
                subject: resolvedSubjectName,
                subjectId: selectedSubject?.id === '__custom__' ? undefined : selectedSubject?.id,
            });
            if (publishResult.ok) {
                await markPublished(newNote.id);
                showToast('Note published to the community!', 'success');
            } else {
                showToast('Saved locally. Sharing failed.', 'info');
            }
            router.replace('/notes');
        } catch (error) {
            console.error('Upload note error:', error);
            showToast('Upload failed. Please try again.', 'error');
        } finally {
            setIsSaving(false);
            setIsUploadingFile(false);
        }
    };

    // ── Step content ────────────────────────────────────────────────────────

    const renderStepContent = () => {
        switch (step) {
            // ── Step 0: Course ──────────────────────────────────────────────
            case 0:
                return (
                    <WizardStep stepKey="course" stepIndex={0} previousStep={previousStep}>
                        <GlassCard delay={120} dark>
                            <StepHeader
                                icon="school-outline"
                                title="Choose Your Course"
                                subtitle="Select the course this note belongs to"
                                dark
                            />

                            <View style={styles.searchWrap}>
                                <Ionicons name="search" size={18} color={D.textMuted} style={styles.searchIcon} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search courses..."
                                    placeholderTextColor={D.textMuted}
                                    value={courseSearch}
                                    onChangeText={setCourseSearch}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    accessibilityLabel="Search courses"
                                />
                                {courseSearch.length > 0 && (
                                    <TouchableOpacity onPress={() => setCourseSearch('')} hitSlop={8}>
                                        <Ionicons name="close-circle" size={18} color={D.textMuted} />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {courses.length === 0 ? (
                                <ActivityIndicator size="large" color={D.primary} style={{ marginVertical: 40 }} />
                            ) : (
                                filteredCourses.map((course, idx) => (
                                    <SelectionCard
                                        key={course.id}
                                        id={course.id}
                                        name={course.name}
                                        icon="school-outline"
                                        isSelected={selectedCourse?.id === course.id}
                                        isCompleted={selectedCourse?.id === course.id}
                                        onPress={() => handleSelectCourse(course)}
                                        index={idx}
                                        dark
                                    />
                                ))
                            )}
                        </GlassCard>
                    </WizardStep>
                );

            // ── Step 1: Semester ───────────────────────────────────────────
            case 1:
                return (
                    <WizardStep stepKey="semester" stepIndex={1} previousStep={previousStep}>
                        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                            <Ionicons name="arrow-back" size={20} color={D.primary} />
                            <Text style={styles.backBtnText}>{selectedCourse?.name || 'Back'}</Text>
                        </TouchableOpacity>

                        <GlassCard delay={120} dark>
                            <StepHeader
                                icon="layers-outline"
                                title="Select Semester"
                                subtitle={`For ${selectedCourse?.name || ''}`}
                                dark
                            />

                            {loadingSemesters ? (
                                <ActivityIndicator size="large" color={D.primary} style={{ marginVertical: 40 }} />
                            ) : semesters.length === 0 ? (
                                <Text style={styles.emptyText}>No semesters available.</Text>
                            ) : (
                                semesters.map((sem, idx) => (
                                    <SelectionCard
                                        key={sem.id}
                                        id={sem.id}
                                        name={sem.name}
                                        subtitle={sem.subtitle}
                                        icon="layers-outline"
                                        isSelected={selectedSemester?.id === sem.id}
                                        isCompleted={selectedSemester?.id === sem.id}
                                        onPress={() => handleSelectSemester(sem)}
                                        index={idx}
                                        dark
                                    />
                                ))
                            )}
                        </GlassCard>
                    </WizardStep>
                );

            // ── Step 2: Subject ────────────────────────────────────────────
            case 2:
                return (
                    <WizardStep stepKey="subject" stepIndex={2} previousStep={previousStep}>
                        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                            <Ionicons name="arrow-back" size={20} color={D.primary} />
                            <Text style={styles.backBtnText}>{selectedSemester?.name || 'Back'}</Text>
                        </TouchableOpacity>

                        <GlassCard delay={120} dark>
                            <StepHeader
                                icon="book-outline"
                                title="Select Subject"
                                subtitle={`${selectedSemester?.name || ''} — ${selectedCourse?.name || ''}`}
                                dark
                            />

                            {loadingSubjects ? (
                                <ActivityIndicator size="large" color={D.primary} style={{ marginVertical: 40 }} />
                            ) : showCustomSubjectInput ? (
                                <View>
                                    <FormField
                                        label="Enter Subject Name"
                                        required
                                        placeholder="e.g. Advanced Graph Theory"
                                        value={customSubject}
                                        onChangeText={setCustomSubject}
                                        autoFocus
                                        dark
                                    />
                                    <Text style={styles.hint}>
                                        This will be marked as "Pending Review" until an admin approves it.
                                    </Text>
                                    <View style={styles.stepActions}>
                                        <GradientButton
                                            label="Pick from list"
                                            onPress={() => {
                                                setShowCustomSubjectInput(false);
                                                setSelectedSubject(null);
                                            }}
                                            disabled={false}
                                            style={{ flex: 1, shadowOpacity: 0, elevation: 0 }}
                                            dark
                                        />
                                        <GradientButton
                                            label="Continue"
                                            onPress={proceedFromCustomSubject}
                                            style={{ flex: 1 }}
                                            dark
                                        />
                                    </View>
                                </View>
                            ) : (
                                subjects.map((subj, idx) => (
                                    <SelectionCard
                                        key={subj.id}
                                        id={subj.id}
                                        name={subj.name}
                                        subtitle={subj.subtitle}
                                        icon={subj.id === '__custom__' ? 'add-circle-outline' : 'book-outline'}
                                        isSelected={selectedSubject?.id === subj.id}
                                        isCompleted={selectedSubject?.id === subj.id && subj.id !== '__custom__'}
                                        onPress={() => handleSelectSubject(subj)}
                                        index={idx}
                                        dark
                                    />
                                ))
                            )}
                        </GlassCard>
                    </WizardStep>
                );

            // ── Step 3: Upload ─────────────────────────────────────────────
            case 3:
                return (
                    <WizardStep stepKey="upload" stepIndex={3} previousStep={previousStep}>
                        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                            <Ionicons name="arrow-back" size={20} color={D.primary} />
                            <Text style={styles.backBtnText}>Subject Selection</Text>
                        </TouchableOpacity>

                        {/* Review Summary */}
                        <ReviewSummary
                            fields={[
                                { label: 'Course', value: selectedCourse?.name || '', onEdit: () => goToStep(0) },
                                { label: 'Semester', value: selectedSemester?.name || '', onEdit: () => goToStep(1) },
                                { label: 'Subject', value: resolvedSubjectName, onEdit: () => goToStep(2) },
                            ]}
                            fileName={pickedFile?.name}
                            dark
                        />

                        {/* Note Details */}
                        <GlassCard delay={180} style={styles.mt} dark>
                            <StepHeader
                                icon="document-text-outline"
                                title="Note Details"
                                subtitle="Add details about your note"
                                dark
                            />

                            <FormField
                                label="Title"
                                required
                                placeholder="e.g. Graph Algorithms Notes"
                                value={title}
                                onChangeText={setTitle}
                                dark
                            />

                            <FormField
                                label="Unit / Module"
                                placeholder="e.g. Unit 3"
                                value={unit}
                                onChangeText={setUnit}
                                dark
                            />

                            <FormField
                                label="Tags (comma separated)"
                                placeholder="e.g. graphs, BFS, DFS, algorithms"
                                value={tags}
                                onChangeText={setTags}
                                dark
                            />

                            <FormField
                                label="Description"
                                placeholder="Brief description of the note..."
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                style={styles.textArea}
                                dark
                            />
                        </GlassCard>

                        {/* File Selection */}
                        <GlassCard delay={240} style={styles.mt} dark>
                            <StepHeader
                                icon="attach-outline"
                                title="Attach File"
                                subtitle="Upload a PDF or document"
                                dark
                            />

                            {pickedFile ? (
                                <View style={styles.selectedFileCard}>
                                    <View style={styles.selectedFileIcon}>
                                        <Ionicons name="document-text" size={22} color={D.primary} />
                                    </View>
                                    <View style={styles.selectedFileInfo}>
                                        <Text style={styles.selectedFileName} numberOfLines={2}>
                                            {pickedFile.name}
                                        </Text>
                                        <Text style={styles.selectedFileMeta}>Ready to upload</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => setPickedFile(null)} hitSlop={8}>
                                        <Ionicons name="close-circle" size={22} color={D.textMuted} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={styles.fileButton}
                                    onPress={() => setPickerVisible(true)}
                                    activeOpacity={0.85}
                                    accessibilityRole="button"
                                    accessibilityLabel="Choose file to upload"
                                >
                                    <Ionicons name="cloud-upload-outline" size={26} color={D.primary} />
                                    <Text style={styles.fileButtonText}>Choose PDF File</Text>
                                    <Text style={styles.fileButtonSubtext}>Tap to browse your files</Text>
                                </TouchableOpacity>
                            )}

                            {pickedFile ? (
                                <TouchableOpacity
                                    style={styles.changeFileBtn}
                                    onPress={() => setPickerVisible(true)}
                                    accessibilityLabel="Choose a different file"
                                >
                                    <Ionicons name="swap-horizontal" size={16} color={D.primary} />
                                    <Text style={styles.changeFileText}>Choose a different file</Text>
                                </TouchableOpacity>
                            ) : null}
                        </GlassCard>

                        {/* Upload Progress */}
                        {isSaving && (
                            <View style={styles.mt}>
                                <ProgressIndicator
                                    label={isUploadingFile ? 'Uploading your file' : 'Publishing to community'}
                                    percent={isUploadingFile ? uploadProgress : 95}
                                    statusText={isUploadingFile
                                        ? uploadProgress < 100
                                            ? 'Encrypting and transmitting...'
                                            : 'Almost there...'
                                        : 'Finalizing your note...'}
                                    dark
                                />
                            </View>
                        )}

                        {/* Submit */}
                        <View style={styles.mtLg}>
                            <GradientButton
                                label={isSaving ? '' : 'Publish to Community'}
                                loading={isSaving}
                                loadingLabel={isUploadingFile ? 'Uploading...' : 'Publishing...'}
                                onPress={handleSubmit}
                                disabled={!title.trim() || !resolvedSubjectName}
                                icon={!isSaving ? 'rocket-outline' : undefined}
                                dark
                            />
                        </View>
                    </WizardStep>
                );

            default:
                return null;
        }
    };

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <GradientBackground dark>
            <Stack.Screen
                options={{
                    title: 'Upload Note',
                    headerShown: true,
                    headerStyle: { backgroundColor: D.background },
                    headerShadowVisible: false,
                    headerTintColor: D.text,
                    headerTitleStyle: { color: D.text, fontWeight: '700' },
                }}
            />

            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={[styles.headerSpacer, { height: insets.top + spacing.sm }]} />

                    {/* Hero section */}
                    <View style={styles.heroSection}>
                        <LinearGradient
                            colors={[D.primary, D.primaryDark]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.heroGradient}
                        >
                            <View style={styles.heroIconWrap}>
                                <Ionicons name="cloud-upload" size={28} color="#FFFFFF" />
                            </View>
                            <Text style={styles.heroTitle}>Upload Note</Text>
                            <Text style={styles.heroSubtitle}>
                                Share knowledge with thousands of students
                            </Text>
                        </LinearGradient>
                    </View>

                    {/* Profile Incomplete Banner */}
                    {!hasAcademicProfile && (
                        <View style={styles.profileBanner}>
                            <Ionicons name="alert-circle-outline" size={20} color={D.primary} />
                            <View style={styles.profileBannerText}>
                                <Text style={styles.profileBannerTitle}>Complete your profile</Text>
                                <Text style={styles.profileBannerSub}>Academic info is required before uploading.</Text>
                            </View>
                            <TouchableOpacity style={styles.profileBannerBtn} onPress={() => router.push('/(drawer)/profile')} activeOpacity={0.8}>
                                <Text style={styles.profileBannerBtnText}>Complete</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Stepper */}
                    <AnimatedStepper
                        currentStep={step}
                        completedSteps={completedSteps}
                        onStepPress={goToStep}
                        dark
                    />

                    {/* Step Content */}
                    {renderStepContent()}
                </ScrollView>
            </KeyboardAvoidingView>

            <DriveFilePickerModal
                visible={pickerVisible}
                onClose={() => setPickerVisible(false)}
                onSelect={(file) => {
                    setPickedFile(file);
                    if (!title.trim()) {
                        const baseName = file.name.replace(/\.[^.]+$/, '');
                        setTitle(baseName);
                    }
                }}
                dark
            />
        </GradientBackground>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    flex: { flex: 1 },
    content: { padding: spacing.screenPadding, paddingBottom: spacing.xxl },
    headerSpacer: { width: '100%' },
    mt: { marginTop: spacing.md },
    mtLg: { marginTop: spacing.lg },

    // Hero
    heroSection: { marginBottom: spacing.lg },
    heroGradient: {
        borderRadius: 20,
        padding: spacing.lg,
        alignItems: 'center',
    },
    heroIconWrap: {
        width: 56,
        height: 56,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    heroTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: '#FFFFFF',
        marginBottom: spacing.xs,
        letterSpacing: -0.5,
    },
    heroSubtitle: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255,255,255,0.85)',
        lineHeight: 20,
    },

    // Search
    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: D.inputBg,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: D.inputBorder,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
    searchIcon: { marginRight: spacing.sm },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: typography.fontSize.md,
        color: D.text,
    },

    // Back button
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
        paddingVertical: spacing.sm,
    },
    backBtnText: {
        fontSize: typography.fontSize.md,
        color: D.primary,
        fontWeight: typography.fontWeight.semibold,
    },

    // Empty
    emptyText: {
        color: D.textSecondary,
        textAlign: 'center',
        marginVertical: spacing.xl,
    },
    hint: {
        fontSize: typography.fontSize.xs,
        color: D.textSecondary,
        fontStyle: 'italic',
        marginBottom: spacing.md,
        lineHeight: 18,
    },

    // Step actions
    stepActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.md,
        gap: spacing.md,
    },

    // File picker
    fileButton: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        backgroundColor: D.chipBg,
        borderRadius: 16,
        paddingVertical: spacing.xl,
        borderWidth: 1.5,
        borderColor: D.chipBorder,
        borderStyle: 'dashed',
    },
    fileButtonText: {
        color: D.primary,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
    },
    fileButtonSubtext: {
        color: D.textMuted,
        fontSize: typography.fontSize.xs,
    },
    selectedFileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: 'rgba(0, 230, 118, 0.06)',
        borderRadius: 14,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(0, 230, 118, 0.2)',
    },
    selectedFileIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 230, 118, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedFileInfo: { flex: 1 },
    selectedFileName: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: D.text,
    },
    selectedFileMeta: {
        fontSize: typography.fontSize.xs,
        color: D.accent,
        marginTop: 2,
        fontWeight: typography.fontWeight.medium,
    },
    changeFileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        marginTop: spacing.sm,
        paddingVertical: spacing.sm,
    },
    changeFileText: {
        color: D.primary,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
    },

    // Textarea
    textArea: { minHeight: 100 },

    // Profile incomplete banner
    profileBanner: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
        backgroundColor: D.chipBg, borderRadius: 14,
        padding: spacing.md, marginBottom: spacing.lg,
        borderWidth: 1, borderColor: D.chipBorder,
    },
    profileBannerText: { flex: 1 },
    profileBannerTitle: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: D.text },
    profileBannerSub: { fontSize: typography.fontSize.xs, color: D.textSecondary, marginTop: 2 },
    profileBannerBtn: {
        backgroundColor: D.primary, borderRadius: 8,
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    },
    profileBannerBtnText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: D.textOnAccent },
});
