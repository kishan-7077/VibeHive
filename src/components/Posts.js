import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	Image,
	StyleSheet,
	TouchableOpacity,
	Share,
} from "react-native";
import { FontAwesome, Feather, Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "@env";

const Posts = ({ post }) => {
	const { getUser } = useAuth();
	const [hasLiked, setHasLiked] = useState(false);
	const [likesCount, setLikesCount] = useState(post.likes.length);
	const [user, setUser] = useState(null);

	const navigation = useNavigation();

	// Fetch user data when the component mounts
	useEffect(() => {
		const fetchUser = async () => {
			try {
				const currentUser = await getUser();
				setUser(currentUser);
			} catch (error) {
				console.error("Error fetching user", error);
			}
		};

		fetchUser();
	}, []);

	// Handle like/unlike action
	const handleLike = async () => {
		try {
			if (!user) {
				return alert("You must be logged in to like a post.");
			}

			const response = await axios.post(`${API_URL}/posts/like-post`, {
				postId: post._id,
				owner: user._id,
			});

			if (response.data.post) {
				setHasLiked(!hasLiked);
				setLikesCount(response.data.post.likes.length);
			}
		} catch (error) {
			console.error("Error liking the post", error);
		}
	};

	useEffect(() => {
		if (user) {
			const isLikedByUser = post.likes.includes(user._id);
			setHasLiked(isLikedByUser);
		}
	}, [post, user]);

	// Handle share action
	const handleShare = async () => {
		try {
			await Share.share({
				message: `Check out this post by ${post.owner.name}: ${post.caption}\n${post.image}`,
			});
		} catch (error) {
			console.error("Error sharing the post", error);
		}
	};

	return (
		<View style={styles.postContainer}>
			{/* Header with user information */}
			<View style={styles.header}>
				<Image
					source={{ uri: post.owner.profileImage }}
					style={styles.profileImage}
				/>
				<Text style={styles.username}>{post.owner.name}</Text>
			</View>

			{/* Post image */}
			<Image source={{ uri: post.image }} style={styles.postImage} />

			{/* Actions (like, comment, share, bookmark) */}
			<View style={styles.actions}>
				<View style={styles.actionIcons}>
					<TouchableOpacity onPress={handleLike}>
						<FontAwesome
							name={hasLiked ? "heart" : "heart-o"}
							size={28}
							style={[styles.icon, hasLiked && { color: "red" }]}
						/>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => navigation.navigate("Comment", { postId: post._id })}
					>
						<Feather name="message-circle" size={28} style={styles.icon} />
					</TouchableOpacity>
					<TouchableOpacity onPress={handleShare}>
						<Feather name="send" size={28} style={styles.icon} />
					</TouchableOpacity>
				</View>
				<TouchableOpacity>
					<Ionicons name="bookmark-outline" size={28} style={styles.icon} />
				</TouchableOpacity>
			</View>

			{/* Likes and comments count */}
			<Text style={styles.likes}>{likesCount} likes</Text>

			{/* Post caption */}
			<Text style={styles.caption}>
				<Text style={styles.bold}>{post.owner.name}</Text> {post.caption}
			</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	postContainer: {
		marginBottom: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#ddd",
		paddingBottom: 10,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		padding: 10,
	},
	profileImage: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginRight: 10,
	},
	username: {
		fontSize: 16,
		fontWeight: "bold",
	},
	postImage: {
		width: "100%",
		height: 400,
	},
	actions: {
		flexDirection: "row",
		justifyContent: "space-between",
		padding: 10,
	},
	actionIcons: {
		flexDirection: "row",
	},
	icon: {
		marginRight: 15,
	},
	likes: {
		fontSize: 16,
		fontWeight: "bold",
		marginLeft: 10,
		marginBottom: 5,
	},
	caption: {
		fontSize: 14,
		marginLeft: 10,
		marginBottom: 10,
	},
	bold: {
		fontWeight: "bold",
	},
});

export default Posts;
