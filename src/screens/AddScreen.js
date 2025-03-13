import React, { useState } from "react";
import {
	View,
	Text,
	Image,
	TextInput,
	Button,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios"; // For API calls
import { useAuth } from "../contexts/AuthContext";
import { API_URL } from "@env";

const AddScreen = () => {
	const [image, setImage] = useState(null);
	const [caption, setCaption] = useState("");
	const [loading, setLoading] = useState(false);
	const { getUser } = useAuth();

	// Function to pick an image from the gallery
	const pickImage = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== "granted") {
			Alert.alert(
				"Permission Required",
				"Sorry, we need camera roll permissions to make this work!"
			);
			return;
		}

		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images, // Updated to use MediaType.photo
			allowsEditing: true,
			aspect: [1, 1],
			quality: 1,
		});

		if (!result.canceled) {
			setImage(result.assets[0].uri); // Set the image URI
		}
	};

	// Function to take a photo using the camera
	const takePhoto = async () => {
		const { status } = await ImagePicker.requestCameraPermissionsAsync();
		if (status !== "granted") {
			Alert.alert(
				"Permission Required",
				"Sorry, we need camera permissions to take a photo!"
			);
			return;
		}

		let result = await ImagePicker.launchCameraAsync({
			allowsEditing: true,
			aspect: [1, 1],
			quality: 1,
		});

		if (!result.canceled) {
			setImage(result.assets[0].uri); // Set the image URI
		}
	};

	// Function to handle posting the image
	const handlePost = async () => {
		if (!image) {
			alert("Please select or take a photo first!");
			return;
		}
		if (!caption) {
			alert("Please add a caption!");
			return;
		}

		setLoading(true);

		const user = await getUser();

		// Prepare the image for upload
		const formData = new FormData();
		formData.append("image", {
			uri: image,
			name: "photo.jpg",
			type: "image/jpeg",
		});
		formData.append("caption", caption);
		formData.append("owner", user._id);

		try {
			const response = await axios.post(`${API_URL}/posts/add-post`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			if (response.status === 201) {
				alert("Photo posted successfully!");
				setImage(null);
				setCaption("");
			} else {
				alert("Error posting photo.");
			}
		} catch (error) {
			console.error(
				"Error posting image:",
				error.response?.data || error.message
			);
			alert("Error posting photo. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollViewContent}>
				<Text style={styles.header}>Add a New Post</Text>

				{/* Button container */}
				<View style={styles.buttonContainer}>
					<Button
						title="Pick an Image from Gallery"
						onPress={pickImage}
						color="#6200EE"
					/>
				</View>

				<View style={styles.buttonContainer}>
					<Button title="Take a Photo" onPress={takePhoto} color="#6200EE" />
				</View>

				{/* Image preview */}
				{image && <Image source={{ uri: image }} style={styles.imagePreview} />}

				{/* Caption input */}
				<TextInput
					style={styles.captionInput}
					placeholder="Write a caption..."
					value={caption}
					onChangeText={setCaption}
					multiline
				/>

				{/* Post button */}
				<TouchableOpacity
					style={styles.postButton}
					onPress={handlePost}
					disabled={loading}
				>
					<Text style={styles.postButtonText}>
						{loading ? "Posting..." : "Post"}
					</Text>
				</TouchableOpacity>
			</ScrollView>
		</SafeAreaView>
	);
};

export default AddScreen;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		padding: 15,
	},
	scrollViewContent: {
		paddingBottom: 20,
	},
	header: {
		fontSize: 24,
		fontWeight: "600",
		textAlign: "center",
		marginBottom: 25,
		color: "#333",
	},
	buttonContainer: {
		marginBottom: 15,
	},
	imagePreview: {
		width: "100%",
		height: 300,
		borderRadius: 12,
		backgroundColor: "#f0f0f0",
		marginBottom: 20,
	},
	captionInput: {
		height: 80,
		borderColor: "#ccc",
		borderWidth: 1,
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		marginBottom: 20,
		textAlignVertical: "top",
	},
	postButton: {
		backgroundColor: "#6200EE",
		padding: 15,
		borderRadius: 8,
		alignItems: "center",
	},
	postButtonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "600",
	},
});
