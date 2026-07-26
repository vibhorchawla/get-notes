import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants/colors';

interface GradientBackgroundProps {
    children: React.ReactNode;
    dark?: boolean;
}

export default function GradientBackground({ children }: GradientBackgroundProps) {
    return (
        <View style={styles.root}>
            <View style={styles.backdrop} pointerEvents="none">
                <LinearGradient
                    colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
                    locations={[0, 0.55, 1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
            </View>
            <View style={styles.content}>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.gradientStart,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
    },
    content: {
        flex: 1,
        zIndex: 1,
    },
});
