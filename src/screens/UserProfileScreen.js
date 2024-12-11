import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	Image,
	FlatList,
	StyleSheet,
	ActivityIndicator,
	TouchableOpacity,
	Dimensions,
} from "react-native";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect

const { width } = Dimensions.get("window");
const NUM_COLUMNS = 3; // For a 3-column grid layout

const UserProfileScreen = ({ route }) => {
	const { user, userId, currentUserId } = route.params; // currentUserId for identifying logged-in user
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isFollowing, setIsFollowing] = useState(
		user.followers.includes(currentUserId)
	); // Initialize follow status

	useEffect(() => {
		const fetchPosts = async () => {
			try {
				const response = await axios.get(
					`http://192.168.1.3:5000/posts/get-posts?userId=${userId}`
				);
				setPosts(response.data);
			} catch (err) {
				console.error("Error fetching posts:", err);
				setError("Failed to fetch posts.");
			} finally {
				setLoading(false);
			}
		};

		fetchPosts();
	}, [userId]);

	// Re-fetch follow status when the screen is focused
	useFocusEffect(
		React.useCallback(() => {
			const checkFollowStatus = async () => {
				// Check the follow status again when screen is focused
				const token = await AsyncStorage.getItem("token");
				try {
					const response = await axios.get(
						`http://192.168.1.3:5000/users/follow-status/${userId}`,
						{
							headers: {
								Authorization: `Bearer ${token}`,
							},
						}
					);
					setIsFollowing(response.data.isFollowing);
				} catch (err) {
					console.error("Error checking follow status:", err);
				}
			};

			checkFollowStatus();

			return () => {
				// Cleanup function when screen is unfocused (optional)
			};
		}, [userId])
	);

	// Follow/Unfollow handler function
	const handleFollowUnfollow = async () => {
		try {
			const url = isFollowing
				? `http://192.168.1.3:5000/users/unfollow/${userId}`
				: `http://192.168.1.3:5000/users/follow/${userId}`;

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

			// Toggle follow status
			setIsFollowing(!isFollowing);
		} catch (err) {
			console.error(
				"Error following/unfollowing:",
				err.response?.data || err.message
			);
			alert("An error occurred. Please try again.");
		}
	};

	const renderPost = ({ item }) => (
		<Image source={{ uri: item.image }} style={styles.gridImage} />
	);

	return (
		<SafeAreaView style={styles.container}>
			{loading ? (
				<ActivityIndicator size="large" color="#0095f6" />
			) : error ? (
				<Text style={styles.error}>{error}</Text>
			) : (
				<>
					<View style={styles.headerContainer}>
						<Image
							source={{ uri: user.profileImage }}
							style={styles.profileImage}
						/>
						<View style={styles.userInfoContainer}>
							<View style={styles.infoBlock}>
								<Text style={styles.infoNumber}>{posts.length}</Text>
								<Text style={styles.infoLabel}>Posts</Text>
							</View>
							<View style={styles.infoBlock}>
								<Text style={styles.infoNumber}>{user.followers.length}</Text>
								<Text style={styles.infoLabel}>Followers</Text>
							</View>
							<View style={styles.infoBlock}>
								<Text style={styles.infoNumber}>{user.following.length}</Text>
								<Text style={styles.infoLabel}>Following</Text>
							</View>
						</View>
					</View>

					<View style={styles.profileActions}>
						<Text style={styles.username}>{user.name}</Text>
						<TouchableOpacity
							style={[
								styles.followButton,
								isFollowing && styles.followingButton,
							]}
							onPress={handleFollowUnfollow}
						>
							<Text style={styles.followButtonText}>
								{isFollowing ? "Following" : "Follow"}
							</Text>
						</TouchableOpacity>
					</View>

					<FlatList
						data={posts}
						renderItem={renderPost}
						keyExtractor={(item) => item._id}
						numColumns={NUM_COLUMNS}
						showsVerticalScrollIndicator={false}
					/>
				</>
			)}
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	headerContainer: {
		flexDirection: "row",
		alignItems: "center",
		padding: 20,
	},
	profileImage: {
		width: 100,
		height: 100,
		borderRadius: 50,
		marginRight: 20,
	},
	userInfoContainer: {
		flexDirection: "row",
		justifyContent: "space-around",
		flex: 1,
	},
	infoBlock: {
		alignItems: "center",
	},
	infoNumber: {
		fontSize: 18,
		fontWeight: "bold",
	},
	infoLabel: {
		fontSize: 14,
		color: "#777",
	},
	profileActions: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingBottom: 10,
	},
	username: {
		fontSize: 20,
		fontWeight: "bold",
	},
	followButton: {
		backgroundColor: "#0095f6",
		paddingVertical: 8,
		paddingHorizontal: 20,
		borderRadius: 5,
	},
	followingButton: {
		backgroundColor: "#d3d3d3",
	},
	followButtonText: {
		color: "#fff",
		fontWeight: "bold",
	},
	gridImage: {
		width: width / NUM_COLUMNS - 2,
		height: width / NUM_COLUMNS - 2,
		margin: 1,
	},
	error: {
		textAlign: "center",
		color: "red",
		marginTop: 20,
	},
});

export default UserProfileScreen;
