import React from "react";
import {
	View,
	Text,
	ScrollView,
	Pressable,
	StyleSheet,
	Switch,
	SafeAreaView,
	TouchableOpacity,
} from "react-native";
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from "../theme/colors";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";


interface SettingsScreenProps {
	onLogout: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onLogout }) => {
	const { themeName, colors, setThemeName, toggleTheme } = useTheme();
	const navigation = useNavigation();

	const [pushNotifications, setPushNotifications] = React.useState(true);
	const [rideReminders, setRideReminders] = React.useState(true);
	const [chatMessages, setChatMessages] = React.useState(true);

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
			<ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
				{/* Appearance Section */}
					<View style={[styles.section, { borderColor: colors.border, backgroundColor: colors.cardBackground }]}> 
					<View style={[styles.sectionHeader, { backgroundColor: colors.primaryLight, borderBottomColor: colors.border }]}> 
						<Text style={[styles.sectionTitle, { color: colors.primary }]}>Appearance</Text>
					</View>

					<View style={styles.settingItem}>
						<View style={[styles.settingIconContainer, { backgroundColor: colors.cardBackground }]}> 
							<Ionicons name="globe-outline" size={18} color={colors.primary} />
						</View>
						<View style={styles.settingContent}>
							<Text style={[styles.settingName, { color: colors.primary }]}>Language</Text>
							<Text style={[styles.settingDescription, { color: colors.textSecondary }]}>English</Text>
						</View>
					</View>

					<View style={[styles.divider, { backgroundColor: colors.border }]} />

					<View style={styles.settingItemWithToggle}>
						<View style={styles.settingLeft}>
							<View style={[styles.settingIconContainer, { backgroundColor: colors.cardBackground }]}> 
								<Ionicons name="moon-outline" size={18} color={colors.primary} />
							</View>
							<View style={styles.settingContent}>
								<Text style={[styles.settingName, { color: colors.primary }]}>Dark Mode</Text>
								<Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Use dark theme</Text>
							</View>
						</View>
						<Switch
							value={themeName === "dark"}
							onValueChange={() => setThemeName(themeName === "dark" ? "light" : "dark")}
							trackColor={{
								false: colors.border,
								true: colors.primary,
							}}
							thumbColor={colors.textLight}
						/>
					</View>
				</View>

				{/* Notifications Section */}
				<View style={[styles.section, { borderColor: colors.border, backgroundColor: colors.cardBackground }]}>
					<View style={[styles.sectionHeader, { backgroundColor: colors.primaryLight, borderBottomColor: colors.border }]}> 
						<Text style={[styles.sectionTitle, { color: colors.primary }]}>Notifications</Text>
					</View>

					<View style={styles.settingItemWithToggle}>
						<View style={styles.settingLeft}>
							<View
								style={[
									styles.settingIconContainer,
									{ backgroundColor: colors.primaryLight },
								]}
							>
								<Ionicons name="notifications-outline" size={18} color={colors.primary} />
							</View>
							<View style={styles.settingContent}>
								<Text style={[styles.settingName, { color: colors.primary }]}>Push Notifications</Text>
								<Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Enable all notifications</Text>
							</View>
						</View>
						<Switch
							value={pushNotifications}
							onValueChange={setPushNotifications}
							trackColor={{
								false: colors.border,
								true: colors.primary,
							}}
							thumbColor={colors.textLight}
						/>
					</View>

					<View style={[styles.divider, { backgroundColor: colors.border }]} />

					<View style={styles.settingItemWithToggle}>
						<View style={styles.settingLeft}>
							<View style={[styles.settingIconContainer, { backgroundColor: colors.primaryLight }]}> 
								<Ionicons name="time-outline" size={18} color={colors.primary} />
							</View>
							<View style={styles.settingContent}>
								<Text style={[styles.settingName, { color: colors.primary }]}>Ride Reminders</Text>
								<Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Get notified before rides</Text>
							</View>
						</View>
						<Switch
							value={rideReminders}
							onValueChange={setRideReminders}
							trackColor={{
								false: colors.border,
								true: colors.primary,
							}}
							thumbColor={colors.textLight}
						/>
					</View>

					<View style={[styles.divider, { backgroundColor: colors.border }]} />

					<View style={styles.settingItemWithToggle}>
						<View style={styles.settingLeft}>
							<View style={[styles.settingIconContainer, { backgroundColor: colors.primaryLight }]}> 
								<Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.primary} />
							</View>
							<View style={styles.settingContent}>
								<Text style={[styles.settingName, { color: colors.primary }]}>Chat Messages</Text>
								<Text style={[styles.settingDescription, { color: colors.textSecondary }]}>New message alerts</Text>
							</View>
						</View>
						<Switch
							value={chatMessages}
							onValueChange={setChatMessages}
							trackColor={{
								false: colors.border,
								true: colors.primary,
							}}
							thumbColor={colors.textLight}
						/>
					</View>
				</View>

				{/* Privacy & Security Section */}
				<View style={[styles.section, { borderColor: colors.border, backgroundColor: colors.cardBackground }]}> 
					<View style={[styles.sectionHeader, { backgroundColor: colors.primaryLight, borderBottomColor: colors.border }]}> 
						<Text style={[styles.sectionTitle, { color: colors.primary }]}>Privacy & Security</Text>
					</View>

					<Pressable style={[styles.settingItem, { backgroundColor: colors.cardBackground }]} onPress={() => {}}>
						<View style={styles.settingLeft}>
							<View
								style={[
									styles.settingIconContainer,
									{ backgroundColor: colors.primaryLight },
								]}
							>
								<Ionicons name="lock-closed-outline" size={18} color={colors.primary} />
							</View>
							<View style={styles.settingContent}>
								<Text style={[styles.settingName, { color: colors.primary }]}>Privacy Settings</Text>
								<Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Manage your data</Text>
							</View>
						</View>
						<Text style={[styles.chevron, { color: colors.primary }]}>›</Text>
					</Pressable>
				</View>

				{/* Support Section */}
				<View style={[styles.section, { borderColor: colors.border, backgroundColor: colors.cardBackground }]}> 
					<View style={[styles.sectionHeader, { backgroundColor: colors.primaryLight, borderBottomColor: colors.border }]}> 
						<Text style={[styles.sectionTitle, { color: colors.primary }]}>Support</Text>
					</View>

					<Pressable style={[styles.settingItem, { backgroundColor: colors.cardBackground }]} onPress={() => {}}>
						<View style={styles.settingLeft}>
							<View
								style={[
									styles.settingIconContainer,
									{ backgroundColor: colors.primaryLight },
								]}
							>
								<Ionicons name="help-circle-outline" size={18} color={colors.primary} />
							</View>
							<View style={styles.settingContent}>
								<Text style={[styles.settingName, { color: colors.primary }]}>Help Center</Text>
								<Text style={[styles.settingDescription, { color: colors.textSecondary }]}>FAQs and guides</Text>
							</View>
						</View>
						<Text style={[styles.chevron, { color: colors.primary }]}>›</Text>
					</Pressable>

					<View style={[styles.divider, { backgroundColor: colors.border }]} />

					<Pressable style={[styles.settingItem, { backgroundColor: colors.cardBackground }]} onPress={() => {}}>
						<View style={styles.settingLeft}>
							<View
								style={[
									styles.settingIconContainer,
									{ backgroundColor: colors.primaryLight },
								]}
							>
								<Ionicons name="information-circle-outline" size={18} color={colors.primary} />
							</View>
							<View style={styles.settingContent}>
								<Text style={[styles.settingName, { color: colors.primary }]}>About Ridar</Text>
								<Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Version 1.0.0</Text>
							</View>
						</View>
						<Ionicons name="chevron-forward" size={20} color={colors.primary} />
					</Pressable>
				</View>

				<TouchableOpacity
					style={[styles.logoutButton, { backgroundColor: '#ef4444' }]}
					onPress={onLogout}
				>
					<Text style={styles.logoutText}>Log Out</Text>
				</TouchableOpacity>

				<View style={styles.spacing} />
			</ScrollView>

			{/* Bottom tab replica so navigation remains available */}
			<View style={[styles.bottomNavBar, { backgroundColor: colors.cardBackground, borderTopColor: colors.border }]}> 
				<TouchableOpacity
					style={styles.tabButton}
					onPress={() => (navigation as any).navigate("MainTabs", { screen: "Map" })}
					activeOpacity={0.8}
				>
					<Ionicons name="map-outline" size={22} color={colors.primary} />
					<Text style={[styles.tabButtonText, { color: colors.textSecondary }]}>Map</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.tabButton}
					onPress={() => (navigation as any).navigate("MainTabs", { screen: "RideGroups" })}
					activeOpacity={0.8}
				>
					<Ionicons name="people-outline" size={22} color={colors.textSecondary} />
					<Text style={[styles.tabButtonText, { color: colors.textSecondary }]}>Ride Groups</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.tabButton}
					onPress={() => (navigation as any).navigate("MainTabs", { screen: "Profile" })}
					activeOpacity={0.8}
				>
					<Ionicons name="person-outline" size={22} color={colors.textSecondary} />
					<Text style={[styles.tabButtonText, { color: colors.textSecondary }]}>Profile</Text>
				</TouchableOpacity>
			</View>
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

	logoutButton: {
		marginHorizontal: SPACING.md,
		marginTop: SPACING.md,
		backgroundColor: "#ef4444",
		paddingVertical: 14,
		borderRadius: 10,
		alignItems: "center",
	},

	logoutText: {
		color: "#fff",
		fontSize: FONT_SIZES.base,
		fontWeight: "600",
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
	bottomNavBar: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center",
		paddingTop: 8,
		paddingBottom: 18,
		borderTopWidth: 1,
	},
	tabButton: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 6,
	},
	tabButtonText: {
		fontSize: 12,
		color: "#374151",
		marginTop: 4,
	},
});
