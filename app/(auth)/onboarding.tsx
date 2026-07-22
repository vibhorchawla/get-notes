import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function OnboardingScreen() {
    const router = useRouter();

    return (
        <View style={styles.root}>
            <SafeAreaView style={styles.container}>
                <View style={styles.illustrationArea}>
                    <View style={styles.illustrationCard}>
                        {/* Laptop */}
                        <View style={styles.laptop}>
                            <View style={styles.laptopScreen}>
                                <View style={styles.laptopLine} />
                                <View style={[styles.laptopLine, { width: '60%' }]} />
                                <View style={[styles.laptopLine, { width: '80%' }]} />
                            </View>
                            <View style={styles.laptopBase} />
                        </View>

                        {/* Coffee cup */}
                        <View style={styles.coffeeCup}>
                            <View style={styles.cupBody} />
                            <View style={styles.cupHandle} />
                            <View style={styles.steam1} />
                            <View style={styles.steam2} />
                        </View>

                        {/* Notes / Papers */}
                        <View style={styles.paper1}>
                            <View style={styles.paperLine} />
                            <View style={[styles.paperLine, { width: '70%' }]} />
                            <View style={[styles.paperLine, { width: '50%' }]} />
                        </View>
                        <View style={styles.paper2}>
                            <View style={styles.paperLine} />
                            <View style={[styles.paperLine, { width: '60%' }]} />
                        </View>

                        {/* Pencil */}
                        <View style={styles.pencil}>
                            <View style={styles.pencilBody} />
                            <View style={styles.pencilTip} />
                        </View>

                        {/* Phone */}
                        <View style={styles.phone}>
                            <View style={styles.phoneScreen} />
                        </View>

                        {/* Sticky notes */}
                        <View style={styles.stickyNote1} />
                        <View style={styles.stickyNote2} />
                    </View>
                </View>

                <Animated.View entering={FadeInDown.delay(200).springify().damping(14)} style={styles.textArea}>
                    <Text style={styles.heading}>Taking notes has{'\n'}never been easier!</Text>
                    <Text style={styles.description}>
                        Spare yourself the hassle of making a dozen of notes on paper and losing them over and over.
                    </Text>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(400).springify().damping(14)} style={styles.buttonArea}>
                    <TouchableOpacity
                        style={styles.startButton}
                        onPress={() => router.push('/login')}
                        activeOpacity={0.85}
                    >
                        <View style={styles.startBtnRow}>
                            <Text style={styles.startButtonText}>Start</Text>
                            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </SafeAreaView>
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
        justifyContent: 'space-between',
        paddingHorizontal: spacing.screenPadding,
        paddingBottom: spacing.xl,
    },
    illustrationArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: spacing.lg,
    },
    illustrationCard: {
        width: SCREEN_WIDTH * 0.7,
        height: 260,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        position: 'relative',
        overflow: 'hidden',
    },
    // Laptop
    laptop: {
        position: 'absolute',
        top: 60,
        left: '50%',
        marginLeft: -50,
        alignItems: 'center',
    },
    laptopScreen: {
        width: 100,
        height: 65,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        padding: 8,
        gap: 5,
    },
    laptopLine: {
        height: 4,
        width: '90%',
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderRadius: 2,
    },
    laptopBase: {
        width: 110,
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderRadius: 3,
        marginTop: 2,
    },
    // Coffee
    coffeeCup: {
        position: 'absolute',
        top: 40,
        right: 45,
    },
    cupBody: {
        width: 24,
        height: 28,
        backgroundColor: 'rgba(139, 92, 246, 0.4)',
        borderRadius: 4,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    },
    cupHandle: {
        position: 'absolute',
        right: -8,
        top: 6,
        width: 10,
        height: 14,
        borderWidth: 2,
        borderColor: 'rgba(139, 92, 246, 0.35)',
        borderLeftWidth: 0,
        borderRadius: '0 8 8 0',
    },
    steam1: {
        position: 'absolute',
        top: -10,
        left: 5,
        width: 2,
        height: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 1,
        transform: [{ rotate: '-10deg' }],
    },
    steam2: {
        position: 'absolute',
        top: -12,
        left: 13,
        width: 2,
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 1,
        transform: [{ rotate: '10deg' }],
    },
    // Papers
    paper1: {
        position: 'absolute',
        bottom: 50,
        left: 30,
        width: 55,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 4,
        padding: 6,
        gap: 4,
        transform: [{ rotate: '-5deg' }],
    },
    paper2: {
        position: 'absolute',
        bottom: 60,
        left: 55,
        width: 50,
        height: 35,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 4,
        padding: 5,
        gap: 3,
        transform: [{ rotate: '3deg' }],
    },
    paperLine: {
        height: 3,
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 1,
    },
    // Pencil
    pencil: {
        position: 'absolute',
        bottom: 80,
        right: 35,
        flexDirection: 'row',
        alignItems: 'center',
        transform: [{ rotate: '35deg' }],
    },
    pencilBody: {
        width: 40,
        height: 5,
        backgroundColor: 'rgba(249, 115, 22, 0.5)',
        borderRadius: 1,
    },
    pencilTip: {
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderTopWidth: 3,
        borderBottomWidth: 3,
        borderLeftColor: 'rgba(249, 115, 22, 0.7)',
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
    },
    // Phone
    phone: {
        position: 'absolute',
        bottom: 30,
        right: 55,
        width: 26,
        height: 42,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        padding: 3,
    },
    phoneScreen: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 2,
    },
    // Sticky notes
    stickyNote1: {
        position: 'absolute',
        top: 35,
        left: 35,
        width: 22,
        height: 22,
        backgroundColor: 'rgba(139, 92, 246, 0.25)',
        borderRadius: 3,
        transform: [{ rotate: '8deg' }],
    },
    stickyNote2: {
        position: 'absolute',
        top: 28,
        left: 60,
        width: 18,
        height: 18,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderRadius: 3,
        transform: [{ rotate: '-5deg' }],
    },
    // Text
    textArea: {
        alignItems: 'center',
        paddingHorizontal: spacing.md,
    },
    heading: {
        fontSize: typography.fontSize.xxl + 2,
        fontWeight: typography.fontWeight.bold,
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 36,
        marginBottom: spacing.md,
    },
    description: {
        fontSize: typography.fontSize.sm,
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: spacing.sm,
    },
    // Button
    buttonArea: {
        paddingTop: spacing.lg,
    },
    startButton: {
        backgroundColor: '#7C3AED',
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 24,
        alignItems: 'center',
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
        elevation: 8,
    },
    startBtnRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    startButtonText: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
});
