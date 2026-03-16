import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StripeProvider } from "@stripe/stripe-react-native";
import { AuthProvider } from "./src/contexts";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
	const [isAuthed, setIsAuthed] = useState(false);
	const [userName, setUserName] = useState("");
	const [isModerator, setIsModerator] = useState(false);

	const handleLogin = (name: string) => {
		setUserName(name);
		setIsModerator(false);
		setIsAuthed(true);
	};

	const handleModeratorLogin = () => {
		setUserName("Moderator");
		setIsModerator(true);
		setIsAuthed(true);
	};

	const handleCreateAccount = () => {
		setUserName("User");
		setIsModerator(false);
		setIsAuthed(true);
	};

	const handleSignOut = () => {
		setUserName("");
		setIsModerator(false);
		setIsAuthed(false);
	};

	return (
		<SafeAreaProvider>
			<StripeProvider publishableKey="pk_test_placeholder">
				<AuthProvider>
					<AppNavigator
						isAuthed={isAuthed}
						userName={userName}
						isModerator={isModerator}
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
