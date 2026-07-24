import React from 'react';
import { View, StyleSheet } from 'react-native';

interface WizardStepProps {
    stepKey: string;
    stepIndex: number;
    previousStep: number;
    children: React.ReactNode;
}

export default function WizardStep({
    stepKey,
    stepIndex,
    previousStep,
    children,
}: WizardStepProps) {
    return (
        <View key={stepKey}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {},
});
