import { useState, useEffect } from 'react';
import { apiFetch } from './useApi';

interface Course {
    id: string;
    title: string;
    category: string;
    rating: number;
    students: string;
    instructor: string;
    icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
    featured: boolean;
}

export function useCourses() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [featured, setFeatured] = useState<Course[]>([]);
    const [categories, setCategories] = useState<string[]>(['All']);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAll() {
            setIsLoading(true);
            setError(null);
            try {
                const [coursesRes, featuredRes, categoriesRes] = await Promise.all([
                    apiFetch<Course[]>('/courses', { requiresAuth: false }),
                    apiFetch<Course[]>('/courses/featured', { requiresAuth: false }),
                    apiFetch<string[]>('/courses/categories', { requiresAuth: false }),
                ]);
                if (coursesRes.success && coursesRes.data) setCourses(coursesRes.data);
                if (featuredRes.success && featuredRes.data) setFeatured(featuredRes.data);
                if (categoriesRes.success && categoriesRes.data) setCategories(categoriesRes.data);
            } catch (e) {
                setError('Failed to load courses');
                console.error('useCourses error:', e);
            } finally {
                setIsLoading(false);
            }
        }
        fetchAll();
    }, []);

    return { courses, featured, categories, isLoading, error };
}
