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
} from "react-native";
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

		// Simulate network delay
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
				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.title}>Moderator Access</Text>
					<Text style={styles.subtitle}>
						Sign in with your admin credentials
					</Text>
				</View>

				{/* Info Card */}
				<View style={styles.infoCard}>
					<Text style={styles.infoTitle}>Demo Credentials:</Text>
					{ADMIN_ACCOUNTS.map((account, index) => (
						<View key={index} style={styles.infoRow}>
							<Text style={styles.infoLabel}>
								{account.username} / {account.password}
							</Text>
						</View>
					))}
				</View>

				{/* Form */}
				<View style={styles.form}>
					{/* Username Input */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Username</Text>
						<View style={styles.inputContainer}>
							<Text style={styles.inputIcon}>👤</Text>
							<TextInput
								style={styles.input}
								placeholder="Enter username"
								placeholderTextColor={COLORS.textSecondary}
								value={username}
								onChangeText={setUsername}
								editable={!isLoading}
							/>
						</View>
					</View>

					{/* Password Input */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Password</Text>
						<View style={styles.inputContainer}>
							<Text style={styles.inputIcon}>🔒</Text>
							<TextInput
								style={styles.input}
								placeholder="Enter password"
								placeholderTextColor={COLORS.textSecondary}
								value={password}
								onChangeText={setPassword}
								secureTextEntry={!showPassword}
								editable={!isLoading}
							/>
							<Pressable
								onPress={() => setShowPassword(!showPassword)}
								style={styles.eyeButton}
							>
								<Text style={styles.eyeIcon}>
									{showPassword ? "👁️" : "👁️‍🗨️"}
								</Text>
							</Pressable>
						</View>
					</View>

					{/* Login Button */}
					<Pressable
						style={[
							styles.loginButton,
							isLoading && styles.loginButtonDisabled,
						]}
						onPress={handleLogin}
						disabled={isLoading}
					>
						<Text style={styles.loginButtonText}>
							{isLoading ? "Signing in..." : "Sign In"}
						</Text>
					</Pressable>

					{/* Back Button */}
					<Pressable
						style={styles.backButton}
						onPress={onBackToLogin}
						disabled={isLoading}
					>
						<Text style={styles.backButtonText}>
							← Back to User Login
						</Text>
					</Pressable>
				</View>

				{/* Security Notice */}
				<View style={styles.securityNotice}>
					<Text style={styles.securityIcon}>⚠️</Text>
					<Text style={styles.securityText}>
						This is a restricted admin area. Unauthorized access is
						prohibited.
					</Text>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.primary,
	},
	scrollContent: {
		flexGrow: 1,
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.lg,
		gap: SPACING.lg,
	},
	header: {
		gap: SPACING.sm,
		marginTop: SPACING.xl,
		marginBottom: SPACING.md,
	},
	title: {
		fontSize: FONT_SIZES.xxxl,
		fontWeight: "700",
		color: COLORS.textLight,
	},
	subtitle: {
		fontSize: FONT_SIZES.base,
		color: COLORS.textLightSecondary,
	},
	infoCard: {
		backgroundColor: COLORS.background + "20",
		borderRadius: BORDER_RADIUS.lg,
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.md,
		gap: SPACING.sm,
		borderWidth: 1,
		borderColor: COLORS.textLight + "30",
	},
	infoTitle: {
		fontSize: FONT_SIZES.sm,
		fontWeight: "600",
		color: COLORS.textLight,
		marginBottom: SPACING.xs,
	},
	infoRow: {
		paddingVertical: SPACING.xs,
	},
	infoLabel: {
		fontSize: FONT_SIZES.xs,
		color: COLORS.textLightSecondary,
		fontFamily: "Courier New",
	},
	form: {
		gap: SPACING.md,
		marginVertical: SPACING.md,
	},
	inputGroup: {
		gap: SPACING.sm,
	},
	label: {
		fontSize: FONT_SIZES.sm,
		fontWeight: "600",
		color: COLORS.textLight,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderRadius: BORDER_RADIUS.lg,
		borderWidth: 1,
		borderColor: COLORS.textLight + "40",
		backgroundColor: COLORS.background,
		paddingHorizontal: SPACING.md,
		height: 56,
		gap: SPACING.sm,
	},
	inputIcon: {
		fontSize: FONT_SIZES.lg,
	},
	input: {
		flex: 1,
		fontSize: FONT_SIZES.base,
		color: COLORS.primary,
		padding: 0,
	},
	eyeButton: {
		padding: SPACING.sm,
	},
	eyeIcon: {
		fontSize: FONT_SIZES.lg,
	},
	loginButton: {
		paddingVertical: SPACING.lg,
		borderRadius: BORDER_RADIUS.lg,
		backgroundColor: COLORS.background,
		alignItems: "center",
		marginTop: SPACING.md,
	},
	loginButtonDisabled: {
		opacity: 0.6,
	},
	loginButtonText: {
		fontSize: FONT_SIZES.base,
		fontWeight: "700",
		color: COLORS.primary,
	},
	backButton: {
		paddingVertical: SPACING.lg,
		borderRadius: BORDER_RADIUS.lg,
		borderWidth: 2,
		borderColor: COLORS.textLight + "40",
		alignItems: "center",
	},
	backButtonText: {
		fontSize: FONT_SIZES.sm,
		fontWeight: "600",
		color: COLORS.textLight,
	},
	securityNotice: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: SPACING.sm,
		paddingHorizontal: SPACING.md,
		paddingVertical: SPACING.md,
		backgroundColor: COLORS.danger + "20",
		borderRadius: BORDER_RADIUS.lg,
		borderWidth: 1,
		borderColor: COLORS.danger + "40",
		marginBottom: SPACING.xl,
	},
	securityIcon: {
		fontSize: FONT_SIZES.lg,
		marginTop: SPACING.xs,
	},
	securityText: {
		flex: 1,
		fontSize: FONT_SIZES.xs,
		color: COLORS.danger,
		fontWeight: "500",
		lineHeight: 18,
	},
});
