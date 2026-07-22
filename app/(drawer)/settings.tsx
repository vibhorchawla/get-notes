import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    Linking,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import GradientBackground from '../../components/GradientBackground';
import TopHeader from '../../components/TopHeader';
import SettingsRow from '../../components/SettingsRow';
import { useToast } from '../../context/ToastContext';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

export default function SettingsScreen() {
    const router = useRouter();
    const { showToast } = useToast();
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);
    const [autoDownload, setAutoDownload] = React.useState(false);

    const handleToggle = (label: string, value: boolean, setter: (v: boolean) => void) => {
        setter(!value);
        showToast(`${label} ${!value ? 'enabled' : 'disabled'}`, 'info');
    };

    return (
        <GradientBackground>
            <SafeAreaView style={styles.container}>
                <TopHeader title="Settings" />
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.content}>
                        {/* Subscription */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Subscription</Text>
                            <View style={styles.settingsCard}>
                                <SettingsRow
                                    icon="diamond-outline"
                                    label="Upgrade Plan"
                                    description="First 2 months free on Pro & Team"
                                    onPress={() => router.push('/(drawer)/subscription')}
                                />
                            </View>
                        </View>

                        {/* Preferences */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Preferences</Text>
                            <View style={styles.settingsCard}>
                                <SettingsRow
                                    icon="notifications-outline"
                                    label="Notifications"
                                    description="Get notified about new notes"
                                    toggle={{ value: notificationsEnabled, onValueChange: (v) => handleToggle('Notifications', v, setNotificationsEnabled) }}
                                    showChevron={false}
                                />
                                <View style={styles.divider} />
                                <SettingsRow
                                    icon="download-outline"
                                    label="Auto Download"
                                    description="Download notes automatically"
                                    toggle={{ value: autoDownload, onValueChange: (v) => handleToggle('Auto Download', v, setAutoDownload) }}
                                    showChevron={false}
                                />
                            </View>
                        </View>

                        {/* Support */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Support</Text>
                            <View style={styles.settingsCard}>
                                <SettingsRow
                                    icon="help-circle-outline"
                                    label="FAQ"
                                    description="Frequently asked questions"
                                    onPress={() => router.push('/settings/faq')}
                                />
                                <View style={styles.divider} />
                                <SettingsRow
                                    icon="chatbubble-ellipses-outline"
                                    label="Send Feedback"
                                    description="Help us improve GetNotes"
                                    onPress={() => router.push('/settings/feedback')}
                                />
                                <View style={styles.divider} />
                                <SettingsRow
                                    icon="mail-outline"
                                    label="Contact Us"
                                    description="Get in touch with our team"
                                    onPress={() => router.push('/settings/contact')}
                                />
                            </View>
                        </View>

                        {/* About */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>About</Text>
                            <View style={styles.settingsCard}>
                                <SettingsRow
                                    icon="information-circle-outline"
                                    label="About GetNotes"
                                    description="Learn more about the app"
                                    onPress={() => router.push('/settings/about')}
                                />
                                <View style={styles.divider} />
                                <SettingsRow
                                    icon="shield-checkmark-outline"
                                    label="Privacy Policy"
                                    description="Read our privacy policy"
                                    onPress={() => router.push('/settings/privacy')}
                                />
                                <View style={styles.divider} />
                                <SettingsRow
                                    icon="document-text-outline"
                                    label="Terms & Conditions"
                                    description="Terms of service"
                                    onPress={() => router.push('/settings/terms')}
                                />
                                <View style={styles.divider} />
                                <SettingsRow
                                    icon="star-outline"
                                    label="Rate the App"
                                    description="Love GetNotes? Leave a review!"
                                    onPress={() => {
                                        const url = Platform.OS === 'ios'
                                            ? 'https://apps.apple.com/app/getnotes/id0000000000'
                                            : 'https://play.google.com/store/apps/details?id=com.getnotes.app';
                                        Linking.openURL(url).catch(() => showToast('Store not available', 'error'));
                                    }}
                                />
                                <View style={styles.divider} />
                                <SettingsRow
                                    icon="information-circle-outline"
                                    label="App Version"
                                    rightContent={<Text style={styles.versionText}>1.0.0</Text>}
                                    showChevron={false}
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: spacing.screenPadding, paddingBottom: spacing.xxl },
    section: { marginBottom: spacing.xl },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    settingsCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        paddingHorizontal: spacing.md,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
    },
    versionText: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        fontWeight: typography.fontWeight.medium,
    },
});
