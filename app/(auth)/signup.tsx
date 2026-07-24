import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useGoogleAuth, useFacebookAuth } from '../../hooks/useSocialAuth';
import { isGoogleConfigured, isFacebookConfigured } from '../../constants/oauth';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

export default function SignupScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [course, setCourse] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { signup } = useAuth();
    const { signInWithGoogle, isLoading: googleLoading } = useGoogleAuth();
    const { signInWithFacebook, isLoading: facebookLoading } = useFacebookAuth();
    const router = useRouter();

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSignup = async () => {
        if (!name || !email || !password || !confirmPassword || !course) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await signup(email, password, name, course);
            router.replace('/home');
        } catch (error: any) {
            Alert.alert('Signup Failed', error?.message || 'Signup failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.root}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View>
                        <Text style={styles.heading}>Create your{'\n'}account</Text>
                    </View>

                    <View style={styles.form}>
                        <Text style={styles.label}>Your full name</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="John Doe"
                                placeholderTextColor="rgba(255,255,255,0.25)"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                        </View>

                        <Text style={styles.label}>Your number & email address</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="uixshamim68@gmail.com"
                                placeholderTextColor="rgba(255,255,255,0.25)"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                            />
                        </View>

                        <Text style={styles.label}>Enter your password</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••••••"
                                placeholderTextColor="rgba(255,255,255,0.25)"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                style={styles.eyeBtn}
                                onPress={() => setShowPassword(!showPassword)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color="rgba(255,255,255,0.4)"
                                />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Confirm your password</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••••••"
                                placeholderTextColor="rgba(255,255,255,0.25)"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                style={styles.eyeBtn}
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color="rgba(255,255,255,0.4)"
                                />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Course</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., B.Tech CSE"
                                placeholderTextColor="rgba(255,255,255,0.25)"
                                value={course}
                                onChangeText={setCourse}
                                autoCapitalize="words"
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.rememberRow}
                            onPress={() => setRememberMe(!rememberMe)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                                {rememberMe && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                            </View>
                            <Text style={styles.rememberText}>Remember me</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
                            onPress={handleSignup}
                            disabled={isLoading}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.signupButtonText}>
                                {isLoading ? 'Creating Account...' : 'Sign Up'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.orRow}>
                            <View style={styles.orLine} />
                            <Text style={styles.orText}>Or</Text>
                            <View style={styles.orLine} />
                        </View>

                        {isGoogleConfigured() ? (
                            <TouchableOpacity
                                style={[styles.socialButton, googleLoading && styles.signupButtonDisabled]}
                                onPress={signInWithGoogle}
                                disabled={googleLoading}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="logo-google" size={20} color="#FFFFFF" />
                                <Text style={styles.socialButtonText}>
                                    {googleLoading ? 'Connecting...' : 'Sign up with Google'}
                                </Text>
                            </TouchableOpacity>
                        ) : null}

                        {isFacebookConfigured() ? (
                            <TouchableOpacity
                                style={[styles.socialButton, facebookLoading && styles.signupButtonDisabled]}
                                onPress={signInWithFacebook}
                                disabled={facebookLoading}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="logo-facebook" size={20} color="#FFFFFF" />
                                <Text style={styles.socialButtonText}>
                                    {facebookLoading ? 'Connecting...' : 'Sign up with Facebook'}
                                </Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={styles.footerLink}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#1A1A2E',
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.screenPadding,
        paddingTop: spacing.xxl + spacing.lg,
        paddingBottom: spacing.xl,
    },
    heading: {
        fontSize: typography.fontSize.xxl + 4,
        fontWeight: typography.fontWeight.bold,
        color: '#FFFFFF',
        lineHeight: 38,
        marginBottom: spacing.xl,
    },
    form: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.5)',
        marginBottom: spacing.sm,
    },
    inputContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        marginBottom: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        paddingHorizontal: spacing.md,
        paddingVertical: 16,
        fontSize: typography.fontSize.md,
        color: '#FFFFFF',
    },
    eyeBtn: {
        paddingHorizontal: spacing.md,
    },
    rememberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        backgroundColor: '#7C3AED',
        borderColor: '#7C3AED',
    },
    rememberText: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    signupButton: {
        backgroundColor: '#7C3AED',
        borderRadius: 14,
        paddingVertical: 17,
        alignItems: 'center',
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    signupButtonDisabled: {
        opacity: 0.6,
    },
    signupButtonText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        color: '#FFFFFF',
    },
    orRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.lg,
        gap: spacing.md,
    },
    orLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    orText: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.35)',
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        paddingVertical: 15,
        marginBottom: spacing.md,
    },
    socialButtonText: {
        fontSize: typography.fontSize.md,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: typography.fontWeight.medium,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.4)',
    },
    footerLink: {
        fontSize: typography.fontSize.sm,
        color: '#7C3AED',
        fontWeight: typography.fontWeight.semibold,
    },
});
