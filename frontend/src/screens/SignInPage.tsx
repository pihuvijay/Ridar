import React, { useState } from "react";
import type { JSX } from "react";
import { saveToken, getToken } from "../utils/authStorage";
import { authService, userService } from "../services/api";
import { LinearGradient } from "expo-linear-gradient";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	ScrollView,
	Image,
	StyleSheet,
	ActivityIndicator,
	Alert,
} from "react-native";
import { COLORS } from "../theme/colors";

interface SignInPageProps {
	onSignUp?: () => void;
	onForgotPassword?: () => void;
	onModeratorLogin?: () => void;
	onLogin: (name: string) => void;
}

export const SignInPage = ({
	onSignUp,
	onForgotPassword,
	onModeratorLogin,
	onLogin,
}: SignInPageProps): JSX.Element => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);
	const [isSigningIn, setIsSigningIn] = useState(false);

	// const handleSubmit = async () => {
	// 	if (!email || !password) {
	// 		Alert.alert(
	// 			"Missing Fields",
	// 			"Please enter both email and password",
	// 		);
	// 		return;
	// 	}

	// 	setIsSigningIn(true);

	// 	try {
	// 		const response = await authService.signIn({ email, password });

	// 		if (!response.success) {
	// 			Alert.alert(
	// 				"Login Failed",
	// 				response.message || "Invalid credentials",
	// 			);
	// 			return;
	// 		}

	// 		if (response.token) {
	// 			await saveToken(response.token);
	// 		}

	// 		let name =
	// 			response.data?.user?.full_name ??
	// 			response.data?.user?.name ??
	// 			response.data?.email ??
	// 			email.split("@")[0] ??
	// 			"User";

	// 		try {
	// 			const me = await userService.me();

	// 			if (!("success" in me && me.success === false)) {
	// 				name =
	// 					me.data?.profile?.full_name ??
	// 					me.data?.profile?.name ??
	// 					me.data?.email ??
	// 					name;
	// 			}
	// 		} catch (e) {
	// 			console.log("[SignInPage] /users/me failed, continuing anyway");
	// 		}

	// 		onLogin(name);
	// 	} catch (error) {
	// 		Alert.alert(
	// 			"Login Error",
	// 			error instanceof Error ? error.message : "Failed to sign in",
	// 		);
	// 	} finally {
	// 		setIsSigningIn(false);
	// 	}
	// };

	const handleSubmit = async () => {
		if (!email || !password) {
			Alert.alert(
				"Missing Fields",
				"Please enter both email and password",
			);
			return;
		}

		setIsSigningIn(true);
		console.log("1️⃣ Starting login request");

		try {
			const response = await authService.signIn({ email, password });

			console.log("2️⃣ Login response received:", response);

			if (!response.success) {
				Alert.alert(
					"Login Failed",
					response.message || "Invalid credentials",
				);
				return;
			}

			if (response.token) {
				console.log("3️⃣ Saving token");
				await saveToken(response.token);
			}

			console.log("4️⃣ Calling onLogin");
			onLogin(email.split("@")[0]);
		} catch (error) {
			console.log("❌ Login error:", error);
			Alert.alert(
				"Login Error",
				error instanceof Error ? error.message : "Failed to sign in",
			);
		} finally {
			console.log("5️⃣ Finished login flow");
			setIsSigningIn(false);
		}
	};

	const handleSignUp = () => {
		if (onSignUp) onSignUp();
	};

	const handleForgotPassword = () => {
		if (onForgotPassword) onForgotPassword();
	};

	const handleModeratorLogin = () => {
		if (onModeratorLogin) onModeratorLogin();
	};

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={styles.contentContainer}
		>
			<LinearGradient
				colors={[COLORS.primary, "#2d7a52"]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={styles.gradientContainer}
			>
				<View style={styles.contentWrapper}>
					<View style={styles.header}>
						<View style={styles.logoPlaceholder}>
							<Image
								source={require("../../assets/RidarLogo.jpeg")}
								style={styles.logoImage}
							/>
						</View>
						<Text style={styles.appTitle}>RideShare</Text>
						<Text style={styles.appSubtitle}>
							Connect. Share. Arrive.
						</Text>
					</View>

					<View style={styles.card}>
						<Text style={styles.welcomeText}>Welcome Back</Text>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>Email</Text>
							<View style={styles.inputContainer}>
								<Text style={styles.inputIcon}>✉️</Text>
								<TextInput
									style={styles.input}
									placeholder="you@example.com"
									placeholderTextColor={COLORS.textSecondary}
									value={email}
									onChangeText={setEmail}
									keyboardType="email-address"
									autoCapitalize="none"
									accessibilityLabel="Email address"
								/>
							</View>
						</View>

						<View style={styles.inputGroup}>
							<Text style={styles.label}>Password</Text>
							<View style={styles.inputContainer}>
								<Text style={styles.inputIcon}>🔒</Text>
								<TextInput
									style={styles.input}
									placeholder="••••••••"
									placeholderTextColor={COLORS.textSecondary}
									value={password}
									onChangeText={setPassword}
									secureTextEntry
									accessibilityLabel="Password"
								/>
							</View>
						</View>

						<View style={styles.optionsRow}>
							<View style={styles.rememberMeContainer}>
								<TouchableOpacity
									onPress={() => setRememberMe(!rememberMe)}
									style={styles.checkbox}
									accessibilityLabel="Remember me"
								>
									<Text style={styles.checkboxInner}>
										{rememberMe ? "✓" : ""}
									</Text>
								</TouchableOpacity>
								<Text style={styles.rememberMeText}>
									Remember me
								</Text>
							</View>

							<TouchableOpacity onPress={handleForgotPassword}>
								<Text style={styles.forgotPasswordText}>
									Forgot password?
								</Text>
							</TouchableOpacity>
						</View>

						<TouchableOpacity
							style={[
								styles.signInButton,
								isSigningIn && styles.signInButtonDisabled,
							]}
							onPress={handleSubmit}
							disabled={isSigningIn}
							activeOpacity={0.8}
						>
							{isSigningIn ? (
								<ActivityIndicator
									size="small"
									color="#ffffff"
								/>
							) : (
								<Text style={styles.signInButtonText}>
									Sign In
								</Text>
							)}
						</TouchableOpacity>

						<View style={styles.signUpPrompt}>
							<Text style={styles.signUpPromptText}>
								Don't have an account?
							</Text>
							<TouchableOpacity onPress={handleSignUp}>
								<Text style={styles.signUpLink}>Sign up</Text>
							</TouchableOpacity>
						</View>

						<View style={styles.moderatorSection}>
							<TouchableOpacity
								style={styles.moderatorButton}
								onPress={handleModeratorLogin}
							>
								<Text style={styles.moderatorIcon}>👮</Text>
								<Text style={styles.moderatorText}>
									Moderator Login
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</LinearGradient>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	contentContainer: {
		flexGrow: 1,
	},
	gradientContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 20,
	},
	contentWrapper: {
		width: "85%",
		maxWidth: 345,
		alignItems: "center",
	},
	header: {
		alignItems: "center",
		marginBottom: 32,
	},
	logoPlaceholder: {
		width: 104,
		height: 104,
		borderRadius: 52,
		backgroundColor: "#fff",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 16,
		overflow: "hidden",
	},
	logoImage: {
		width: 104,
		height: 104,
		resizeMode: "cover",
	},
	appTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#fff",
		marginBottom: 8,
	},
	appSubtitle: {
		fontSize: 16,
		color: COLORS.textLightSecondary,
	},
	card: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 32,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 25 },
		shadowOpacity: 0.1,
		shadowRadius: 50,
		elevation: 10,
		width: "100%",
	},
	welcomeText: {
		fontSize: 16,
		fontWeight: "600",
		color: COLORS.primary,
		marginBottom: 24,
	},
	inputGroup: {
		marginBottom: 16,
	},
	label: {
		fontSize: 14,
		fontWeight: "500",
		color: COLORS.primary,
		marginBottom: 8,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1.64,
		borderColor: COLORS.border,
		borderRadius: 10,
		paddingHorizontal: 12,
		height: 51,
	},
	inputIcon: {
		fontSize: 18,
		marginRight: 8,
	},
	input: {
		flex: 1,
		fontSize: 14,
		color: COLORS.text,
	},
	optionsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	rememberMeContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	checkbox: {
		width: 20,
		height: 20,
		borderWidth: 2,
		borderColor: COLORS.border,
		borderRadius: 4,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 8,
	},
	checkboxInner: {
		fontSize: 14,
		color: COLORS.primary,
		fontWeight: "bold",
	},
	rememberMeText: {
		fontSize: 13,
		color: COLORS.textSecondary,
		marginLeft: 0,
	},
	forgotPasswordText: {
		fontSize: 13,
		color: COLORS.primary,
		textDecorationLine: "underline",
	},
	signInButton: {
		backgroundColor: COLORS.primary,
		borderRadius: 10,
		padding: 12,
		alignItems: "center",
		marginBottom: 24,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	signInButtonDisabled: {
		backgroundColor: "#d1d5dc",
		opacity: 0.6,
	},
	signInButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	signUpPrompt: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		paddingTop: 16,
		borderTopWidth: 1.64,
		borderTopColor: COLORS.border,
		marginBottom: 16,
	},
	signUpPromptText: {
		fontSize: 14,
		color: COLORS.textSecondary,
		marginRight: 4,
	},
	signUpLink: {
		fontSize: 14,
		fontWeight: "600",
		color: COLORS.primary,
		textDecorationLine: "underline",
	},
	moderatorSection: {
		paddingTop: 8,
		borderTopWidth: 1.64,
		borderTopColor: COLORS.border,
	},
	moderatorButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	moderatorIcon: {
		fontSize: 18,
		marginRight: 8,
	},
	moderatorText: {
		fontSize: 14,
		color: COLORS.textSecondary,
	},
});
