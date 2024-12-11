import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons"; // For icons

const VibeHiveHeader = ({ navigation }) => {
	return (
		<View style={styles.headerContainer}>
			{/* Brand Name */}
			<Text style={styles.brandName}>VibeHive</Text>

			{/* Icons Container */}
			<View style={styles.iconsContainer}>
				<TouchableOpacity style={styles.iconButton}>
					<MaterialCommunityIcons
						name="heart-outline"
						size={24}
						color="black"
					/>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.iconButton}
					onPress={() => navigation.navigate("ChatList")}
				>
					<Feather name="message-circle" size={24} color="black" />
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	headerContainer: {
		height: 60,
		backgroundColor: "#fff",
		paddingHorizontal: 15,
		borderBottomWidth: 1,
		borderColor: "#ddd",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	brandName: {
		fontSize: 24,
		fontWeight: "bold",
		fontFamily: "sans-serif",
	},
	iconsContainer: {
		flexDirection: "row",
	},
	iconButton: {
		marginLeft: 20,
	},
});

export default VibeHiveHeader;
