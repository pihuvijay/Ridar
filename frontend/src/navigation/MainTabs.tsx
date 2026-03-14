import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MapScreen } from "../screens/MapScreen";
import { RideGroupsScreen } from "../screens/RideGroupsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";

export type MainTabParamList = {
	Map: undefined;
	RideGroups: undefined;
	Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

type MainTabsProps = {
	userName: string;
	onSignOut: () => void;
	onCreateRideGroup: () => void;
	onJoinRide: (rideGroup: any) => void;
	onViewSettings: () => void;
};

export default function MainTabs({
	userName,
	onSignOut,
	onCreateRideGroup,
	onJoinRide,
	onViewSettings,
}: MainTabsProps) {
	return (
		<Tab.Navigator screenOptions={{ headerShown: false }}>
			<Tab.Screen name="Map">
				{({ navigation }) => (
					<MapScreen
						userName={userName}
						onViewRideGroups={() =>
							navigation.navigate("RideGroups")
						}
						onCreateRideGroup={onCreateRideGroup}
						onProfilePress={() => navigation.navigate("Profile")}
						onSettingsPress={onViewSettings}
						onMenuPress={onSignOut}
					/>
				)}
			</Tab.Screen>

			<Tab.Screen name="RideGroups">
				{({ navigation }) => (
					<RideGroupsScreen
						onBack={() => navigation.navigate("Map")}
						userName={userName}
						onJoinRide={onJoinRide}
						onViewSettings={onViewSettings}
						onViewProfile={() => navigation.navigate("Profile")}
					/>
				)}
			</Tab.Screen>

			<Tab.Screen name="Profile">
				{({ navigation }) => (
					<ProfileScreen
						userName={userName}
						onBack={() => navigation.navigate("Map")}
						onUpdateProfile={() => {}}
						onViewSettings={onViewSettings}
					/>
				)}
			</Tab.Screen>
		</Tab.Navigator>
	);
}
