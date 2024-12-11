import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	FlatList,
	View,
	ActivityIndicator,
	RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import VibeHiveHeader from "../utils/VibeHiveHeader";
import Stories from "../components/Stories";
import Posts from "../components/Posts";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const HomeScreen = ({ navigation }) => {
	const { logout, getUser } = useAuth();
	const [loading, setLoading] = useState(true);
	const [posts, setPosts] = useState(null);
	const [refreshing, setRefreshing] = useState(false); // State to handle refreshing

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const data = await getUser();
				console.log("Email:", data.email);
				console.log("Name:", data.name);
			} catch (error) {
				console.error("Error fetching user data:", error);

				// Handle invalid token errors (e.g., 401 or 403)
				if (
					error.response &&
					(error.response.status === 401 || error.response.status === 403)
				) {
					console.error("Invalid token: Redirecting to login.");
					logout(); // Clear token and user state
				}
			} finally {
				setLoading(false);
			}
		};

		fetchUser();
	}, [logout]);

	useEffect(() => {
		const fetchPosts = async () => {
			try {
				const response = await axios.get(
					"http://192.168.1.15:5000/posts/get-posts"
				);
				setPosts(response.data);
			} catch (error) {
				console.error("error loading posts", error);
			}
		};

		fetchPosts();
	}, []);

	const onRefresh = async () => {
		setRefreshing(true);
		try {
			const response = await axios.get(
				"http://192.168.1.15:5000/posts/get-posts"
			);
			setPosts(response.data);
		} catch (error) {
			console.error("Error refreshing posts", error);
		} finally {
			setRefreshing(false);
		}
	};

	if (loading) {
		return (
			<View style={styles.loaderContainer}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<VibeHiveHeader navigation={navigation} />
			<FlatList
				data={posts}
				renderItem={({ item }) => <Posts post={item} />}
				keyExtractor={(item) => item._id}
				showsVerticalScrollIndicator={false}
				ListHeaderComponent={<Stories />}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			/>
		</SafeAreaView>
	);
};

export default HomeScreen;

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
});
