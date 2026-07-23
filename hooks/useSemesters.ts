import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from './useApi';
import { Semester, Subject, Note } from '../types/note';

export function useSemesters(courseId: string) {
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSemesters = useCallback(async () => {
        if (!courseId) return;
        setIsLoading(true);
        try {
            const res = await apiFetch<Semester[]>(`/courses/${courseId}/semesters`, { requiresAuth: false });
            if (res.success && res.data) {
                setSemesters(res.data);
            }
        } catch (e) {
            console.error('useSemesters error:', e);
        } finally {
            setIsLoading(false);
        }
    }, [courseId]);

    useEffect(() => { fetchSemesters(); }, [fetchSemesters]);

    return { semesters, isLoading, refetch: fetchSemesters };
}

export function useSubjects(semesterId: string) {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSubjects = useCallback(async () => {
        if (!semesterId) return;
        setIsLoading(true);
        try {
            const res = await apiFetch<Subject[]>(`/courses/semester/${semesterId}/subjects`, { requiresAuth: false });
            if (res.success && res.data) {
                setSubjects(res.data);
            }
        } catch (e) {
            console.error('useSubjects error:', e);
        } finally {
            setIsLoading(false);
        }
    }, [semesterId]);

    useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

    return { subjects, isLoading, refetch: fetchSubjects };
}

export function useSubjectNotes(subjectId: string, sort: string = 'newest') {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!subjectId) return;
        async function fetchNotes() {
            setIsLoading(true);
            try {
                const res = await apiFetch<Note[]>(
                    `/courses/subject/${subjectId}/notes?sort=${sort}`,
                    { requiresAuth: false }
                );
                if (res.success && res.data) {
                    setNotes(res.data);
                }
            } catch (e) {
                console.error('useSubjectNotes error:', e);
            } finally {
                setIsLoading(false);
            }
        }
        fetchNotes();
    }, [subjectId, sort]);

    return { notes, isLoading };
}
