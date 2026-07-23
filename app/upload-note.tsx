import React, { useMemo, useState, useEffect } from 'react';
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
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    {loading ? (
                        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
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
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#1A1A2E',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '70%',
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
    },
    list: {
        padding: spacing.md,
    },
    option: {
        padding: spacing.md,
        borderRadius: 12,
        backgroundColor: colors.cardBackground,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    optionName: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
    },
    optionSub: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: 4,
    },
});

const UPLOAD_STEPS = ['Course', 'Semester', 'Subject', 'Upload'] as const;

export default function UploadNoteScreen() {
    const router = useRouter();
    const { showToast } = useToast();
    const { user } = useAuth();
    const { addNote, markPublished } = usePersonalNotes();

    const [step, setStep] = useState(0);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [unit, setUnit] = useState('');
    const [pickedFile, setPickedFile] = useState<PickedDriveFile | null>(null);
    const [pickerVisible, setPickerVisible] = useState(false);
    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [courses, setCourses] = useState<PickerOption[]>([]);
    const [semesters, setSemesters] = useState<PickerOption[]>([]);
    const [subjects, setSubjects] = useState<PickerOption[]>([]);

    const insets = useSafeAreaInsets();

    const [selectedCourse, setSelectedCourse] = useState<PickerOption | null>(null);
    const [selectedSemester, setSelectedSemester] = useState<PickerOption | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<PickerOption | null>(null);
    const [customSubject, setCustomSubject] = useState('');
    const [showCustomSubjectInput, setShowCustomSubjectInput] = useState(false);

    const [showCoursePicker, setShowCoursePicker] = useState(false);
    const [showSemesterPicker, setShowSemesterPicker] = useState(false);
    const [showSubjectPicker, setShowSubjectPicker] = useState(false);
    const [loadingSemesters, setLoadingSemesters] = useState(false);
    const [loadingSubjects, setLoadingSubjects] = useState(false);

    const [courseSearch, setCourseSearch] = useState('');

    const filteredCourses = useMemo(() => {
        if (!courseSearch.trim()) return courses;
        const q = courseSearch.toLowerCase();
        return courses.filter(c => c.name.toLowerCase().includes(q));
    }, [courses, courseSearch]);

    const resolvedSubjectName = selectedSubject
        ? selectedSubject.id === '__custom__'
            ? customSubject.trim()
            : selectedSubject.name
        : '';

    useEffect(() => {
        async function loadCourses() {
            try {
                const res = await apiFetch<Course[]>('/courses', { requiresAuth: false });
                if (res.success && res.data) {
                    setCourses(res.data.map(c => ({ id: c.id || c._id || '', name: c.name })));
                }
            } catch (e) {
                console.warn('Could not load courses');
            }
        }
        loadCourses();
    }, []);

    const handleSelectCourse = async (course: PickerOption) => {
        setSelectedCourse(course);
        setSelectedSemester(null);
        setSelectedSubject(null);
        setShowCustomSubjectInput(false);
        setSemesters([]);
        setSubjects([]);
        setShowCoursePicker(false);
        setStep(1);
        setLoadingSemesters(true);
        try {
            const res = await apiFetch<Array<{ id: string; number: number }>>(`/courses/${course.id}/semesters`, { requiresAuth: false });
            if (res.success && res.data) {
                setSemesters(res.data.map(s => ({ id: s.id, name: `Semester ${s.number}`, subtitle: `${s.number}th Semester` })));
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
        setShowSemesterPicker(false);
        setStep(2);
        setLoadingSubjects(true);
        try {
            const res = await apiFetch<Array<{ id: string; name: string; noteCount: number }>>(`/courses/semester/${semester.id}/subjects`, { requiresAuth: false });
            if (res.success && res.data) {
                setSubjects([
                    ...res.data.map(s => ({ id: s.id, name: s.name, subtitle: `${s.noteCount} notes` })),
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
            setShowSubjectPicker(false);
            setShowCustomSubjectInput(true);
        } else {
            setSelectedSubject(subject);
            setShowCustomSubjectInput(false);
            setShowSubjectPicker(false);
            setStep(3);
        }
    };

    const proceedFromCustomSubject = () => {
        if (!customSubject.trim()) {
            showToast('Please enter a subject name.', 'error');
            return;
        }
        setStep(3);
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        } else {
            router.back();
        }
    };

    const handleSubmit = async () => {
        const trimmedTitle = title.trim();
        const trimmedDesc = description.trim();
        const trimmedUnit = unit.trim();
        const trimmedTags = tags.split(',').map(t => t.trim()).filter(Boolean);

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
                const uploaded = await uploadFileToServer(fileForNote.uri, fileForNote.name);
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
                semester: selectedSemester ? parseInt(selectedSemester.name.replace('Semester ', '')) : undefined,
                subject: resolvedSubjectName,
                subjectId: selectedSubject?.id === '__custom__' ? undefined : selectedSubject?.id,
                unit: trimmedUnit || undefined,
                tags: trimmedTags,
                pdfUrl: fileForNote?.uploadedUrl || fileForNote?.viewUrl || fileForNote?.shareUrl || undefined,
                noteType: fileForNote ? 'pdf' : 'text',
                uploadedBy: user ? { id: user.id || '', name: user.name, course: user.course } : undefined,
                uploaderName: user?.name,
                uploaderCollege: (user as any)?.college || '',
                uploaderAvatar: (user as any)?.avatar || '',
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
                semester: selectedSemester ? parseInt(selectedSemester.name.replace('Semester ', '')) : undefined,
                subject: resolvedSubjectName,
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

    const renderStepIndicator = () => (
        <View style={[styles.stepIndicator]}>
            {UPLOAD_STEPS.map((label, i) => (
                <React.Fragment key={label}>
                    <TouchableOpacity onPress={() => i <= step && setStep(i)} disabled={i > step} style={styles.stepItem}>
                        <View style={[styles.stepDot, i === step ? styles.stepDotActive : i < step ? styles.stepDotDone : styles.stepDotInactive]}>
                            {i < step ? (
                                <Ionicons name="checkmark" size={14} color="#fff" />
                            ) : (
                                <Text style={[styles.stepDotText, i === step && styles.stepDotTextActive]}>{i + 1}</Text>
                            )}
                        </View>
                        <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{label}</Text>
                    </TouchableOpacity>
                    {i < UPLOAD_STEPS.length - 1 && (
                        <Ionicons name="chevron-forward" size={14} color={i < step ? colors.accent : colors.border} style={styles.stepArrow} />
                    )}
                </React.Fragment>
            ))}
        </View>
    );

    const renderStepContent = () => {
        switch (step) {
            case 0:
                return (
                    <View>
                        <LinearGradient colors={['#7C3AED', '#6D28D9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
                            <View style={styles.heroIconWrap}>
                                <Ionicons name="cloud-upload-outline" size={28} color={colors.textOnPrimary} />
                            </View>
                            <Text style={styles.heroTitle}>Share your notes</Text>
                            <Text style={styles.heroSubtitle}>Upload notes and help thousands of students learn better.</Text>
                        </LinearGradient>

                        <View style={styles.formCard}>
                            <Text style={styles.formHeading}>Choose Your Course</Text>
                            <View style={styles.searchWrap}>
                                <Ionicons name="search" size={18} color={colors.textLight} style={styles.searchIcon} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search courses..."
                                    placeholderTextColor={colors.textLight}
                                    value={courseSearch}
                                    onChangeText={setCourseSearch}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                {courseSearch.length > 0 && (
                                    <TouchableOpacity onPress={() => setCourseSearch('')} hitSlop={8}>
                                        <Ionicons name="close-circle" size={18} color={colors.textLight} />
                                    </TouchableOpacity>
                                )}
                            </View>
                            {courses.length === 0 ? (
                                <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 40 }} />
                            ) : (
                                filteredCourses.map((course) => (
                                    <TouchableOpacity
                                        key={course.id}
                                        style={[styles.selectCard, selectedCourse?.id === course.id && styles.selectCardActive]}
                                        onPress={() => handleSelectCourse(course)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="school-outline" size={24} color={colors.primary} />
                                        <View style={styles.selectCardInfo}>
                                            <Text style={styles.selectCardName}>{course.name}</Text>
                                        </View>
                                        {selectedCourse?.id === course.id && (
                                            <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
                                        )}
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                    </View>
                );
            case 1:
                return (
                    <View>
                        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
                            <Text style={styles.backBtnText}>{selectedCourse?.name || 'Back'}</Text>
                        </TouchableOpacity>
                        <View style={styles.formCard}>
                            <Text style={styles.formHeading}>Select Semester</Text>
                            {loadingSemesters ? (
                                <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 40 }} />
                            ) : semesters.length === 0 ? (
                                <Text style={{ color: colors.textSecondary, textAlign: 'center', marginVertical: 20 }}>No semesters available.</Text>
                            ) : (
                                semesters.map((sem) => (
                                    <TouchableOpacity
                                        key={sem.id}
                                        style={[styles.selectCard, selectedSemester?.id === sem.id && styles.selectCardActive]}
                                        onPress={() => handleSelectSemester(sem)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="layers-outline" size={24} color={colors.primary} />
                                        <View style={styles.selectCardInfo}>
                                            <Text style={styles.selectCardName}>{sem.name}</Text>
                                        </View>
                                        {selectedSemester?.id === sem.id && (
                                            <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
                                        )}
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                    </View>
                );
            case 2:
                return (
                    <View>
                        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
                            <Text style={styles.backBtnText}>{selectedSemester?.name || 'Back'}</Text>
                        </TouchableOpacity>
                        <View style={styles.formCard}>
                            <Text style={styles.formHeading}>Select Subject</Text>
                            {loadingSubjects ? (
                                <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 40 }} />
                            ) : showCustomSubjectInput ? (
                                <View>
                                    <Text style={styles.label}>Enter Subject Name</Text>
                                    <TextInput
                                        value={customSubject}
                                        onChangeText={setCustomSubject}
                                        placeholder="e.g. Advanced Graph Theory"
                                        placeholderTextColor={colors.textLight}
                                        style={styles.input}
                                        autoFocus
                                    />
                                    <Text style={styles.customSubjectHint}>
                                        This will be marked as "Pending Review" until an admin approves it.
                                    </Text>
                                    <View style={styles.stepActions}>
                                        <TouchableOpacity style={styles.secondaryBtn} onPress={() => { setShowCustomSubjectInput(false); setSelectedSubject(null); }}>
                                            <Text style={styles.secondaryBtnText}>Pick from list</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.primaryBtn} onPress={proceedFromCustomSubject}>
                                            <Text style={styles.primaryBtnText}>Continue</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                subjects.map((subj) => (
                                    <TouchableOpacity
                                        key={subj.id}
                                        style={[styles.selectCard, selectedSubject?.id === subj.id && styles.selectCardActive]}
                                        onPress={() => handleSelectSubject(subj)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="book-outline" size={24} color={colors.primary} />
                                        <View style={styles.selectCardInfo}>
                                            <Text style={styles.selectCardName}>{subj.name}</Text>
                                            {subj.subtitle ? <Text style={styles.selectCardSub}>{subj.subtitle}</Text> : null}
                                        </View>
                                        {subj.id === '__custom__' ? (
                                            <Ionicons name="add-circle-outline" size={22} color={colors.textLight} />
                                        ) : selectedSubject?.id === subj.id ? (
                                            <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
                                        ) : null}
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                    </View>
                );
            case 3:
                return (
                    <View>
                        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
                            <Text style={styles.backBtnText}>Subject Selection</Text>
                        </TouchableOpacity>

                        <View style={styles.selectionSummary}>
                            <Text style={styles.summaryLabel}>Course</Text>
                            <Text style={styles.summaryValue}>{selectedCourse?.name}</Text>
                            <Text style={styles.summaryLabel}>Semester</Text>
                            <Text style={styles.summaryValue}>{selectedSemester?.name}</Text>
                            <Text style={styles.summaryLabel}>Subject</Text>
                            <Text style={styles.summaryValue}>{resolvedSubjectName}</Text>
                        </View>

                        <View style={styles.formCard}>
                            <Text style={styles.formHeading}>Note Details</Text>

                            <Text style={styles.label}>Title *</Text>
                            <TextInput value={title} onChangeText={setTitle} placeholder="e.g. Graph Algorithms Notes" placeholderTextColor={colors.textLight} style={styles.input} />

                            <Text style={styles.label}>Unit / Module</Text>
                            <TextInput value={unit} onChangeText={setUnit} placeholder="e.g. Unit 3" placeholderTextColor={colors.textLight} style={styles.input} />

                            <Text style={styles.label}>Tags (comma separated)</Text>
                            <TextInput value={tags} onChangeText={setTags} placeholder="e.g. graphs, BFS, DFS, algorithms" placeholderTextColor={colors.textLight} style={styles.input} />

                            <Text style={styles.label}>Description</Text>
                            <TextInput value={description} onChangeText={setDescription} placeholder="Brief description..." placeholderTextColor={colors.textLight} multiline textAlignVertical="top" style={[styles.input, styles.textArea]} />

                            <View style={styles.divider} />

                            <Text style={styles.formHeading}>File</Text>

                            {pickedFile ? (
                                <View style={styles.selectedFileCard}>
                                    <View style={styles.selectedFileIcon}>
                                        <Ionicons name="document-text" size={22} color={colors.primary} />
                                    </View>
                                    <View style={styles.selectedFileInfo}>
                                        <Text style={styles.selectedFileName} numberOfLines={2}>{pickedFile.name}</Text>
                                        <Text style={styles.selectedFileMeta}>Ready to upload</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => setPickedFile(null)} hitSlop={8}>
                                        <Ionicons name="close-circle" size={22} color={colors.textLight} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity style={styles.fileButton} onPress={() => setPickerVisible(true)} activeOpacity={0.85}>
                                    <Ionicons name="document-attach-outline" size={22} color={colors.primary} />
                                    <Text style={styles.fileButtonText}>Choose PDF File</Text>
                                </TouchableOpacity>
                            )}

                            {pickedFile ? (
                                <TouchableOpacity style={styles.changeFileBtn} onPress={() => setPickerVisible(true)}>
                                    <Text style={styles.changeFileText}>Choose a different file</Text>
                                </TouchableOpacity>
                            ) : null}

                            <View style={styles.divider} />

                            {isSaving && (
                                <View style={styles.progressContainer}>
                                    <View style={styles.progressBar}>
                                        <View style={[styles.progressFill, { width: isUploadingFile ? '60%' : '90%' }]} />
                                    </View>
                                    <Text style={styles.progressText}>{isUploadingFile ? 'Uploading file...' : 'Publishing your note...'}</Text>
                                </View>
                            )}

                            <TouchableOpacity style={[styles.submitButton, isSaving && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={isSaving} activeOpacity={0.9}>
                                {isSaving ? (
                                    <ActivityIndicator size="small" color={colors.textOnPrimary} />
                                ) : (
                                    <Ionicons name="checkmark-circle-outline" size={22} color={colors.textOnPrimary} />
                                )}
                                <Text style={styles.submitButtonText}>
                                    {isSaving ? (isUploadingFile ? 'Uploading...' : 'Publishing...') : 'Publish to Community'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <GradientBackground>
            <Stack.Screen
                options={{
                    title: 'Upload Notes',
                    headerShown: true,
                    headerStyle: { backgroundColor: colors.gradientStart },
                    headerShadowVisible: false,
                    headerTintColor: colors.textPrimary,
                }}
            />

            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={[styles.headerSpacer, { height: insets.top + spacing.sm }]} />
                    {renderStepIndicator()}
                    {renderStepContent()}
                </ScrollView>
            </KeyboardAvoidingView>

            <PickerModal
                visible={showCoursePicker}
                title="Select Course"
                options={courses}
                onSelect={handleSelectCourse}
                onClose={() => setShowCoursePicker(false)}
            />

            <PickerModal
                visible={showSemesterPicker}
                title="Select Semester"
                options={semesters}
                onSelect={handleSelectSemester}
                onClose={() => setShowSemesterPicker(false)}
                loading={loadingSemesters}
            />

            <PickerModal
                visible={showSubjectPicker}
                title="Select Subject"
                options={subjects}
                onSelect={(s) => { setSelectedSubject(s); setShowSubjectPicker(false); }}
                onClose={() => setShowSubjectPicker(false)}
                loading={loadingSubjects}
            />

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
            />
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    content: { padding: spacing.screenPadding, paddingBottom: spacing.xxl },
    heroCard: {
        borderRadius: 24, padding: spacing.lg, marginBottom: spacing.lg, overflow: 'hidden',
    },
    heroIconWrap: {
        width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md,
    },
    heroTitle: {
        fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold,
        color: colors.textOnPrimary, marginBottom: spacing.xs, letterSpacing: -0.5,
    },
    heroSubtitle: {
        fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.88)', lineHeight: 22,
    },
    formCard: {
        backgroundColor: colors.cardBackground, borderRadius: 24, padding: spacing.lg,
        borderWidth: 1, borderColor: colors.border,
    },
    formHeading: {
        fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary, marginBottom: spacing.md,
    },
    label: {
        fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold,
        color: colors.textSecondary, marginBottom: spacing.sm, marginTop: spacing.md,
    },
    input: {
        backgroundColor: colors.background, borderRadius: 14, borderWidth: 1,
        borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: 14,
        color: colors.textPrimary, fontSize: typography.fontSize.md,
    },
    textArea: { minHeight: 100 },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
    pickerButton: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background,
        borderRadius: 14, borderWidth: 1, borderColor: colors.border,
        paddingHorizontal: spacing.md, paddingVertical: 14, gap: spacing.sm,
    },
    pickerDisabled: { opacity: 0.5 },
    pickerText: { flex: 1, fontSize: typography.fontSize.md, color: colors.textPrimary },
    pickerPlaceholder: { color: colors.textLight },
    fileButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
        backgroundColor: 'rgba(124, 58, 237, 0.12)', borderRadius: 14, paddingVertical: 18,
        borderWidth: 1.5, borderColor: 'rgba(124, 58, 237, 0.35)', borderStyle: 'dashed',
    },
    fileButtonText: { color: '#7C3AED', fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold },
    selectedFileCard: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.md,
        backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: 14, padding: spacing.md,
        borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.3)',
    },
    selectedFileIcon: {
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: 'rgba(124, 58, 237, 0.15)', justifyContent: 'center', alignItems: 'center',
    },
    selectedFileInfo: { flex: 1 },
    selectedFileName: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary },
    selectedFileMeta: { fontSize: typography.fontSize.xs, color: colors.accent, marginTop: 2, fontWeight: typography.fontWeight.medium },
    changeFileBtn: { marginTop: spacing.sm, alignItems: 'center', paddingVertical: spacing.sm },
    changeFileText: { color: colors.primary, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium },
    submitButton: {
        marginTop: spacing.lg, backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
        shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3,
        shadowRadius: 12, elevation: 4, minHeight: 56,
    },
    submitButtonDisabled: { opacity: 0.7 },
    submitButtonText: { color: colors.textOnPrimary, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold },
    headerSpacer: { width: '100%' },
    searchWrap: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background,
        borderRadius: 14, borderWidth: 1, borderColor: colors.border,
        paddingHorizontal: spacing.md, marginBottom: spacing.md, marginTop: spacing.sm,
    },
    searchIcon: { marginRight: spacing.sm },
    searchInput: {
        flex: 1, paddingVertical: 12, fontSize: typography.fontSize.md,
        color: colors.textPrimary,
    },
    progressContainer: {
        marginTop: spacing.lg, backgroundColor: 'rgba(79, 70, 229, 0.08)',
        borderRadius: 14, padding: spacing.md,
    },
    progressBar: { height: 6, borderRadius: 3, backgroundColor: colors.background, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 3, backgroundColor: colors.primary },
    progressText: { fontSize: typography.fontSize.xs, color: colors.primary, marginTop: spacing.sm, fontWeight: typography.fontWeight.medium },
    stepIndicator: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        marginBottom: spacing.lg, gap: 0,
    },
    stepItem: { alignItems: 'center', marginHorizontal: spacing.xs },
    stepArrow: { marginHorizontal: 2 },
    stepDot: {
        width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center',
        marginBottom: 4,
    },
    stepDotActive: { backgroundColor: colors.primary },
    stepDotDone: { backgroundColor: colors.accent },
    stepDotInactive: { backgroundColor: colors.border },
    stepDotText: { fontSize: 13, fontWeight: typography.fontWeight.bold, color: colors.textLight },
    stepDotTextActive: { color: colors.textOnPrimary },
    stepLabel: { fontSize: 11, color: colors.textLight, textAlign: 'center' },
    stepLabelActive: { color: colors.primary, fontWeight: typography.fontWeight.semibold },
    backBtn: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
        marginBottom: spacing.md, paddingVertical: spacing.sm,
    },
    backBtnText: { fontSize: typography.fontSize.md, color: colors.primary, fontWeight: typography.fontWeight.semibold },
    selectCard: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.md,
        backgroundColor: colors.background, borderRadius: 14, padding: spacing.md,
        marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border,
    },
    selectCardActive: { borderColor: colors.primary, backgroundColor: 'rgba(124, 58, 237, 0.08)' },
    selectCardInfo: { flex: 1 },
    selectCardName: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary },
    selectCardSub: { fontSize: typography.fontSize.xs, color: colors.textSecondary, marginTop: 2 },
    customSubjectHint: {
        fontSize: typography.fontSize.xs, color: colors.textSecondary, fontStyle: 'italic',
        marginTop: spacing.sm, lineHeight: 18,
    },
    stepActions: {
        flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg, gap: spacing.md,
    },
    primaryBtn: {
        flex: 1, backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14,
        alignItems: 'center',
    },
    primaryBtnText: { color: colors.textOnPrimary, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold },
    secondaryBtn: {
        flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center',
        borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background,
    },
    secondaryBtnText: { color: colors.textPrimary, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold },
    selectionSummary: {
        backgroundColor: 'rgba(124, 58, 237, 0.08)', borderRadius: 14, padding: spacing.md,
        marginBottom: spacing.md, borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.2)',
    },
    summaryLabel: { fontSize: typography.fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs },
    summaryValue: { fontSize: typography.fontSize.md, color: colors.textPrimary, fontWeight: typography.fontWeight.semibold, marginBottom: spacing.sm },
});
