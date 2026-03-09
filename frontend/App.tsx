import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { View, Text, Button } from "react-native";
import { getToken, clearToken } from "./src/utils/authStorage";
import { userService } from "./src/services/api";
import { SignInPage } from "./src/screens/SignInPage";
import { SignUpPage } from "./src/screens/SignUpPage";
import { CreateGroupPage } from "./src/screens/CreateGroupPage";

type Screen = "signin" | "signup" | "connectaccounts" | "map" | "creategroup";

/**
 * Temporary placeholder screen for Expo Go
 * (Stripe needs a Dev Client, so we can't render ConnectAccountsPage here yet)
 */
function ConnectAccountsPlaceholder({
	onNavigateHome,
	onBack,
}: {
	onNavigateHome: () => void;
	onBack: () => void;
}) {
	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
				padding: 24,
			}}
		>
			<Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
				Connect Accounts (Temp)
			</Text>
			<Text style={{ textAlign: "center", marginBottom: 16 }}>
				Stripe is disabled in Expo Go. This is a placeholder so you can
				test the rest of the app (sign in, sign up, API calls).
			</Text>

			<View style={{ width: "100%", gap: 12 }}>
				<Button
					title="Continue to Map (placeholder)"
					onPress={onNavigateHome}
				/>
				<Button title="Back" onPress={onBack} />
			</View>
		</View>
	);
}

/**
 * Temporary placeholder for Map screen
 * (react-native-maps needs a Dev Client)
 */
function MapPlaceholder({
	onCreateGroup,
	onSignOut,
}: {
	onCreateGroup: () => void;
	onSignOut: () => void;
}) {
	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
				padding: 24,
			}}
		>
			<Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
				Map (Temp)
			</Text>
			<Text style={{ textAlign: "center", marginBottom: 16 }}>
				Map is disabled in Expo Go (react-native-maps needs a dev
				client).
			</Text>

			<View style={{ width: "100%", gap: 12 }}>
				<Button title="Create Ride Group" onPress={onCreateGroup} />
				<Button title="Sign Out" onPress={onSignOut} />
			</View>
		</View>
	);
}

export default function App() {
	const [currentScreen, setCurrentScreen] = useState<Screen>("signin");
	const [userName, setUserName] = useState<string>("");

	const [authReady, setAuthReady] = useState(false);
	const [isAuthed, setIsAuthed] = useState(false);

	useEffect(() => {
		const bootstrap = async () => {
			try {
				const token = await getToken();

				if (!token) {
					console.log("No saved token");
					setIsAuthed(false);
					setCurrentScreen("signin");
					return;
				}

				console.log("Token found, checking user");

				const me = await userService.me();

				if (me.success) {
					const name =
						me.data?.profile?.full_name ?? me.data?.email ?? "User";

					setUserName(name);
					setIsAuthed(true);
					setCurrentScreen("map");
					console.log("Auto login successful");
				} else {
					console.log("Token invalid, clearing");
					await clearToken();
					setIsAuthed(false);
					setCurrentScreen("signin");
				}
			} catch (err) {
				console.log("Auto login failed:", err);
				await clearToken();
				setIsAuthed(false);
				setCurrentScreen("signin");
			} finally {
				setAuthReady(true);
			}
		};

		bootstrap();
	}, []);

	const handleSignUp = () => setCurrentScreen("signup");
	const handleLogin = (name: string) => {
		setUserName(name);
		setIsAuthed(true);
		setCurrentScreen("connectaccounts");
	};
	const handleBackToSignIn = () => setCurrentScreen("signin");
	const handleCreateAccount = () => {
		setIsAuthed(true);
		setCurrentScreen("connectaccounts");
	};
	const handleAccountsConnected = () => setCurrentScreen("map");
	const handleSignOut = async () => {
		await clearToken();
		setIsAuthed(false);
		setUserName("");
		setCurrentScreen("signin");
	};
	const handleCreateRideGroup = () => setCurrentScreen("creategroup");
	const handleBackToMap = () => setCurrentScreen("map");
	const handleModeratorLogin = () => {
		setIsAuthed(true);
		setCurrentScreen("map");
	};

	const PROTECTED: Screen[] = ["connectaccounts", "map", "creategroup"];

	useEffect(() => {
		if (!authReady) return;

		if (!isAuthed && PROTECTED.includes(currentScreen)) {
			setIsAuthed(false);
			setCurrentScreen("signin");
		}
	}, [authReady, isAuthed, currentScreen]);

	if (!authReady) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<Text>Loading...</Text>
			</View>
		);
	}

	return (
		<>
			{currentScreen === "signin" ? (
				<SignInPage
					onSignUp={handleSignUp}
					onModeratorLogin={handleModeratorLogin}
					onLogin={handleLogin}
				/>
			) : currentScreen === "signup" ? (
				<SignUpPage
					onSignIn={handleBackToSignIn}
					onCreateAccount={handleCreateAccount}
				/>
			) : currentScreen === "connectaccounts" ? (
				<ConnectAccountsPlaceholder
					onNavigateHome={handleAccountsConnected}
					onBack={handleBackToSignIn}
				/>
			) : currentScreen === "creategroup" ? (
				<CreateGroupPage onBack={handleBackToMap} />
			) : (
				<MapPlaceholder
					onCreateGroup={handleCreateRideGroup}
					onSignOut={handleSignOut}
				/>
			)}

			<StatusBar style="auto" />
		</>
	);
}
