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
}

function StepCircle({
    step,
    currentStep,
    completedSteps,
    onStepPress,
}: {
    step: number;
    currentStep: number;
    completedSteps: number[];
    onStepPress: (step: number) => void;
}) {
    const isCompleted = completedSteps.includes(step);
    const isCurrent = step === currentStep;

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
                    backgroundColor: isCompleted ? colors.accent : 'transparent',
                    borderColor: isCompleted
                        ? colors.accent
                        : isCurrent
                        ? colors.primary
                        : colors.border,
                    shadowColor: isCurrent ? colors.primary : 'transparent',
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
                <Ionicons name="checkmark" size={16} color={colors.white} />
            ) : (
                <Ionicons
                    name={STEP_ICONS[step]}
                    size={16}
                    color={isCurrent ? colors.primary : colors.textLight}
                />
            )}
        </Pressable>
    );
}

function ConnectorLine({
    step,
    currentStep,
    completedSteps,
}: {
    step: number;
    currentStep: number;
    completedSteps: number[];
}) {
    const isCompleted = completedSteps.includes(step + 1) || completedSteps.includes(step);
    const isActive = step < currentStep;

    return (
        <View style={styles.connectorTrack}>
            <View
                style={[
                    styles.connectorFill,
                    {
                        backgroundColor: isCompleted || isActive ? colors.primary : colors.border,
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
}: StepperProps) {
    return (
        <View style={styles.container}>
            <View style={styles.stepCounter}>
                <Text style={styles.stepCounterText}>
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
                            />
                            <Text
                                style={[
                                    styles.stepLabel,
                                    i === currentStep && styles.stepLabelActive,
                                    completedSteps.includes(i) && styles.stepLabelCompleted,
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
    stepLabelActive: {
        color: colors.primary,
        fontWeight: typography.fontWeight.semibold,
    },
    stepLabelCompleted: {
        color: colors.accent,
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
    connectorFill: {
        height: '100%',
        borderRadius: 1,
    },
});
