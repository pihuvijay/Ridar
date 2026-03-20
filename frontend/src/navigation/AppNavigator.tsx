import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthStack from "./AuthStack";
import MainTabs from "./MainTabs";

import { CreateGroupPage } from "../screens/CreateGroupPage";
import { RideJoiningScreen } from "../screens/RideJoiningScreen";
import { WaitScreen } from "../screens/WaitScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { ConnectAccountsPage } from "../screens/ConnectAccountsPage";
import { ModeratorLoginScreen } from "../screens/ModeratorLoginScreen";
import { ModeratorDashboard } from "../screens/ModeratorDashboard";
import { RideInsightsScreen } from "../screens/RideInsightsScreen";

export type RootStackParamList = {
	MainTabs: undefined;
	CreateGroup: undefined;
	RideJoining: { rideGroup: any };
	Wait: { rideGroup?: any; uberRide?: any } | undefined;
	Settings: undefined;
	ConnectAccounts: undefined;
	ModeratorLogin: undefined;
	ModeratorDashboard: undefined;
	RideInsights: { rideGroup?: any } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type AppNavigatorProps = {
	isAuthed: boolean;
	isModerator: boolean;
	userName: string;
	justSignedUp?: boolean;
	setJustSignedUp?: (v: boolean) => void;
	onLogin: (name: string) => void;
	onModeratorLogin: () => void;
	onCreateAccount: () => void;
	onSignOut: () => void;
};

export default function AppNavigator({
	isAuthed,
	isModerator,
	userName,
	justSignedUp,
	setJustSignedUp,
	onLogin,
	onModeratorLogin,
	onCreateAccount,
	onSignOut,
}: AppNavigatorProps) {
	if (!isAuthed) {
		return (
			<NavigationContainer>
				<AuthStack
					onLogin={onLogin}
					onModeratorLogin={onModeratorLogin}
					onCreateAccount={onCreateAccount}
				/>
			</NavigationContainer>
		);
	}

	// If just signed up, start at ConnectAccounts, otherwise normal logic
	const initialRoute = isModerator
		? "ModeratorDashboard"
		: justSignedUp
			? "ConnectAccounts"
			: "MainTabs";

	return (
		<NavigationContainer>
			<Stack.Navigator
				screenOptions={{ headerShown: false }}
				initialRouteName={initialRoute}
			>
				<Stack.Screen name="MainTabs">
					{({ navigation }) => (
						<MainTabs
							userName={userName}
							onCreateRideGroup={() =>
								navigation.navigate("CreateGroup")
							}
							onJoinRide={(rideGroup) =>
								navigation.navigate("RideJoining", {
									rideGroup,
								})
							}
							onViewSettings={() =>
								navigation.navigate("Settings")
							}
						/>
					)}
				</Stack.Screen>

				<Stack.Screen name="CreateGroup">
					{({ navigation }) => (
						<CreateGroupPage
							onBack={() => navigation.goBack()}
							userGender={"female"} // replace with real user gender from your profile/session
							onCreateGroup={(rideData: any) => {
								const { uberRide, ...rideGroup } = rideData;
								navigation.navigate("Wait", { rideGroup, uberRide });
							}}
						/>
					)}
				</Stack.Screen>

				<Stack.Screen name="RideJoining">
					{({ navigation, route }) => (
						<RideJoiningScreen
							userName={userName}
							rideGroup={route.params.rideGroup}
							messages={[]}
							onSendMessage={() => {}}
							onBack={() => navigation.goBack()}
							onViewSettings={() =>
								navigation.navigate("Settings")
							}
							onPartyFull={() =>
								navigation.navigate("Wait", {
									rideGroup: route.params.rideGroup,
								})
							}
						/>
					)}
				</Stack.Screen>

				<Stack.Screen name="Wait">
					{({ navigation, route }) => (
						<WaitScreen
							rideGroup={route.params?.rideGroup}
							uberRide={route.params?.uberRide}
							onContinue={() =>
								navigation.navigate("RideInsights", {
									rideGroup: route.params?.rideGroup,
								})
							}
						/>
					)}
				</Stack.Screen>

				<Stack.Screen name="RideInsights">
					{({ navigation, route }) => (
						<RideInsightsScreen
							rideGroup={route.params?.rideGroup}
							onAddReport={() => {}}
							onDone={() => navigation.navigate("MainTabs")}
						/>
					)}
				</Stack.Screen>

				<Stack.Screen name="ConnectAccounts">
					{({ navigation }) => (
						<ConnectAccountsPage
							onNavigateHome={() => {
								if (setJustSignedUp) setJustSignedUp(false);
								navigation.navigate("MainTabs");
							}}
						/>
					)}
				</Stack.Screen>

				<Stack.Screen name="ModeratorDashboard">
					{({ navigation }) => (
						<ModeratorDashboard
							reports={[]}
							onUpdateReport={() => {}}
							onLogout={() => navigation.replace("MainTabs")}
						/>
					)}
				</Stack.Screen>

				<Stack.Screen name="Settings">
					{({ navigation }) => (
						<SettingsScreen
							onBack={() => navigation.goBack()}
							onLogout={onSignOut}
						/>
					)}
				</Stack.Screen>
			</Stack.Navigator>
		</NavigationContainer>
	);
}
