import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SignInPage } from "../screens/SignInPage";
import { SignUpPage } from "../screens/SignUpPage";
import { ModeratorLoginScreen } from "../screens/ModeratorLoginScreen";

export type AuthStackParamList = {
	SignIn: undefined;
	SignUp: undefined;
	ModeratorLogin: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

type AuthStackProps = {
	onLogin: (name: string) => void;
	onModeratorLogin: () => void;
	onCreateAccount: () => void;
};

export default function AuthStack({
	onLogin,
	onModeratorLogin,
	onCreateAccount,
}: AuthStackProps) {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name="SignIn">
				{({ navigation }) => (
					<SignInPage
						onSignUp={() => navigation.navigate("SignUp")}
						onModeratorLogin={() =>
							navigation.navigate("ModeratorLogin")
						}
						onLogin={onLogin}
					/>
				)}
			</Stack.Screen>

			<Stack.Screen name="SignUp">
				{({ navigation }) => (
					<SignUpPage
						onSignIn={() => navigation.navigate("SignIn")}
						onCreateAccount={onCreateAccount}
					/>
				)}
			</Stack.Screen>

			<Stack.Screen name="ModeratorLogin">
				{({ navigation }) => (
					<ModeratorLoginScreen
						onLogin={onModeratorLogin}
						onBackToLogin={() => navigation.goBack()}
					/>
				)}
			</Stack.Screen>
		</Stack.Navigator>
	);
}
