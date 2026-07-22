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
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const { signInWithGoogle, isLoading: googleLoading } = useGoogleAuth();
    const { signInWithFacebook, isLoading: facebookLoading } = useFacebookAuth();
    const router = useRouter();

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleLogin = async () => {
        if (!email || !password) {
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

        setIsLoading(true);
        const success = await login(email, password);
        setIsLoading(false);

        if (success) {
            router.replace('/home');
        } else {
            Alert.alert('Error', 'Login failed. Please try again.');
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
                        <Text style={styles.heading}>Login to your{'\n'}account</Text>
                    </View>

                    <View style={styles.form}>
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

                        <View style={styles.optionsRow}>
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
                            <TouchableOpacity activeOpacity={0.7}>
                                <Text style={styles.forgotText}>Forget password</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            disabled={isLoading}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.loginButtonText}>
                                {isLoading ? 'Logging in...' : 'Log in'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.orRow}>
                            <View style={styles.orLine} />
                            <Text style={styles.orText}>Or</Text>
                            <View style={styles.orLine} />
                        </View>

                        <TouchableOpacity
                            style={[styles.socialButton, googleLoading && styles.loginButtonDisabled]}
                            onPress={signInWithGoogle}
                            disabled={googleLoading}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="logo-google" size={20} color="#FFFFFF" />
                            <Text style={styles.socialButtonText}>
                                {googleLoading ? 'Connecting...' : 'Login with Google'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.socialButton, facebookLoading && styles.loginButtonDisabled]}
                            onPress={signInWithFacebook}
                            disabled={facebookLoading}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="logo-facebook" size={20} color="#FFFFFF" />
                            <Text style={styles.socialButtonText}>
                                {facebookLoading ? 'Connecting...' : 'Login with Facebook'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/signup')}>
                            <Text style={styles.footerLink}>Create an account</Text>
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
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    rememberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
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
    forgotText: {
        fontSize: typography.fontSize.sm,
        color: '#7C3AED',
        fontWeight: typography.fontWeight.medium,
    },
    loginButton: {
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
    loginButtonDisabled: {
        opacity: 0.6,
    },
    loginButtonText: {
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
