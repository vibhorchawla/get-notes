import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from './useApi';
import { Semester, Subject, Note } from '../types/note';

export function useSemesters(courseId: string) {
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const cancelledRef = useRef(false);

    const fetchSemesters = useCallback(async () => {
        if (!courseId) return;
        if (cancelledRef.current) return;
        setIsLoading(true);
        try {
            const res = await apiFetch<Semester[]>(`/courses/${courseId}/semesters`, { requiresAuth: false });
            if (cancelledRef.current) return;
            if (res.success && res.data) {
                setSemesters(res.data);
            }
        } catch (e) {
            if (cancelledRef.current) return;
            console.error('useSemesters error:', e);
        } finally {
            if (!cancelledRef.current) setIsLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        cancelledRef.current = false;
        fetchSemesters();
        return () => { cancelledRef.current = true; };
    }, [fetchSemesters]);

    return { semesters, isLoading, refetch: fetchSemesters };
}

export function useSubjects(semesterId: string) {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const cancelledRef = useRef(false);

    const fetchSubjects = useCallback(async () => {
        if (!semesterId) return;
        if (cancelledRef.current) return;
        setIsLoading(true);
        try {
            const res = await apiFetch<Subject[]>(`/courses/semester/${semesterId}/subjects`, { requiresAuth: false });
            if (cancelledRef.current) return;
            if (res.success && res.data) {
                setSubjects(res.data);
            }
        } catch (e) {
            if (cancelledRef.current) return;
            console.error('useSubjects error:', e);
        } finally {
            if (!cancelledRef.current) setIsLoading(false);
        }
    }, [semesterId]);

    useEffect(() => {
        cancelledRef.current = false;
        fetchSubjects();
        return () => { cancelledRef.current = true; };
    }, [fetchSubjects]);

    return { subjects, isLoading, refetch: fetchSubjects };
}

export function useSubjectNotes(subjectId: string, sort: string = 'newest') {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!subjectId) return;
        let cancelled = false;
        async function fetchNotes() {
            setIsLoading(true);
            try {
                const res = await apiFetch<Note[]>(
                    `/courses/subject/${subjectId}/notes?sort=${sort}`,
                    { requiresAuth: false }
                );
                if (cancelled) return;
                if (res.success && res.data) {
                    setNotes(res.data);
                }
            } catch (e) {
                if (cancelled) return;
                console.error('useSubjectNotes error:', e);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }
        fetchNotes();
        return () => { cancelled = true; };
    }, [subjectId, sort]);

    return { notes, isLoading };
}
