import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text } from "react-native";

import { getToken, clearToken } from "./src/utils/authStorage";
import { userService } from "./src/services/api";

import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
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
					return;
				}

				console.log("Token found, checking user");

				const me = await userService.me();

				if (me.success) {
					const name =
						me.data?.profile?.full_name ?? me.data?.email ?? "User";

					setUserName(name);
					setIsAuthed(true);
					console.log("Auto login successful");
				} else {
					await clearToken();
					setIsAuthed(false);
				}
			} catch (err) {
				console.log("Auto login failed:", err);
				await clearToken();
				setIsAuthed(false);
			} finally {
				setAuthReady(true);
			}
		};

		bootstrap();
	}, []);

	const handleLogin = (name: string) => {
		setUserName(name);
		setIsAuthed(true);
	};

	const handleCreateAccount = () => {
		setIsAuthed(true);
	};

	const handleSignOut = async () => {
		await clearToken();
		setUserName("");
		setIsAuthed(false);
	};

	const handleModeratorLogin = () => {
		setIsAuthed(true);
	};

	if (!authReady) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					backgroundColor: "#2B7FFF",
					paddingHorizontal: 24,
				}}
			>
				<View
					style={{
						width: 100,
						height: 100,
						borderRadius: 50,
						backgroundColor: "#ffffff",
						justifyContent: "center",
						alignItems: "center",
						marginBottom: 20,
					}}
				>
					<Text style={{ fontSize: 42 }}>🚗</Text>
				</View>

				<Text
					style={{
						fontSize: 24,
						fontWeight: "700",
						color: "#ffffff",
						marginBottom: 8,
					}}
				>
					Ridar
				</Text>

				<Text
					style={{
						fontSize: 14,
						color: "#e6f0ff",
						textAlign: "center",
					}}
				>
					Student carpooling made easy
				</Text>
			</View>
		);
	}

	return (
		<>
			<AppNavigator
				isAuthed={isAuthed}
				userName={userName}
				onLogin={handleLogin}
				onCreateAccount={handleCreateAccount}
				onModeratorLogin={handleModeratorLogin}
				onSignOut={handleSignOut}
			/>

			<StatusBar style="auto" />
		</>
	);
}
