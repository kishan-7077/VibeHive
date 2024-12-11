import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons, Feather, Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import AddScreen from "../screens/AddScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SearchScreen from "../screens/SearchScreen";

const Tab = createBottomTabNavigator();

const BottomNavigator = () => {
	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				headerShown: false,
				tabBarIcon: ({ color, size }) => {
					// Set a custom icon size
					const iconSize = 28;

					switch (route.name) {
						case "Home":
							return (
								<MaterialIcons name="home" size={iconSize} color={color} />
							);
						case "Search":
							return <Feather name="search" size={iconSize} color={color} />;
						case "Add":
							return (
								<Ionicons
									name="add-circle-outline"
									size={iconSize}
									color={color}
								/>
							);
						case "Profile":
							return (
								<MaterialIcons
									name="person-outline"
									size={iconSize}
									color={color}
								/>
							);
						default:
							return null;
					}
				},
				tabBarActiveTintColor: "#6200EE",
				tabBarInactiveTintColor: "gray",
				tabBarStyle: {
					height: 70, // Increase the height of the tab bar
					paddingBottom: 10, // Add padding at the bottom for better icon alignment
					paddingTop: 10, // Add padding at the top for spacing
					backgroundColor: "#fff", // Optional: Change the background color
					borderTopWidth: 1, // Optional: Add a border at the top
					borderTopColor: "#ddd", // Optional: Border color
				},
				tabBarLabelStyle: {
					marginTop: 4,
					fontSize: 12, // Adjust the font size of tab labels
					fontWeight: "bold",
				},
				tabBarIconStyle: {
					marginBottom: -5, // Adjust the position of the icons if needed
				},
			})}
		>
			<Tab.Screen name="Home" component={HomeScreen} />
			<Tab.Screen name="Search" component={SearchScreen} />
			<Tab.Screen name="Add" component={AddScreen} />
			<Tab.Screen name="Profile" component={ProfileScreen} />
		</Tab.Navigator>
	);
};

export default BottomNavigator;
