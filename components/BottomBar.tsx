import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomBarProps {
    activeTab: string;
    onTabPress: (tab: string) => void;
    onAddPress: () => void;
}

const TABS: { key: string; label: string; icon: string; activeIcon: string }[] = [
    { key: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
    { key: 'save', label: 'Save', icon: 'bookmark-outline', activeIcon: 'bookmark' },
    { key: 'add', label: '', icon: 'add', activeIcon: 'add' },
    { key: 'downloads', label: 'Downloads', icon: 'download-outline', activeIcon: 'download' },
    { key: 'more', label: 'More', icon: 'grid-outline', activeIcon: 'grid' },
];

export default function BottomBar({ activeTab, onTabPress, onAddPress }: BottomBarProps) {
    const insets = useSafeAreaInsets();
    const bottomOffset = insets.bottom;

    return (
        <View style={[styles.container, { paddingBottom: bottomOffset + spacing.xs }]}>
            <View style={styles.tabBar}>
                {TABS.map((tab, index) => {
                    const isActive = activeTab === tab.key;
                    const isAdd = tab.key === 'add';

                    if (isAdd) {
                        return (
                            <View key={tab.key} style={styles.addWrapper}>
                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={onAddPress}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="add" size={28} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        );
                    }

                    return (
                        <TouchableOpacity
                            key={tab.key}
                            style={[styles.tab, isActive && styles.tabActive]}
                            onPress={() => onTabPress(tab.key)}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={isActive ? tab.activeIcon as any : tab.icon as any}
                                size={24}
                                color={isActive ? '#7C3AED' : 'rgba(255, 255, 255, 0.55)'}
                            />
                            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#1A1A2E',
        borderTopWidth: 1,
        borderTopColor: 'rgba(124, 58, 237, 0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 12,
        zIndex: 100,
    },
    tabBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingTop: spacing.sm,
        height: 70,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        paddingTop: spacing.xs,
    },
    tabActive: {},
    tabLabel: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        color: 'rgba(255, 255, 255, 0.55)',
        letterSpacing: 0.3,
    },
    tabLabelActive: {
        color: '#7C3AED',
        fontWeight: typography.fontWeight.bold,
    },
    addWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#7C3AED',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
    },
});
