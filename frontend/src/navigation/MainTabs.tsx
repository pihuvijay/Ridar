import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
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
	onCreateRideGroup: () => void;
	onJoinRide: (rideGroup: any) => void;
	onViewSettings: () => void;
};

export default function MainTabs({
	userName,
	onCreateRideGroup,
	onJoinRide,
	onViewSettings,
}: MainTabsProps) {
	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				headerShown: false,
				tabBarStyle: {
					height: 84,
					paddingTop: 8,
					paddingBottom: 18,
					backgroundColor: "#ffffff",
					borderTopWidth: 1,
					borderTopColor: "#e5e7eb",
				},
				tabBarItemStyle: {
					paddingVertical: 2,
				},
				sceneStyle: {
					backgroundColor: "#ffffff",
				},
				tabBarActiveTintColor: "#1B5E20",
				tabBarInactiveTintColor: "#8b8b8b",
				tabBarIcon: ({ color, size }) => {
					if (route.name === "Map") {
						return (
							<Ionicons
								name="map-outline"
								size={size}
								color={color}
							/>
						);
					}
					if (route.name === "RideGroups") {
						return (
							<Ionicons
								name="people-outline"
								size={size}
								color={color}
							/>
						);
					}
					return (
						<Ionicons
							name="person-outline"
							size={size}
							color={color}
						/>
					);
				},
			})}
		>
			<Tab.Screen name="Map">
				{({ navigation }) => (
					<MapScreen
						userName={userName}
						onViewRideGroups={() =>
							navigation.navigate("RideGroups")
						}
						onCreateRideGroup={onCreateRideGroup}
						onSettingsPress={onViewSettings}
					/>
				)}
			</Tab.Screen>

			<Tab.Screen name="RideGroups" options={{ title: "Ride Groups" }}>
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
