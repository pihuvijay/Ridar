import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StripeProvider } from "@stripe/stripe-react-native";
import { AuthProvider } from "./src/contexts";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
	const [isAuthed, setIsAuthed] = useState(false);
	const [userName, setUserName] = useState("");

	const handleLogin = (name: string) => {
		setUserName(name);
		setIsAuthed(true);
	};

	const handleModeratorLogin = () => {
		setUserName("Moderator");
		setIsAuthed(true);
	};

	const handleCreateAccount = () => {
		setUserName("User");
		setIsAuthed(true);
	};

	const handleSignOut = () => {
		setUserName("");
		setIsAuthed(false);
	};

	return (
		<SafeAreaProvider>
			<StripeProvider publishableKey="pk_test_placeholder">
				<AuthProvider>
					<AppNavigator
						isAuthed={isAuthed}
						userName={userName}
						onLogin={handleLogin}
						onModeratorLogin={handleModeratorLogin}
						onCreateAccount={handleCreateAccount}
						onSignOut={handleSignOut}
					/>
					<StatusBar style="light" />
				</AuthProvider>
			</StripeProvider>
		</SafeAreaProvider>
	);
}
