import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from './useApi';
import { Course } from '../types/note';

const FALLBACK_COURSES: Course[] = [
    { id: 'btech-cse', name: 'B.Tech CSE', icon: 'laptop-outline', category: 'B.Tech' },
    { id: 'btech-me', name: 'B.Tech ME', icon: 'construct-outline', category: 'B.Tech' },
    { id: 'btech-ee', name: 'B.Tech EE', icon: 'flash-outline', category: 'B.Tech' },
    { id: 'bca', name: 'BCA', icon: 'school-outline', category: 'BCA' },
    { id: 'mca', name: 'MCA', icon: 'document-text-outline', category: 'MCA' },
    { id: 'diploma', name: 'Polytechnic Diploma', icon: 'settings-outline', category: 'Diploma' },
];

const FALLBACK_CATEGORIES = ['All', 'B.Tech', 'BCA', 'MCA', 'Diploma', 'Arts', 'Science'];

export function useCourses() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [featured, setFeatured] = useState<any[]>([]);
    const [categories, setCategories] = useState<string[]>(['All']);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const cancelledRef = useRef(false);

    const fetchAll = useCallback(async () => {
        if (cancelledRef.current) return;
        setIsLoading(true);
        setError(null);
        try {
            const [coursesRes, featuredRes, categoriesRes] = await Promise.all([
                apiFetch<Course[]>('/courses', { requiresAuth: false }),
                apiFetch<any>('/courses/featured', { requiresAuth: false }),
                apiFetch<string[]>('/courses/categories', { requiresAuth: false }),
            ]);

            if (cancelledRef.current) return;

            if (coursesRes.success && coursesRes.data && coursesRes.data.length > 0) {
                setCourses(coursesRes.data);
            } else {
                setCourses(FALLBACK_COURSES);
            }
            if (cancelledRef.current) return;

            if (featuredRes.success && featuredRes.data) {
                setFeatured(featuredRes.data.notes || []);
            } else {
                setFeatured([]);
            }
            if (cancelledRef.current) return;

            if (categoriesRes.success && categoriesRes.data && categoriesRes.data.length > 0) {
                const uniqueCats = Array.from(new Set(['All', ...categoriesRes.data]));
                setCategories(uniqueCats as string[]);
            } else {
                setCategories(FALLBACK_CATEGORIES);
            }
        } catch (e) {
            if (cancelledRef.current) return;
            console.warn('useCourses: API unavailable, using fallback data');
            setCourses(FALLBACK_COURSES);
            setCategories(FALLBACK_CATEGORIES);
        } finally {
            if (!cancelledRef.current) setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        cancelledRef.current = false;
        fetchAll();
        return () => { cancelledRef.current = true; };
    }, [fetchAll]);

    return { courses, featured, categories, isLoading, error, refetch: fetchAll };
}
