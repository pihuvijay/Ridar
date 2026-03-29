import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	Pressable,
	StyleSheet,
	SafeAreaView,
	ScrollView,
	Alert,
	ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from "../theme/colors";

interface ModeratorLoginScreenProps {
	onLogin: () => void;
	onBackToLogin: () => void;
}

const ADMIN_ACCOUNTS = [
	{ username: "admin", password: "admin123" },
	{ username: "moderator", password: "mod123" },
	{ username: "supervisor", password: "super123" },
];

export const ModeratorLoginScreen: React.FC<ModeratorLoginScreenProps> = ({
	onLogin,
	onBackToLogin,
}) => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleLogin = async () => {
		if (!username.trim()) {
			Alert.alert("Error", "Please enter your username");
			return;
		}

		if (!password.trim()) {
			Alert.alert("Error", "Please enter your password");
			return;
		}

		setIsLoading(true);

		setTimeout(() => {
			const validAdmin = ADMIN_ACCOUNTS.find(
				(acc) => acc.username === username && acc.password === password,
			);

			setIsLoading(false);

			if (validAdmin) {
				onLogin();
			} else {
				Alert.alert("Login Failed", "Invalid username or password");
				setPassword("");
			}
		}, 500);
	};

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.topBadge}>
					<Ionicons
						name="shield-checkmark-outline"
						size={16}
						color={COLORS.textLight}
					/>
					<Text style={styles.topBadgeText}>Restricted access</Text>
				</View>

				<View style={styles.header}>
					<View style={styles.heroIconWrap}>
						<Ionicons
							name="lock-closed"
							size={28}
							color={COLORS.textLight}
						/>
					</View>
					<Text style={styles.title}>Moderator Portal</Text>
					<Text style={styles.subtitle}>
						Sign in with moderator credentials to review reports,
						manage safety issues, and monitor platform activity.
					</Text>
				</View>

				<View style={styles.card}>
					<View style={styles.cardHeader}>
						<Text style={styles.cardTitle}>Admin sign in</Text>
						<Text style={styles.cardSubtitle}>
							Use your moderator username and password
						</Text>
					</View>

					<View style={styles.form}>
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Username</Text>
							<View style={styles.inputContainer}>
								<Ionicons
									name="person-outline"
									size={18}
									color={COLORS.textSecondary}
								/>
								<TextInput
									style={styles.input}
									placeholder="Enter username"
									placeholderTextColor={COLORS.textSecondary}
									value={username}
									onChangeText={setUsername}
									autoCapitalize="none"
									autoCorrect={false}
									editable={!isLoading}
								/>
							</View>
						</View>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>Password</Text>
							<View style={styles.inputContainer}>
								<Ionicons
									name="key-outline"
									size={18}
									color={COLORS.textSecondary}
								/>
								<TextInput
									style={styles.input}
									placeholder="Enter password"
									placeholderTextColor={COLORS.textSecondary}
									value={password}
									onChangeText={setPassword}
									secureTextEntry={!showPassword}
									autoCapitalize="none"
									autoCorrect={false}
									editable={!isLoading}
								/>
								<Pressable
									onPress={() =>
										setShowPassword(!showPassword)
									}
									style={styles.eyeButton}
								>
									<Ionicons
										name={showPassword ? "eye" : "eye-off"}
										size={18}
										color={COLORS.textSecondary}
									/>
								</Pressable>
							</View>
						</View>

						<Pressable
							style={[
								styles.loginButton,
								isLoading && styles.loginButtonDisabled,
							]}
							onPress={handleLogin}
							disabled={isLoading}
						>
							{isLoading ? (
								<ActivityIndicator
									size="small"
									color={COLORS.textLight}
								/>
							) : (
								<>
									<Ionicons
										name="log-in-outline"
										size={18}
										color={COLORS.textLight}
									/>
									<Text style={styles.loginButtonText}>
										Sign In
									</Text>
								</>
							)}
						</Pressable>

						<Pressable
							style={styles.backButton}
							onPress={onBackToLogin}
							disabled={isLoading}
						>
							<Ionicons
								name="chevron-back"
								size={18}
								color={COLORS.primary}
							/>
							<Text style={styles.backButtonText}>
								Back to User Login
							</Text>
						</Pressable>
					</View>
				</View>

				<View style={styles.securityNotice}>
					<Ionicons
						name="alert-circle-outline"
						size={18}
						color={COLORS.danger}
						style={styles.securityIcon}
					/>
					<View style={styles.securityTextWrap}>
						<Text style={styles.securityTitle}>
							Security notice
						</Text>
						<Text style={styles.securityText}>
							This area is intended for moderators only.
							Unauthorized access or misuse of moderation tools is
							prohibited.
						</Text>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#0F172A",
	},
	scrollContent: {
		flexGrow: 1,
		paddingHorizontal: SPACING.lg,
		paddingTop: SPACING.lg,
		paddingBottom: SPACING.xxl,
	},
	topBadge: {
		alignSelf: "flex-start",
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 999,
		backgroundColor: "rgba(255,255,255,0.12)",
		marginBottom: SPACING.xl,
	},
	topBadgeText: {
		fontSize: FONT_SIZES.xs,
		fontWeight: "700",
		color: COLORS.textLight,
	},
	header: {
		marginBottom: SPACING.xl,
	},
	heroIconWrap: {
		width: 64,
		height: 64,
		borderRadius: 20,
		backgroundColor: "rgba(255,255,255,0.12)",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: SPACING.lg,
	},
	title: {
		fontSize: 32,
		fontWeight: "700",
		color: COLORS.textLight,
		marginBottom: SPACING.sm,
	},
	subtitle: {
		fontSize: FONT_SIZES.sm,
		lineHeight: 22,
		color: "rgba(255,255,255,0.75)",
	},
	card: {
		backgroundColor: COLORS.background,
		borderRadius: 24,
		padding: SPACING.lg,
		marginBottom: SPACING.lg,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.12,
		shadowRadius: 14,
		elevation: 6,
	},
	cardHeader: {
		marginBottom: SPACING.lg,
	},
	cardTitle: {
		fontSize: FONT_SIZES.lg,
		fontWeight: "700",
		color: COLORS.primary,
		marginBottom: 4,
	},
	cardSubtitle: {
		fontSize: FONT_SIZES.sm,
		color: COLORS.textSecondary,
	},
	form: {
		gap: SPACING.md,
	},
	inputGroup: {
		gap: 8,
	},
	label: {
		fontSize: FONT_SIZES.sm,
		fontWeight: "600",
		color: COLORS.primary,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		height: 56,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: COLORS.border,
		backgroundColor: "#F8FAFC",
		paddingHorizontal: 14,
		gap: 10,
	},
	input: {
		flex: 1,
		fontSize: FONT_SIZES.base,
		color: COLORS.text,
		padding: 0,
	},
	eyeButton: {
		padding: 4,
	},
	loginButton: {
		marginTop: SPACING.sm,
		height: 56,
		borderRadius: 16,
		backgroundColor: COLORS.primary,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
	},
	loginButtonDisabled: {
		opacity: 0.7,
	},
	loginButtonText: {
		fontSize: FONT_SIZES.base,
		fontWeight: "700",
		color: COLORS.textLight,
	},
	backButton: {
		height: 52,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: COLORS.border,
		backgroundColor: "#F8FAFC",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
	},
	backButtonText: {
		fontSize: FONT_SIZES.sm,
		fontWeight: "600",
		color: COLORS.primary,
	},
	securityNotice: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: SPACING.sm,
		padding: SPACING.md,
		borderRadius: 18,
		backgroundColor: "#FFF1F2",
		borderWidth: 1,
		borderColor: "#FECDD3",
	},
	securityIcon: {
		marginTop: 2,
	},
	securityTextWrap: {
		flex: 1,
	},
	securityTitle: {
		fontSize: FONT_SIZES.sm,
		fontWeight: "700",
		color: COLORS.danger,
		marginBottom: 4,
	},
	securityText: {
		fontSize: FONT_SIZES.xs,
		lineHeight: 18,
		color: COLORS.danger,
	},
});
