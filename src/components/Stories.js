import React from "react";
import {
	View,
	Text,
	Image,
	FlatList,
	StyleSheet,
	TouchableOpacity,
} from "react-native";

const storiesData = [
	{
		id: "1",
		name: "Your Story",
		image: "https://via.placeholder.com/80",
		isOwnStory: true,
	},
	{ id: "2", name: "John", image: "https://via.placeholder.com/80" },
	{ id: "3", name: "Anna", image: "https://via.placeholder.com/80" },
	{ id: "4", name: "Mike", image: "https://via.placeholder.com/80" },
	{ id: "5", name: "Sophie", image: "https://via.placeholder.com/80" },
	{ id: "6", name: "Chris", image: "https://via.placeholder.com/80" },
];

const Stories = () => {
	const renderItem = ({ item }) => (
		<TouchableOpacity style={styles.storyContainer}>
			<View
				style={item.isOwnStory ? styles.ownStoryBorder : styles.storyBorder}
			>
				<Image source={{ uri: item.image }} style={styles.storyImage} />
			</View>
			<Text style={styles.storyName} numberOfLines={1}>
				{item.name}
			</Text>
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			<FlatList
				data={storiesData}
				renderItem={renderItem}
				keyExtractor={(item) => item.id}
				horizontal
				showsHorizontalScrollIndicator={false}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		paddingVertical: 10,
		backgroundColor: "#fff",
	},
	storyContainer: {
		alignItems: "center",
		marginRight: 15,
	},
	storyBorder: {
		width: 80,
		height: 80,
		borderRadius: 40,
		borderWidth: 3,
		borderColor: "#ff8501", // Instagram-like gradient border color
		justifyContent: "center",
		alignItems: "center",
	},
	ownStoryBorder: {
		width: 80,
		height: 80,
		borderRadius: 40,
		borderWidth: 3,
		borderColor: "#ccc", // Gray border for your own story
		justifyContent: "center",
		alignItems: "center",
	},
	storyImage: {
		width: 70,
		height: 70,
		borderRadius: 35,
	},
	storyName: {
		marginTop: 5,
		fontSize: 12,
		color: "#333",
		width: 80,
		textAlign: "center",
	},
});

export default Stories;
