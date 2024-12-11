import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	FlatList,
	TouchableOpacity,
	StyleSheet,
	Image,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const ChatListScreen = () => {
	const { getUser } = useAuth();
	const [users, setUsers] = useState([]);
	const [currentUser, setCurrentUser] = useState(null);
	const [conversations, setConversations] = useState({});
	const navigation = useNavigation();

	// Fetch users and conversations
	const fetchData = async () => {
		try {
			const token = await AsyncStorage.getItem("token");
			const userResponse = await getUser();
			const userId = userResponse._id;
			setCurrentUser(userId);

			const response = await axios.get("http://192.168.1.15:5000/users/", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			// Filter out the logged-in user
			const filteredUsers = response.data.users.filter(
				(user) => user._id !== userId
			);
			setUsers(filteredUsers);

			// Fetch conversations for the current user
			const convos = {};
			for (const user of filteredUsers) {
				const messagesResponse = await axios.get(
					`http://192.168.1.15:5000/messages/${userId}/${user._id}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
				const messages = messagesResponse.data;
				if (messages.length > 0) {
					convos[user._id] = messages;
				}
			}
			setConversations(convos);
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	};

	// Fetch data when the screen is focused
	useFocusEffect(
		React.useCallback(() => {
			fetchData();
		}, [])
	);

	const renderItem = ({ item }) => {
		const conversation = conversations[item._id];
		const lastMessage = conversation
			? conversation[conversation.length - 1]
			: null;

		const formattedDate = lastMessage
			? new Date(lastMessage.timestamp).toLocaleDateString("en-GB", {
					day: "2-digit",
					month: "short", // Short month (e.g., Dec, Jan)
					year: "numeric", // Full year (e.g., 2024)
			  })
			: null;

		return (
			<TouchableOpacity
				style={styles.userContainer}
				onPress={() =>
					navigation.navigate("Chat", {
						userId: item._id,
						userName: item.name,
						currentUserId: currentUser,
					})
				}
			>
				<Image
					source={{
						uri: item.profileImage || "https://via.placeholder.com/150",
					}}
					style={styles.profileImage}
				/>
				<View style={styles.textContainer}>
					<Text style={styles.userName}>{item.name}</Text>
					{lastMessage ? (
						<View style={styles.messageContainer}>
							{/* Displaying message content */}
							<Text style={styles.lastMessage}>{lastMessage.content}</Text>
							{/* Displaying message date */}
							<Text style={styles.messageTime}>{formattedDate}</Text>
						</View>
					) : (
						<Text style={styles.userSubtitle}>Tap to chat</Text>
					)}
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<SafeAreaView style={styles.container}>
			<FlatList
				data={users}
				keyExtractor={(item) => item._id}
				renderItem={renderItem}
			/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		paddingHorizontal: 16,
		paddingTop: 8,
	},
	userContainer: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderColor: "#f0f0f0",
	},
	profileImage: {
		width: 50,
		height: 50,
		borderRadius: 25, // Circular image
		backgroundColor: "#ccc",
	},
	textContainer: {
		marginLeft: 12,
		justifyContent: "center",
		flex: 1, // Allow text container to take available space
	},
	userName: {
		fontSize: 18,
		fontWeight: "500",
		color: "#000",
	},
	userSubtitle: {
		fontSize: 14,
		color: "#888",
	},
	messageContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between", // Ensures date is on the right side
	},
	lastMessage: {
		fontSize: 14,
		color: "#555",
		flex: 1, // Allow message text to take space
		marginRight: 8, // Add some spacing to the right side before time
	},
	messageTime: {
		fontSize: 12,
		color: "#888",
		textAlign: "right", // Align time to the right
	},
});

export default ChatListScreen;
