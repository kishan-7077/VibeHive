import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	Alert,
	ActivityIndicator,
	TouchableWithoutFeedback,
	Keyboard,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../contexts/AuthContext"; // Adjust the path if needed
import { TextInput, Button } from "react-native-paper";

// Validation Schema
const LoginSchema = Yup.object().shape({
	email: Yup.string().email("Invalid email").required("Required"),
	password: Yup.string()
		.min(8, "Password must be at least 8 characters")
		.required("Required"),
});

const LoginScreen = ({ navigation }) => {
	const { login } = useAuth();
	const [loading, setLoading] = useState(false);

	const handleLogin = async (values) => {
		if (!values.email || !values.password) {
			Alert.alert("Error", "Please enter both email and password");
			return;
		}

		setLoading(true);
		try {
			await login(values.email, values.password);
			Alert.alert("Success", "You are logged in!");
			// Optionally navigate to the next screen after successful login
			// navigation.navigate("Home");
		} catch (error) {
			Alert.alert(
				"Error",
				error.response?.data?.message || "Invalid email or password"
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
			<View style={styles.container}>
				<Text style={styles.title}>Login</Text>
				<Formik
					initialValues={{ email: "", password: "" }}
					validationSchema={LoginSchema}
					onSubmit={handleLogin}
				>
					{({
						handleChange,
						handleBlur,
						handleSubmit,
						values,
						errors,
						touched,
					}) => (
						<View style={styles.formContainer}>
							{/* Email Field */}
							<TextInput
								label="Email"
								mode="outlined"
								value={values.email}
								onChangeText={handleChange("email")}
								onBlur={handleBlur("email")}
								error={touched.email && !!errors.email}
								autoCapitalize="none"
								keyboardType="email-address"
								style={styles.input}
								theme={{
									colors: {
										primary: "#6200ee",
										underlineColor: "transparent",
										background: "#f1f1f1",
									},
								}}
							/>
							{touched.email && errors.email && (
								<Text style={styles.errorText}>{errors.email}</Text>
							)}

							{/* Password Field */}
							<TextInput
								label="Password"
								mode="outlined"
								secureTextEntry
								value={values.password}
								onChangeText={handleChange("password")}
								onBlur={handleBlur("password")}
								error={touched.password && !!errors.password}
								style={styles.input}
								theme={{
									colors: {
										primary: "#6200ee",
										underlineColor: "transparent",
										background: "#f1f1f1",
									},
								}}
							/>
							{touched.password && errors.password && (
								<Text style={styles.errorText}>{errors.password}</Text>
							)}

							{/* Submit Button */}
							{loading ? (
								<ActivityIndicator size="large" color="#6200ee" />
							) : (
								<Button
									mode="contained"
									onPress={handleSubmit}
									style={styles.submitButton}
									labelStyle={styles.submitButtonText}
									loading={loading}
									disabled={loading}
									theme={{ colors: { primary: "#6200ee" } }}
								>
									Login
								</Button>
							)}

							{/* Signup Link */}
							<Text style={styles.signupText}>
								Don't have an account?{" "}
								<Text
									style={styles.signupLink}
									onPress={() => navigation.navigate("Signup")}
								>
									Sign up
								</Text>
							</Text>
						</View>
					)}
				</Formik>
			</View>
		</TouchableWithoutFeedback>
	);
};

export default LoginScreen;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
		backgroundColor: "#f9f9f9", // Light background color for a clean look
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#6200ee", // Purple color for the title
		marginBottom: 30,
	},
	formContainer: {
		width: "100%",
	},
	input: {
		marginBottom: 15,
		backgroundColor: "#f1f1f1", // Light gray background for inputs
	},
	submitButton: {
		width: "100%",
		marginTop: 20,
		paddingVertical: 10,
	},
	submitButtonText: {
		fontSize: 16,
	},
	signupText: {
		marginTop: 20,
		fontSize: 16,
		color: "#333",
	},
	signupLink: {
		color: "#6200ee",
		fontWeight: "bold",
	},
	errorText: {
		color: "red",
		fontSize: 12,
		marginBottom: 10,
	},
});
