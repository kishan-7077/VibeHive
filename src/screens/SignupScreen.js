import React, { useState } from "react";
import {
	StyleSheet,
	Text,
	View,
	Alert,
	ActivityIndicator,
	TouchableWithoutFeedback,
	Keyboard,
	Image,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../contexts/AuthContext"; // Assuming these methods exist in the AuthContext
import { TextInput, Button } from "react-native-paper"; // Import React Native Paper components
import * as ImagePicker from "expo-image-picker"; // Import Image Picker
import axios from "axios"; // Make sure axios is imported
import { API_URL } from "@env";

// Validation Schema
const SignupSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
	email: Yup.string().email("Invalid email").required("Required"),
	password: Yup.string()
		.min(8, "Password must be at least 8 characters long")
		.max(128, "Password is too long")
		.matches(/[a-z]/, "Password must contain at least one lowercase letter")
		.matches(/[A-Z]/, "Password must contain at least one uppercase letter")
		.matches(/\d/, "Password must contain at least one number")
		.matches(
			/[!@#$%^&*(),.?":{}|<>]/,
			"Password must contain at least one special character"
		)
		.required("Required"),
});

const SignupScreen = () => {
	const { signup, login } = useAuth(); // Assuming these methods exist in the AuthContext
	const [loading, setLoading] = useState(false);
	const [image, setImage] = useState(null); // State for storing the selected image

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
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 1,
		});

		if (!result.canceled) {
			setImage(result.assets[0].uri); // Set the image URI
		}
	};

	// Function to handle signup
	const handleSignup = async (values) => {
		setLoading(true);
		try {
			// Prepare image upload if there's an image
			let profileImageUrl = null;
			if (image) {
				const formData = new FormData();
				formData.append("profileImage", {
					uri: image,
					name: "profile.jpg",
					type: "image/jpeg",
				});

				// Upload the image to your server or cloud service here
				const imageResponse = await axios.post(
					`${API_URL}/users/upload-profile-image`,
					formData,
					{
						headers: {
							"Content-Type": "multipart/form-data",
						},
					}
				);

				const imageData = imageResponse.data;
				profileImageUrl = imageData.imageUrl; // Get the URL from the response
			}

			// Perform signup with profileImageUrl
			await signup(values.name, values.email, values.password, profileImageUrl);

			// Log the user in automatically
			await login(values.email, values.password);

			Alert.alert("Success", "Signup successful! You are now logged in."); // Navigate to the Home screen after successful signup
		} catch (error) {
			// Check if the error response exists
			Alert.alert(
				"Signup Error",
				error.response?.data?.message || "An error occurred during signup."
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
			<View style={styles.container}>
				<Text style={styles.title}>Signup</Text>
				<Formik
					initialValues={{ name: "", email: "", password: "" }}
					validationSchema={SignupSchema}
					onSubmit={handleSignup}
				>
					{({
						handleChange,
						handleBlur,
						handleSubmit,
						values,
						errors,
						touched,
					}) => (
						<View>
							{/* Name Field */}
							<TextInput
								label="Name"
								value={values.name}
								onChangeText={handleChange("name")}
								onBlur={handleBlur("name")}
								style={[
									styles.input,
									touched.name && errors.name && styles.inputError,
								]}
								mode="outlined"
								error={touched.name && errors.name}
							/>
							{touched.name && errors.name && (
								<Text style={styles.errorText}>{errors.name}</Text>
							)}

							{/* Email Field */}
							<TextInput
								label="Email"
								value={values.email}
								onChangeText={handleChange("email")}
								onBlur={handleBlur("email")}
								style={[
									styles.input,
									touched.email && errors.email && styles.inputError,
								]}
								keyboardType="email-address"
								mode="outlined"
								error={touched.email && errors.email}
							/>
							{touched.email && errors.email && (
								<Text style={styles.errorText}>{errors.email}</Text>
							)}

							{/* Password Field */}
							<TextInput
								label="Password"
								value={values.password}
								onChangeText={handleChange("password")}
								onBlur={handleBlur("password")}
								secureTextEntry
								style={[
									styles.input,
									touched.password && errors.password && styles.inputError,
								]}
								mode="outlined"
								error={touched.password && errors.password}
							/>
							{touched.password && errors.password && (
								<Text style={styles.errorText}>{errors.password}</Text>
							)}

							{/* Profile Image Picker */}
							<TouchableWithoutFeedback onPress={pickImage}>
								<View style={styles.imagePicker}>
									{image ? (
										<Image
											source={{ uri: image }}
											style={styles.profileImage}
										/>
									) : (
										<Text style={styles.pickImageText}>
											Pick a Profile Image
										</Text>
									)}
								</View>
							</TouchableWithoutFeedback>

							{/* Submit Button */}
							{loading ? (
								<ActivityIndicator size="large" color="#007BFF" />
							) : (
								<Button
									mode="contained"
									onPress={handleSubmit}
									loading={loading}
									disabled={loading}
									style={styles.button}
								>
									Sign Up
								</Button>
							)}
						</View>
					)}
				</Formik>
			</View>
		</TouchableWithoutFeedback>
	);
};

export default SignupScreen;

// Styles
const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: "#f9f9f9",
		justifyContent: "center",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "center",
		color: "#333",
	},
	input: {
		marginBottom: 15,
	},
	inputError: {
		borderColor: "red",
	},
	errorText: {
		color: "red",
		fontSize: 12,
		marginBottom: 10,
	},
	button: {
		marginTop: 20,
	},
	imagePicker: {
		backgroundColor: "#f0f0f0", // light background color
		padding: 20,
		borderRadius: 50, // Circular container
		borderWidth: 2, // Thin border around the container
		borderColor: "#d1d1d1", // Subtle border color
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 15,
		width: 120, // Set fixed width for the circular container
		height: 120, // Set fixed height for the circular container
		alignSelf: "center", // Center the container horizontally
	},
	profileImage: {
		width: 100, // Slightly smaller image inside the circle
		height: 100, // Same height as width
		borderRadius: 50, // Circular image
	},
	pickImageText: {
		color: "#6200EE", // Instagram-like purple color
		fontSize: 16,
		fontWeight: "500",
	},
});
