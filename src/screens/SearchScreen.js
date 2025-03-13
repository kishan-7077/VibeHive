import React, { useState, useEffect } from "react";
import {
	Text,
	TextInput,
	FlatList,
	Image,
	TouchableOpacity,
	StyleSheet,
	ActivityIndicator,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { API_URL } from "@env";

const SearchScreen = ({ navigation }) => {
	const [query, setQuery] = useState("");
	const [users, setUsers] = useState([]);
	const [filteredUsers, setFilteredUsers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchUsers = async () => {
		setLoading(true);
		try {
			const response = await axios.get(`${API_URL}/users/`, {
				headers: {
					Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
				},
			});

			if (response.data && Array.isArray(response.data.users)) {
				setUsers(response.data.users);
				setFilteredUsers(response.data.users);
				setError(null);
			} else {
				throw new Error("Invalid response structure.");
			}
		} catch (err) {
			console.error("Error fetching users:", err);
			setError("Failed to fetch users. Please try again.");
		} finally {
			setLoading(false);
		}
	};
	// Fetch user data from the backend when the component mounts
	useEffect(() => {
		fetchUsers();
	}, []);

	useFocusEffect(
		useCallback(() => {
			fetchUsers();
		}, [])
	);

	// Handle search query change
	const handleSearch = (text) => {
		setQuery(text);

		if (text.trim() === "") {
			setFilteredUsers(users);
		} else {
			const filtered = users.filter((user) =>
				user.name.toLowerCase().includes(text.toLowerCase())
			);
			setFilteredUsers(filtered);
		}
	};

	// Handle follow/unfollow action
	const handleFollowUnfollow = async (userId, isFollowing) => {
		try {
			const url = isFollowing
				? `${API_URL}/users/unfollow/${userId}`
				: `${API_URL}/users/follow/${userId}`;

			const token = await AsyncStorage.getItem("token");

			const response = await axios.post(
				url,
				{},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			console.log("Follow/Unfollow response:", response.data);

			setUsers((prevUsers) =>
				prevUsers.map((user) =>
					user._id === userId ? { ...user, isFollowing: !isFollowing } : user
				)
			);
			setFilteredUsers((prevUsers) =>
				prevUsers.map((user) =>
					user._id === userId ? { ...user, isFollowing: !isFollowing } : user
				)
			);
		} catch (err) {
			console.error(
				"Error following/unfollowing:",
				err.response?.data || err.message
			);
			alert("An error occurred. Please try again.");
		}
	};

	// Render each user item
	const renderItem = ({ item }) => (
		<TouchableOpacity
			style={styles.userContainer}
			onPress={() =>
				navigation.navigate("UserProfile", { user: item, userId: item._id })
			}
		>
			<Image source={{ uri: item.profileImage }} style={styles.profileImage} />
			<Text style={styles.username}>{item.name}</Text>

			<TouchableOpacity
				style={styles.followButton}
				onPress={() => handleFollowUnfollow(item._id, item.isFollowing)}
			>
				<Text style={styles.followButtonText}>
					{item.isFollowing ? "Unfollow" : "Follow"}
				</Text>
			</TouchableOpacity>
		</TouchableOpacity>
	);

	return (
		<SafeAreaView style={styles.container}>
			<TextInput
				style={styles.searchBar}
				placeholder="Search users..."
				value={query}
				onChangeText={handleSearch}
				autoCapitalize="none"
			/>

			{loading ? (
				<ActivityIndicator size="large" color="#0000ff" />
			) : error ? (
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>{error}</Text>
				</View>
			) : (
				<FlatList
					data={filteredUsers}
					renderItem={renderItem}
					keyExtractor={(item) => item._id?.toString() || ""}
					ListEmptyComponent={
						<Text style={styles.noResults}>No users found.</Text>
					}
					keyboardShouldPersistTaps="handled"
				/>
			)}
		</SafeAreaView>
	);
};

export default SearchScreen;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		paddingHorizontal: 12,
		paddingTop: 10,
	},

	searchBar: {
		height: 40,
		backgroundColor: "#EFEFEF",
		borderRadius: 10,
		paddingHorizontal: 15,
		fontSize: 16,
		marginBottom: 15,
	},

	userContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#ddd",
	},

	profileImage: {
		width: 50,
		height: 50,
		borderRadius: 25,
		marginRight: 12,
		borderWidth: 1,
		borderColor: "#E0E0E0",
	},

	username: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#262626",
		flex: 1, // Allow name to take up available space
	},

	followButton: {
		paddingVertical: 6,
		paddingHorizontal: 16,
		backgroundColor: "#0095f6",
		borderRadius: 8,
	},

	followButtonText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "600",
	},

	noResults: {
		textAlign: "center",
		marginTop: 20,
		fontSize: 16,
		color: "#8e8e8e",
	},

	errorContainer: {
		marginTop: 20,
		alignItems: "center",
	},

	errorText: {
		fontSize: 16,
		color: "#ff3b30",
	},
});
