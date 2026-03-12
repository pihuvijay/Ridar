import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StripeProvider } from "@stripe/stripe-react-native";
import { AuthProvider } from "./src/contexts";
import { COLORS } from "./src/theme/colors";

// Screens
import { SignInPage } from "./src/screens/SignInPage";
import { SignUpPage } from "./src/screens/SignUpPage";
import { CreateGroupPage } from "./src/screens/CreateGroupPage";
import { ConnectAccountsPage } from "./src/screens/ConnectAccountsPage";
import { MapScreen } from "./src/screens/MapScreen";
import { RideGroupsScreen } from "./src/screens/RideGroupsScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { ModeratorLoginScreen } from "./src/screens/ModeratorLoginScreen";
import { ModeratorDashboard } from "./src/screens/ModeratorDashboard";
import { RideJoiningScreen } from "./src/screens/RideJoiningScreen";
import { WaitScreen } from "./src/screens/WaitScreen";
import { RideInsightsScreen } from "./src/screens/RideInsightsScreen";

interface ChatMessage {
	id: string;
	author: string;
	content: string;
	timestamp: string;
	isVerified: boolean;
}

type ReportStatus = "pending" | "approved" | "rejected" | "investigating";

interface Report {
	id: string;
	reporterName: string;
	reportedUserName: string;
	reason: string;
	timestamp: string;
	status: ReportStatus;
	description: string;
	evidence?: string;
}

const initialChatMessages: ChatMessage[] = [
	{
		id: "1",
		author: "Sarah M.",
		content:
			"Hey everyone! Heading to Downtown Financial District. Join the ride!",
		timestamp: "Just now",
		isVerified: true,
	},
];

const initialReports: Report[] = [];

type Screen =
	| "signin"
	| "signup"
	| "connectaccounts"
	| "map"
	| "ride-groups"
	| "create-ride"
	| "profile"
	| "settings"
	| "moderator-login"
	| "moderator-dashboard"
	| "ride-joining"
	| "wait-screen"
	| "ride-insights";

export default function App() {
	const [isLoading, setIsLoading] = useState(true);
	const [currentScreen, setCurrentScreen] = useState<Screen>("signin");
	const [userName, setUserName] = useState("");
	const [selectedRideGroup, setSelectedRideGroup] = useState<any>(null);
	const [chatMessages, setChatMessages] =
		useState<ChatMessage[]>(initialChatMessages);
	const [reports, setReports] = useState<Report[]>(initialReports);

	useEffect(() => {
		const timer = setTimeout(() => setIsLoading(false), 1500);
		return () => clearTimeout(timer);
	}, []);

	const handleLogin = (name: string) => {
		setUserName(name);
		setCurrentScreen("map");
	};

	const handleSignup = (name: string) => {
		setUserName(name);
		setCurrentScreen("connectaccounts");
	};

	const handleViewRideGroups = () => setCurrentScreen("ride-groups");
	const handleBackToMap = () => setCurrentScreen("map");
	const handleCreateRideGroup = () => setCurrentScreen("create-ride");

	const handleRideCreated = (rideData: any) => {
		setSelectedRideGroup(rideData);
		setCurrentScreen("ride-insights");
	};

	const handleJoinRide = (rideGroup: any) => {
		setSelectedRideGroup(rideGroup);
		setCurrentScreen("ride-joining");
	};

	const handleSendChatMessage = (text: string) => {
		const msg: ChatMessage = {
			id: Date.now().toString(),
			author: userName || "You",
			content: text,
			timestamp: "Just now",
			isVerified: false,
		};
		setChatMessages((prev) => [...prev, msg]);
	};

	const handleAddReport = (report: any) => {
		setReports((prev) => [...prev, report]);
	};

	if (isLoading) {
		return <View style={{ flex: 1, backgroundColor: COLORS.background }} />;
	}

	return (
		<SafeAreaProvider>
			<StripeProvider publishableKey="pk_test_placeholder">
				<AuthProvider>
					<View style={{ flex: 1, backgroundColor: COLORS.primary }}>
						{currentScreen === "signin" && (
							<SignInPage
								onLogin={handleLogin}
								onSignUp={() => setCurrentScreen("signup")}
							/>
						)}

						{currentScreen === "signup" && (
							<SignUpPage
								onSignIn={() => setCurrentScreen("signin")}
								onCreateAccount={() => handleSignup("User")}
							/>
						)}

						{currentScreen === "map" && (
							<MapScreen
								userName={userName}
								onViewRideGroups={handleViewRideGroups}
								onCreateRideGroup={handleCreateRideGroup}
							/>
						)}

						{currentScreen === "ride-groups" && (
							<RideGroupsScreen
								userName={userName}
								onBack={handleBackToMap}
								onJoinRide={handleJoinRide}
								onViewSettings={() =>
									setCurrentScreen("settings")
								}
								onViewProfile={() =>
									setCurrentScreen("profile")
								}
							/>
						)}

						{currentScreen === "create-ride" && (
							<CreateGroupPage
								onBack={handleBackToMap}
								onCreateGroup={handleRideCreated}
							/>
						)}

						{currentScreen === "ride-joining" &&
							selectedRideGroup && (
								<RideJoiningScreen
									userName={userName}
									rideGroup={selectedRideGroup}
									messages={chatMessages}
									onSendMessage={handleSendChatMessage}
									onBack={() =>
										setCurrentScreen("ride-groups")
									}
									onViewSettings={() =>
										setCurrentScreen("settings")
									}
									onPartyFull={(rideGroup) => {
										setSelectedRideGroup(rideGroup);
										setCurrentScreen("wait-screen");
									}}
								/>
							)}

						{currentScreen === "wait-screen" && (
							<WaitScreen
								onContinue={() =>
									setCurrentScreen("ride-insights")
								}
							/>
						)}

						{currentScreen === "ride-insights" && (
							<RideInsightsScreen
								rideGroup={selectedRideGroup}
								onAddReport={handleAddReport}
								onDone={() => setCurrentScreen("map")}
							/>
						)}

						<StatusBar style="light" />
					</View>
				</AuthProvider>
			</StripeProvider>
		</SafeAreaProvider>
	);
}
