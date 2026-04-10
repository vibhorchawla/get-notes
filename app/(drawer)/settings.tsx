import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../../components/GradientBackground';
import TopHeader from '../../components/TopHeader';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

export default function SettingsScreen() {
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
    const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);
    const [autoDownload, setAutoDownload] = React.useState(false);

    return (
        <GradientBackground>
            <SafeAreaView style={styles.container}>
                <TopHeader title="Settings" />
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.content}>
                        {/* Preferences Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Preferences</Text>

                        <View style={styles.settingsCard}>
                            <View style={styles.settingRow}>
                                <View style={styles.settingInfo}>
                                    <Ionicons name="notifications-outline" size={24} color={colors.primary} />
                                    <View style={styles.settingText}>
                                        <Text style={styles.settingLabel}>Notifications</Text>
                                        <Text style={styles.settingDescription}>
                                            Get notified about new notes
                                        </Text>
                                    </View>
                                </View>
                                <Switch
                                    value={notificationsEnabled}
                                    onValueChange={setNotificationsEnabled}
                                    trackColor={{ false: colors.border, true: colors.primary }}
                                />
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.settingRow}>
                                <View style={styles.settingInfo}>
                                    <Ionicons name="moon-outline" size={24} color={colors.primary} />
                                    <View style={styles.settingText}>
                                        <Text style={styles.settingLabel}>Dark Mode</Text>
                                        <Text style={styles.settingDescription}>
                                            Enable dark theme
                                        </Text>
                                    </View>
                                </View>
                                <Switch
                                    value={darkModeEnabled}
                                    onValueChange={setDarkModeEnabled}
                                    trackColor={{ false: colors.border, true: colors.primary }}
                                />
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.settingRow}>
                                <View style={styles.settingInfo}>
                                    <Ionicons name="download-outline" size={24} color={colors.primary} />
                                    <View style={styles.settingText}>
                                        <Text style={styles.settingLabel}>Auto Download</Text>
                                        <Text style={styles.settingDescription}>
                                            Download notes automatically
                                        </Text>
                                    </View>
                                </View>
                                <Switch
                                    value={autoDownload}
                                    onValueChange={setAutoDownload}
                                    trackColor={{ false: colors.border, true: colors.primary }}
                                />
                            </View>
                        </View>
                    </View>

                    {/* About Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About</Text>

                        <View style={styles.settingsCard}>
                            <TouchableOpacity style={styles.settingRow}>
                                <View style={styles.settingInfo}>
                                    <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
                                    <View style={styles.settingText}>
                                        <Text style={styles.settingLabel}>App Version</Text>
                                        <Text style={styles.settingDescription}>1.0.0</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                            </TouchableOpacity>

                            <View style={styles.divider} />

                            <TouchableOpacity style={styles.settingRow}>
                                <View style={styles.settingInfo}>
                                    <Ionicons name="help-circle-outline" size={24} color={colors.primary} />
                                    <View style={styles.settingText}>
                                        <Text style={styles.settingLabel}>Help & Support</Text>
                                        <Text style={styles.settingDescription}>Get help with the app</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                            </TouchableOpacity>

                            <View style={styles.divider} />

                            <TouchableOpacity style={styles.settingRow}>
                                <View style={styles.settingInfo}>
                                    <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
                                    <View style={styles.settingText}>
                                        <Text style={styles.settingLabel}>Privacy Policy</Text>
                                        <Text style={styles.settingDescription}>Read our privacy policy</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
            </SafeAreaView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: spacing.screenPadding,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    settingsCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        padding: spacing.md,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingText: {
        marginLeft: spacing.md,
        flex: 1,
    },
    settingLabel: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.medium,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    settingDescription: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.sm,
    },
});
