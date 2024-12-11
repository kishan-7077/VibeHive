import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	Button,
	FlatList,
	StyleSheet,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

const CommentsScreen = ({ route }) => {
	const { postId } = route.params; // Get the post ID passed via navigation
	const { getUser } = useAuth();
	const [comments, setComments] = useState([]);
	const [newComment, setNewComment] = useState("");

	// Fetch comments when the screen loads
	useEffect(() => {
		const fetchComments = async () => {
			try {
				const response = await axios.get(
					`http://192.168.1.3:5000/posts/get-posts`
				);
				const post = response.data.find((p) => p._id === postId);
				if (post) {
					setComments(post.comments);
				}
			} catch (error) {
				console.error("Error fetching comments", error);
			}
		};

		fetchComments();
	}, [postId]);

	// Handle adding a new comment
	const handleAddComment = async () => {
		try {
			const user = await getUser();
			if (!user) {
				return alert("You must be logged in to add a comment.");
			}

			const response = await axios.post(
				"http://192.168.1.3:5000/posts/add-comment",
				{
					postId,
					user: user._id,
					comment: newComment,
				}
			);

			if (response.data.post) {
				setComments(response.data.post.comments);
				setNewComment(""); // Clear the input field after adding the comment
			}
		} catch (error) {
			console.error("Error adding comment", error);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			{/* Comments List */}
			<FlatList
				data={comments}
				keyExtractor={(item) => item._id}
				renderItem={({ item }) => (
					<View style={styles.comment}>
						<Text style={styles.commentUser}>{item.user?.name}</Text>
						<Text style={styles.commentText}>{item.comment}</Text>
					</View>
				)}
				contentContainerStyle={styles.commentList}
				ListEmptyComponent={
					<View style={styles.noCommentsContainer}>
						<Text style={styles.noCommentsText}>
							No comments yet. Be the first to comment!
						</Text>
					</View>
				}
			/>

			{/* Add Comment Section */}
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={styles.commentInputContainer}
			>
				<TextInput
					style={styles.input}
					placeholder="Add a comment..."
					value={newComment}
					onChangeText={setNewComment}
				/>
				<TouchableOpacity style={styles.postButton} onPress={handleAddComment}>
					<Text style={styles.postButtonText}>Post</Text>
				</TouchableOpacity>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	commentList: {
		paddingHorizontal: 20,
		paddingTop: 10,
		paddingBottom: 80, // Space for the comment input at the bottom
	},
	comment: {
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#f0f0f0",
	},
	commentUser: {
		fontWeight: "bold",
		fontSize: 14,
		color: "#333",
	},
	commentText: {
		fontSize: 14,
		color: "#555",
		marginTop: 4,
	},
	commentInputContainer: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		flexDirection: "row",
		alignItems: "center",
		padding: 10,
		borderTopWidth: 1,
		borderTopColor: "#eee",
		backgroundColor: "#fff",
	},
	input: {
		flex: 1,
		borderWidth: 1,
		borderColor: "#ccc",
		padding: 10,
		borderRadius: 20,
		marginRight: 10,
		backgroundColor: "#f7f7f7",
	},
	postButton: {
		backgroundColor: "#0095f6",
		paddingVertical: 10,
		paddingHorizontal: 15,
		borderRadius: 20,
	},
	postButtonText: {
		color: "#fff",
		fontWeight: "bold",
		fontSize: 14,
	},
	noCommentsContainer: {
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 20,
	},
	noCommentsText: {
		fontSize: 16,
		color: "#888",
		fontStyle: "italic",
	},
});

export default CommentsScreen;
