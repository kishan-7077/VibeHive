import React, { useEffect, useState, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	ActivityIndicator,
	Image,
	TouchableOpacity,
	FlatList,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

const ProfileScreen = () => {
	const { logout, getUser, getPosts } = useAuth();
	const [userData, setUserData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [posts, setPosts] = useState([]);
	const navigation = useNavigation();

	useFocusEffect(
		useCallback(() => {
			const fetchUserData = async () => {
				try {
					const data = await getUser();
					const userPosts = await getPosts();
					// console.log(data);
					// console.log(userPosts);

					setUserData(data);
					setPosts(userPosts);
				} catch (error) {
					console.error("Error fetching user data:", error);
					if (
						error.response &&
						(error.response.status === 401 || error.response.status === 403)
					) {
						logout();
					}
				} finally {
					setLoading(false);
				}
			};
			fetchUserData();
		}, [getUser, getPosts, logout])
	);

	if (loading) {
		return (
			<View style={styles.loaderContainer}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	const renderPostItem = ({ item }) => (
		<Image source={{ uri: item.image }} style={styles.postImage} />
	);

	return (
		<SafeAreaView style={styles.container}>
			{/* Profile Header */}
			<View style={styles.header}>
				<Image
					source={{
						uri: userData?.profileImage || "https://via.placeholder.com/100",
					}}
					style={styles.profileImage}
				/>

				<View style={styles.userInfo}>
					<Text style={styles.name}>{userData?.name}</Text>
					<Text style={styles.email}>{userData?.email}</Text>
				</View>
			</View>

			{/* Stats */}
			<View style={styles.statsContainer}>
				<View style={styles.statItem}>
					<Text style={styles.statNumber}>{posts.length}</Text>
					<Text style={styles.statLabel}>Posts</Text>
				</View>
				<View style={styles.statItem}>
					<Text style={styles.statNumber}>
						{userData?.followers?.length ?? 0}
					</Text>
					<Text style={styles.statLabel}>Followers</Text>
				</View>
				<View style={styles.statItem}>
					<Text style={styles.statNumber}>
						{userData?.following?.length ?? 0}
					</Text>
					<Text style={styles.statLabel}>Following</Text>
				</View>
			</View>

			{/* Edit Profile and Logout Buttons */}
			<View style={styles.buttonContainer}>
				<TouchableOpacity
					style={styles.editButton}
					onPress={() => navigation.navigate("EditProfile")}
				>
					<Text style={styles.editButtonText}>Edit Profile</Text>
				</TouchableOpacity>

				<TouchableOpacity style={styles.logoutButton} onPress={logout}>
					<Text style={styles.logoutButtonText}>Logout</Text>
				</TouchableOpacity>
			</View>

			{/* Posts Grid */}
			<FlatList
				data={posts}
				renderItem={renderPostItem}
				keyExtractor={(item) => item._id}
				numColumns={3}
				contentContainerStyle={styles.postsContainer}
				ListEmptyComponent={
					<Text style={styles.noPostsText}>No posts yet.</Text>
				}
			/>
		</SafeAreaView>
	);
};

export default ProfileScreen;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	loaderContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingVertical: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	profileImage: {
		width: 100,
		height: 100,
		borderRadius: 50,
		borderWidth: 2,
		borderColor: "#ddd",
		marginRight: 20,
	},
	userInfo: {
		flex: 1,
	},
	name: {
		fontSize: 22,
		fontWeight: "bold",
		marginBottom: 5,
	},
	email: {
		fontSize: 16,
		color: "#555",
	},
	statsContainer: {
		flexDirection: "row",
		justifyContent: "space-around",
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	statItem: {
		alignItems: "center",
	},
	statNumber: {
		fontSize: 18,
		fontWeight: "bold",
	},
	statLabel: {
		fontSize: 14,
		color: "#555",
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginVertical: 15,
	},
	editButton: {
		backgroundColor: "#0095f6",
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 5,
	},
	editButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "500",
	},
	logoutButton: {
		backgroundColor: "#f44336",
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 5,
	},
	logoutButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "500",
	},
	postsContainer: {
		paddingHorizontal: 1,
	},
	postImage: {
		width: "32%",
		aspectRatio: 1,
		margin: "0.66%",
		backgroundColor: "#eee",
		borderRadius: 4,
	},
	noPostsText: {
		textAlign: "center",
		color: "#888",
		marginTop: 20,
		fontSize: 16,
	},
});
