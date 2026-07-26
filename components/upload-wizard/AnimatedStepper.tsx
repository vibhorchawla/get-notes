import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

const STEPS = ['Course', 'Semester', 'Subject', 'Upload'] as const;
const STEP_ICONS: (keyof typeof Ionicons.glyphMap)[] = [
    'school-outline',
    'layers-outline',
    'book-outline',
    'cloud-upload-outline',
];

interface StepperProps {
    currentStep: number;
    completedSteps: number[];
    onStepPress: (step: number) => void;
    dark?: boolean;
}

function StepCircle({
    step,
    currentStep,
    completedSteps,
    onStepPress,
    dark,
}: {
    step: number;
    currentStep: number;
    completedSteps: number[];
    onStepPress: (step: number) => void;
    dark: boolean;
}) {
    const isCompleted = completedSteps.includes(step);
    const isCurrent = step === currentStep;
    const d = colors.dark;

    const handlePress = () => {
        if (step <= Math.max(...completedSteps, currentStep)) {
            onStepPress(step);
        }
    };

    return (
        <Pressable
            onPress={handlePress}
            style={[
                styles.circle,
                {
                    backgroundColor: isCompleted
                        ? (dark ? d.accent : colors.accent)
                        : 'transparent',
                    borderColor: isCompleted
                        ? (dark ? d.accent : colors.accent)
                        : isCurrent
                        ? (dark ? d.primary : colors.primary)
                        : (dark ? d.border : colors.border),
                    shadowColor: isCurrent ? (dark ? d.primary : colors.primary) : 'transparent',
                    shadowOpacity: isCurrent ? 0.3 : 0,
                    shadowRadius: isCurrent ? 12 : 0,
                    elevation: isCurrent ? 6 : 0,
                },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Step ${step + 1}: ${STEPS[step]}`}
            accessibilityState={{ selected: isCurrent, checked: isCompleted }}
        >
            {isCompleted ? (
                <Ionicons name="checkmark" size={16} color={dark ? '#FFFFFF' : colors.white} />
            ) : (
                <Ionicons
                    name={STEP_ICONS[step]}
                    size={16}
                    color={isCurrent
                        ? (dark ? d.primary : colors.primary)
                        : (dark ? d.textMuted : colors.textLight)
                    }
                />
            )}
        </Pressable>
    );
}

function ConnectorLine({
    step,
    currentStep,
    completedSteps,
    dark,
}: {
    step: number;
    currentStep: number;
    completedSteps: number[];
    dark: boolean;
}) {
    const isCompleted = completedSteps.includes(step + 1) || completedSteps.includes(step);
    const isActive = step < currentStep;
    const d = colors.dark;

    return (
        <View style={[styles.connectorTrack, dark && styles.connectorTrackDark]}>
            <View
                style={[
                    styles.connectorFill,
                    {
                        backgroundColor: isCompleted || isActive
                            ? (dark ? d.primary : colors.primary)
                            : (dark ? d.border : colors.border),
                    },
                ]}
            />
        </View>
    );
}

export default function AnimatedStepper({
    currentStep,
    completedSteps,
    onStepPress,
    dark = false,
}: StepperProps) {
    const d = colors.dark;

    return (
        <View style={styles.container}>
            <View style={styles.stepCounter}>
                <Text style={[styles.stepCounterText, dark && { color: d.textSecondary }]}>
                    Step {currentStep + 1} of {STEPS.length}
                </Text>
            </View>

            <View style={styles.stepperRow}>
                {STEPS.map((label, i) => (
                    <React.Fragment key={label}>
                        <View style={styles.stepWrapper}>
                            <StepCircle
                                step={i}
                                currentStep={currentStep}
                                completedSteps={completedSteps}
                                onStepPress={onStepPress}
                                dark={dark}
                            />
                            <Text
                                style={[
                                    styles.stepLabel,
                                    dark && styles.stepLabelDark,
                                    i === currentStep && (dark ? styles.stepLabelActiveDark : styles.stepLabelActive),
                                    completedSteps.includes(i) && (dark ? styles.stepLabelCompletedDark : styles.stepLabelCompleted),
                                ]}
                            >
                                {label}
                            </Text>
                        </View>
                        {i < STEPS.length - 1 && (
                            <ConnectorLine
                                step={i}
                                currentStep={currentStep}
                                completedSteps={completedSteps}
                                dark={dark}
                            />
                        )}
                    </React.Fragment>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.lg,
        alignItems: 'center',
    },
    stepCounter: {
        marginBottom: spacing.md,
    },
    stepCounterText: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        fontWeight: typography.fontWeight.medium,
    },
    stepperRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        width: '100%',
        justifyContent: 'center',
    },
    stepWrapper: {
        alignItems: 'center',
        width: 60,
    },
    circle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    stepLabel: {
        fontSize: 11,
        color: colors.textLight,
        marginTop: spacing.xs,
        fontWeight: typography.fontWeight.medium,
        textAlign: 'center',
    },
    stepLabelDark: {
        color: colors.dark.textMuted,
    },
    stepLabelActive: {
        color: colors.primary,
        fontWeight: typography.fontWeight.semibold,
    },
    stepLabelActiveDark: {
        color: colors.dark.primary,
    },
    stepLabelCompleted: {
        color: colors.accent,
    },
    stepLabelCompletedDark: {
        color: colors.dark.accent,
    },
    connectorTrack: {
        flex: 1,
        height: 2,
        backgroundColor: colors.border,
        borderRadius: 1,
        marginTop: 19,
        marginHorizontal: -spacing.xs,
        overflow: 'hidden',
    },
    connectorTrackDark: {
        backgroundColor: colors.dark.border,
    },
    connectorFill: {
        height: '100%',
        borderRadius: 1,
    },
});
