import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthStack from "./AuthStack";
import MainTabs from "./MainTabs";

import { CreateGroupPage } from "../screens/CreateGroupPage";
import { RideJoiningScreen } from "../screens/RideJoiningScreen";
import { WaitScreen } from "../screens/WaitScreen";
import { SettingsScreen } from "../screens/SettingsScreen";

export type RootStackParamList = {
	MainTabs: undefined;
	CreateGroup: undefined;
	RideJoining: { rideGroup: any };
	Wait: undefined;
	Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type AppNavigatorProps = {
	isAuthed: boolean;
	userName: string;

	onLogin: (name: string) => void;
	onModeratorLogin: () => void;
	onCreateAccount: () => void;
	onSignOut: () => void;
};

export default function AppNavigator({
	isAuthed,
	userName,
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

	return (
		<NavigationContainer>
			<Stack.Navigator screenOptions={{ headerShown: false }}>
				<Stack.Screen name="MainTabs">
					{({ navigation }) => (
						<MainTabs
							userName={userName}
							onSignOut={onSignOut}
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
							onCreateGroup={() => navigation.navigate("Wait")}
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
							onPartyFull={() => navigation.navigate("Wait")}
						/>
					)}
				</Stack.Screen>

				<Stack.Screen name="Wait">
					{({ navigation }) => (
						<WaitScreen
							onContinue={() => navigation.navigate("MainTabs")}
						/>
					)}
				</Stack.Screen>

				<Stack.Screen name="Settings">
					{({ navigation }) => (
						<SettingsScreen onBack={() => navigation.goBack()} />
					)}
				</Stack.Screen>
			</Stack.Navigator>
		</NavigationContainer>
	);
}
