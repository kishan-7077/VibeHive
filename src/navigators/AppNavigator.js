import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import { ActivityIndicator, View } from "react-native";
import BottomNavigator from "./BottomNavigator.js";
import ChatScreen from "../screens/ChatScreen.js";
import CommentsScreen from "../screens/CommentsScreen.js";
import UserProfileScreen from "../screens/UserProfileScreen.js";
import ChatListScreen from "../screens/ChatListScreen.js";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
	const { userToken, loading } = useAuth();
	console.log(userToken);
	if (loading) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return (
		<NavigationContainer>
			<Stack.Navigator screenOptions={{ headerShown: false }}>
				{userToken ? (
					// Protected route (Profile screen) when the user is logged in
					<>
						<Stack.Screen name="Main" component={BottomNavigator} />
						<Stack.Screen name="Chat" component={ChatScreen} />
						<Stack.Screen name="ChatList" component={ChatListScreen} />
						<Stack.Screen name="Comment" component={CommentsScreen} />
						<Stack.Screen name="UserProfile" component={UserProfileScreen} />
					</>
				) : (
					// Public routes (Login and Signup screens) when the user is not logged in
					<>
						<Stack.Screen
							name="Login"
							component={LoginScreen}
							// options={{ headerLeft: null }}
						/>
						<Stack.Screen
							name="Signup"
							component={SignupScreen}
							// options={{ headerLeft: null }}
						/>
					</>
				)}
			</Stack.Navigator>
		</NavigationContainer>
	);
};

export default AppNavigator;
