import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../context/AuthContext';

const PROFILE_PHOTO_KEY = 'profile_photo_uri';

interface ProfilePhotoContextType {
    photoUri: string | null;
    isLoading: boolean;
    savePhoto: (uri: string) => Promise<void>;
    removePhoto: () => Promise<void>;
}

const ProfilePhotoContext = createContext<ProfilePhotoContextType | undefined>(undefined);

export function ProfilePhotoProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadPhoto = useCallback(async () => {
        try {
            const uri = await SecureStore.getItemAsync(PROFILE_PHOTO_KEY);
            setPhotoUri(uri);
        } catch (error) {
            console.error('[ProfilePhoto] Failed to load photo:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!user) {
            setPhotoUri(null);
            setIsLoading(false);
            SecureStore.deleteItemAsync(PROFILE_PHOTO_KEY).catch(() => {});
            return;
        }
        setIsLoading(true);
        loadPhoto();
    }, [user?.email, loadPhoto]);

    const savePhoto = useCallback(async (uri: string) => {
        await SecureStore.setItemAsync(PROFILE_PHOTO_KEY, uri);
        setPhotoUri(uri);
    }, []);

    const removePhoto = useCallback(async () => {
        await SecureStore.deleteItemAsync(PROFILE_PHOTO_KEY);
        setPhotoUri(null);
    }, []);

    return (
        <ProfilePhotoContext.Provider value={{ photoUri, isLoading, savePhoto, removePhoto }}>
            {children}
        </ProfilePhotoContext.Provider>
    );
}

export function useProfilePhoto() {
    const context = useContext(ProfilePhotoContext);
    if (context === undefined) {
        throw new Error('useProfilePhoto must be used within a ProfilePhotoProvider');
    }
    return context;
}
