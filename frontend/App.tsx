import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StripeProvider } from "@stripe/stripe-react-native";
import { AuthProvider } from "./src/contexts";
import { SearchProvider } from "./src/contexts/SearchContexts";
import AppNavigator from "./src/navigation/AppNavigator";
import { ThemeProvider, useTheme } from "./src/contexts/ThemeContext";

export default function App() {
	const [isAuthed, setIsAuthed] = useState(false);
	const [userName, setUserName] = useState("");
	const [isModerator, setIsModerator] = useState(false);
	const [justSignedUp, setJustSignedUp] = useState(false);

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
		setJustSignedUp(true);
	};

	const handleSignOut = () => {
		setUserName("");
		setIsModerator(false);
		setIsAuthed(false);
		setJustSignedUp(false);
	};

	return (
		<SafeAreaProvider>
			<ThemeProvider>
				<StripeProvider publishableKey="pk_test_placeholder">
					<SearchProvider>
						<AuthProvider>
							<AppContent
								isAuthed={isAuthed}
								userName={userName}
								isModerator={isModerator}
								justSignedUp={justSignedUp}
								setJustSignedUp={setJustSignedUp}
								onLogin={handleLogin}
								onModeratorLogin={handleModeratorLogin}
								onCreateAccount={handleCreateAccount}
								onSignOut={handleSignOut}
							/>
						</AuthProvider>
					</SearchProvider>
				</StripeProvider>
			</ThemeProvider>
		</SafeAreaProvider>
	);
}

function AppContent(props: any) {
  const { themeName } = useTheme();
  return (
    <>
      <AppNavigator {...props} />
      <StatusBar style={themeName === "dark" ? "light" : "dark"} />
    </>
  );
}
