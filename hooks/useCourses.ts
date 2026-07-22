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

const FALLBACK_COURSES: Course[] = [
    { id: 'btech-cse', title: 'B.Tech CSE', category: 'B.Tech', rating: 4.5, students: '4.2k', instructor: 'Tech Faculty', icon: 'laptop-outline', featured: false },
    { id: 'btech-me', title: 'B.Tech ME', category: 'B.Tech', rating: 4.2, students: '2.1k', instructor: 'Mechanical Dept', icon: 'construct-outline', featured: false },
    { id: 'btech-ee', title: 'B.Tech EE', category: 'B.Tech', rating: 4.3, students: '1.8k', instructor: 'Electrical Dept', icon: 'flash-outline', featured: false },
    { id: 'bca', title: 'BCA', category: 'BCA', rating: 4.4, students: '3.5k', instructor: 'BCA Faculty', icon: 'school-outline', featured: false },
    { id: 'mca', title: 'MCA', category: 'MCA', rating: 4.7, students: '1.2k', instructor: 'Post-Grad Faculty', icon: 'document-text-outline', featured: false },
    { id: 'diploma', title: 'Polytechnic Diploma', category: 'Diploma', rating: 4.0, students: '5.2k', instructor: 'Diploma Board', icon: 'settings-outline', featured: false },
];

const FALLBACK_FEATURED: Course[] = [
    { id: 'btech-cse', title: 'Advanced Data Structures & Algorithms', category: 'B.Tech CSE', rating: 4.8, students: '1.2k', instructor: 'Dr. Sarah Wilson', icon: 'laptop-outline', featured: true },
    { id: 'bca-web', title: 'Full Stack Web Development 2026', category: 'BCA', rating: 4.6, students: '850', instructor: 'John Doe', icon: 'code-slash-outline', featured: true },
];

const FALLBACK_CATEGORIES = ['All', 'B.Tech', 'BCA', 'MCA', 'Diploma', 'Arts', 'Science'];

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

                if (coursesRes.success && coursesRes.data && coursesRes.data.length > 0) {
                    setCourses(coursesRes.data);
                } else {
                    setCourses(FALLBACK_COURSES);
                }

                if (featuredRes.success && featuredRes.data && featuredRes.data.length > 0) {
                    setFeatured(featuredRes.data);
                } else {
                    setFeatured(FALLBACK_FEATURED);
                }
                
                if (categoriesRes.success && categoriesRes.data && categoriesRes.data.length > 0) {
                    const uniqueCats = Array.from(new Set(['All', ...categoriesRes.data]));
                    setCategories(uniqueCats);
                } else {
                    setCategories(FALLBACK_CATEGORIES);
                }
            } catch (e) {
                console.warn('useCourses: API unavailable, using fallback data');
                setCourses(FALLBACK_COURSES);
                setFeatured(FALLBACK_FEATURED);
                setCategories(FALLBACK_CATEGORIES);
            } finally {
                setIsLoading(false);
            }
        }
        fetchAll();
    }, []);

    return { courses, featured, categories, isLoading, error };
}
