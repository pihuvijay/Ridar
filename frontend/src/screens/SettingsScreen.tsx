import React, { useState } from "react";
import {
	View,
	Text,
	ScrollView,
	Pressable,
	StyleSheet,
	Switch,
	SafeAreaView,
} from "react-native";
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from "../theme/colors";

interface SettingsScreenProps {
	onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
	const [pushNotifications, setPushNotifications] = useState(true);
	const [rideReminders, setRideReminders] = useState(true);
	const [chatMessages, setChatMessages] = useState(true);
	const [darkMode, setDarkMode] = useState(false);

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Pressable style={styles.backButton} onPress={onBack}>
					<Text style={styles.backIcon}>←</Text>
				</Pressable>
				<Text style={styles.headerTitle}>Settings</Text>
			</View>

			<ScrollView
				style={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Appearance Section */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Appearance</Text>
					</View>

					<View style={styles.settingItem}>
						<View style={styles.settingIconContainer}>
							<Text style={styles.settingIcon}>🌐</Text>
						</View>
						<View style={styles.settingContent}>
							<Text style={styles.settingName}>Language</Text>
							<Text style={styles.settingDescription}>
								English
							</Text>
						</View>
					</View>

					<View style={styles.divider} />

					<View style={styles.settingItemWithToggle}>
						<View style={styles.settingLeft}>
							<View style={styles.settingIconContainer}>
								<Text style={styles.settingIcon}>🌙</Text>
							</View>
							<View style={styles.settingContent}>
								<Text style={styles.settingName}>
									Dark Mode
								</Text>
								<Text style={styles.settingDescription}>
									Use dark theme
								</Text>
							</View>
						</View>
						<Switch
							value={darkMode}
							onValueChange={setDarkMode}
							trackColor={{
								false: COLORS.border,
								true: COLORS.primary,
							}}
							thumbColor={COLORS.textLight}
						/>
					</View>
				</View>

				{/* Notifications Section */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Notifications</Text>
					</View>

					<View style={styles.settingItemWithToggle}>
						<View style={styles.settingLeft}>
							<View
								style={[
									styles.settingIconContainer,
									{ backgroundColor: COLORS.accentYellow },
								]}
							>
								<Text style={styles.settingIcon}>🔔</Text>
							</View>
							<View style={styles.settingContent}>
								<Text style={styles.settingName}>
									Push Notifications
								</Text>
								<Text style={styles.settingDescription}>
									Enable all notifications
								</Text>
							</View>
						</View>
						<Switch
							value={pushNotifications}
							onValueChange={setPushNotifications}
							trackColor={{
								false: COLORS.border,
								true: COLORS.primary,
							}}
							thumbColor={COLORS.textLight}
						/>
					</View>

					<View style={styles.divider} />

					<View style={styles.settingItemWithToggle}>
						<View style={styles.settingLeft}>
							<View style={styles.settingIconContainer}>
								<Text style={styles.settingIcon}>⏰</Text>
							</View>
							<View style={styles.settingContent}>
								<Text style={styles.settingName}>
									Ride Reminders
								</Text>
								<Text style={styles.settingDescription}>
									Get notified before rides
								</Text>
							</View>
						</View>
						<Switch
							value={rideReminders}
							onValueChange={setRideReminders}
							trackColor={{
								false: COLORS.border,
								true: COLORS.primary,
							}}
							thumbColor={COLORS.textLight}
						/>
					</View>

					<View style={styles.divider} />

					<View style={styles.settingItemWithToggle}>
						<View style={styles.settingLeft}>
							<View style={styles.settingIconContainer}>
								<Text style={styles.settingIcon}>💬</Text>
							</View>
							<View style={styles.settingContent}>
								<Text style={styles.settingName}>
									Chat Messages
								</Text>
								<Text style={styles.settingDescription}>
									New message alerts
								</Text>
							</View>
						</View>
						<Switch
							value={chatMessages}
							onValueChange={setChatMessages}
							trackColor={{
								false: COLORS.border,
								true: COLORS.primary,
							}}
							thumbColor={COLORS.textLight}
						/>
					</View>
				</View>

				{/* Privacy & Security Section */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>
							Privacy & Security
						</Text>
					</View>

					<Pressable style={styles.settingItem} onPress={() => {}}>
						<View style={styles.settingLeft}>
							<View
								style={[
									styles.settingIconContainer,
									{ backgroundColor: "#E9D5FF" },
								]}
							>
								<Text style={styles.settingIcon}>🔒</Text>
							</View>
							<View style={styles.settingContent}>
								<Text style={styles.settingName}>
									Privacy Settings
								</Text>
								<Text style={styles.settingDescription}>
									Manage your data
								</Text>
							</View>
						</View>
						<Text style={styles.chevron}>›</Text>
					</Pressable>
				</View>

				{/* Support Section */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Support</Text>
					</View>

					<Pressable style={styles.settingItem} onPress={() => {}}>
						<View style={styles.settingLeft}>
							<View
								style={[
									styles.settingIconContainer,
									{ backgroundColor: "#DCFCE7" },
								]}
							>
								<Text style={styles.settingIcon}>❓</Text>
							</View>
							<View style={styles.settingContent}>
								<Text style={styles.settingName}>
									Help Center
								</Text>
								<Text style={styles.settingDescription}>
									FAQs and guides
								</Text>
							</View>
						</View>
						<Text style={styles.chevron}>›</Text>
					</Pressable>

					<View style={styles.divider} />

					<Pressable style={styles.settingItem} onPress={() => {}}>
						<View style={styles.settingLeft}>
							<View
								style={[
									styles.settingIconContainer,
									{ backgroundColor: "#DBEAFE" },
								]}
							>
								<Text style={styles.settingIcon}>ℹ️</Text>
							</View>
							<View style={styles.settingContent}>
								<Text style={styles.settingName}>
									About Ridar
								</Text>
								<Text style={styles.settingDescription}>
									Version 1.0.0
								</Text>
							</View>
						</View>
						<Text style={styles.chevron}>›</Text>
					</Pressable>
				</View>

				<View style={styles.spacing} />
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.md,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
		backgroundColor: COLORS.background,
		gap: SPACING.md,
	},
	backButton: {
		width: 40,
		height: 40,
		borderRadius: BORDER_RADIUS.lg,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: COLORS.primaryLight,
	},
	backIcon: {
		fontSize: FONT_SIZES.xl,
		color: COLORS.primary,
	},
	headerTitle: {
		fontSize: FONT_SIZES.base,
		fontWeight: "600",
		color: COLORS.primary,
	},
	scrollContent: {
		flex: 1,
	},
	section: {
		marginHorizontal: SPACING.md,
		marginVertical: SPACING.md,
		borderRadius: BORDER_RADIUS.xl,
		backgroundColor: COLORS.background,
		borderWidth: 1,
		borderColor: COLORS.border,
		overflow: "hidden",
	},
	sectionHeader: {
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.md,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
		backgroundColor: COLORS.primaryLight,
	},
	sectionTitle: {
		fontSize: FONT_SIZES.lg,
		fontWeight: "600",
		color: COLORS.primary,
	},
	settingItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.md,
		justifyContent: "space-between",
	},
	settingItemWithToggle: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.md,
	},
	settingLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: SPACING.md,
		flex: 1,
	},
	settingIconContainer: {
		width: 40,
		height: 40,
		borderRadius: BORDER_RADIUS.full,
		backgroundColor: COLORS.primaryLight,
		justifyContent: "center",
		alignItems: "center",
	},
	settingIcon: {
		fontSize: FONT_SIZES.lg,
	},
	settingContent: {
		flex: 1,
		gap: SPACING.xs,
	},
	settingName: {
		fontSize: FONT_SIZES.base,
		fontWeight: "600",
		color: COLORS.primary,
	},
	settingDescription: {
		fontSize: FONT_SIZES.sm,
		color: COLORS.textSecondary,
	},
	chevron: {
		fontSize: FONT_SIZES.xl,
		color: COLORS.primary,
		marginLeft: SPACING.md,
	},
	divider: {
		height: 1,
		backgroundColor: COLORS.border,
		marginHorizontal: SPACING.md,
	},
	spacing: {
		height: SPACING.xl,
	},
});
