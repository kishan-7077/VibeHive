import React, { createContext, useContext, useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [userToken, setUserToken] = useState(null);
	const [loading, setLoading] = useState(true);

	// Load user data on app startup
	useEffect(() => {
		const loadUser = async () => {
			try {
				const token = await AsyncStorage.getItem("token");
				if (token) {
					setUserToken({ token });
				}
			} catch (error) {
				console.error("Error loading user:", error);
			} finally {
				setLoading(false);
			}
		};

		loadUser();
	}, []);

	// Login function
	const login = async (email, password) => {
		try {
			const response = await axios.post(
				"http://192.168.1.15:5000/users/login",
				{
					email,
					password,
				}
			);
			const { token } = response.data;
			await AsyncStorage.setItem("token", token);
			setUserToken({ token });
		} catch (error) {
			console.error(
				"Login error:",
				error.response?.data?.message || error.message
			);
			throw error;
		}
	};

	const getUser = async () => {
		try {
			const token = await AsyncStorage.getItem("token");
			if (!token) {
				console.error("No token found, user not authenticated");
				return null;
			}

			const response = await axios.get(
				"http://192.168.1.15:5000/users/profile",
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			const userData = response.data.user;
			// console.log(userData);

			return userData;
		} catch (error) {
			console.error(
				"Error fetching user profile:",
				error.response?.data?.message || error.message
			);
			throw error;
		}
	};

	const getPosts = async () => {
		try {
			const token = await AsyncStorage.getItem("token");
			if (!token) {
				console.error("No token found, user not authenticated");
				return null;
			}

			const response = await axios.get(
				"http://192.168.1.15:5000/users/profile",
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			const posts = response.data.posts;
			console.log(response.data);

			return posts;
		} catch (error) {
			console.error(
				"Error fetching post count:",
				error.response?.data?.message || error.message
			);
			throw error;
		}
	};

	// Signup function
	const signup = async (name, email, password, profileImage) => {
		console.log(profileImage);

		try {
			await axios.post("http://192.168.1.15:5000/users/signup", {
				name,
				email,
				password,
				profileImage,
			});
		} catch (error) {
			console.error(
				"Signup error:",
				error.response?.data?.message || error.message
			);
			throw error;
		}
	};

	// Logout function
	const logout = async () => {
		try {
			await AsyncStorage.removeItem("token");
			setUserToken(null);
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	if (loading) {
		// Display a loading indicator while checking the initial authentication state
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return (
		<AuthContext.Provider
			value={{ userToken, login, signup, logout, getUser, getPosts }}
		>
			{children}
		</AuthContext.Provider>
	);
};

// Hook for accessing the auth context
export const useAuth = () => {
	return useContext(AuthContext);
};
