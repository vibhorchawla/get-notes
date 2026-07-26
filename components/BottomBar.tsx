import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../constants/spacing';
import { colors } from '../constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomBarProps {
    activeTab: string;
    onTabPress: (tab: string) => void;
    onAddPress: () => void;
}

export default function BottomBar({ activeTab, onTabPress, onAddPress }: BottomBarProps) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom + 8 }]}>
            <View style={styles.pill}>
                {/* Home */}
                <TouchableOpacity style={styles.tab} onPress={() => onTabPress('home')} activeOpacity={0.7}>
                    <Ionicons name="home" size={24} color={activeTab === 'home' ? colors.primary : colors.textLight} />
                </TouchableOpacity>

                {/* Explore */}
                <TouchableOpacity style={styles.tab} onPress={() => onTabPress('community')} activeOpacity={0.7}>
                    <Ionicons name="compass-outline" size={24} color={activeTab === 'community' ? colors.primary : colors.textLight} />
                </TouchableOpacity>

                {/* Add */}
                <TouchableOpacity style={styles.tabAdd} onPress={onAddPress} activeOpacity={0.7}>
                    <Ionicons name="add" size={28} color={colors.textOnPrimary} />
                </TouchableOpacity>

                {/* Saved */}
                <TouchableOpacity style={styles.tab} onPress={() => onTabPress('save')} activeOpacity={0.7}>
                    <Ionicons name="bookmark-outline" size={24} color={activeTab === 'save' ? colors.primary : colors.textLight} />
                </TouchableOpacity>

                {/* Grid */}
                <TouchableOpacity style={styles.tab} onPress={() => onTabPress('more')} activeOpacity={0.7}>
                    <Ionicons name="grid-outline" size={24} color={colors.textLight} />
                </TouchableOpacity>
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
        alignItems: 'center',
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(26, 34, 53, 0.95)',
        borderRadius: 28,
        paddingHorizontal: 8,
        height: 60,
        width: '85%',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
        elevation: 20,
    },
    tab: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    tabAdd: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
});
