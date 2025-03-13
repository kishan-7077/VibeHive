import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	FlatList,
	StyleSheet,
} from "react-native";
import socket from "../utils/socket";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { API_URL } from "@env";

const ChatScreen = ({ route }) => {
	const { userId, userName, currentUserId } = route.params;
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState([]);

	useEffect(() => {
		const fetchMessages = async () => {
			try {
				const response = await axios.get(
					`${API_URL}/messages/${currentUserId}/${userId}`
				);
				setMessages(response.data);
			} catch (error) {
				console.error("Error fetching messages:", error);
			}
		};

		fetchMessages();

		socket.on("receive_message", (data) => {
			setMessages((prevMessages) => [...prevMessages, data]);
		});

		return () => {
			socket.off("receive_message");
		};
	}, [currentUserId, userId, messages]);

	const sendMessage = () => {
		if (message.trim()) {
			const msgData = {
				sender: currentUserId,
				receiver: userId,
				content: message,
				timestamp: new Date().toISOString(),
			};
			socket.emit("send_message", msgData);
			setMessage("");
			setMessages((prevMessages) => [...prevMessages, msgData]);
		}
	};

	// Function to format timestamps into the desired format (e.g., 11 Dec 12:34pm)
	const formatTimestamp = (timestamp) => {
		const date = new Date(timestamp);

		const options = {
			day: "2-digit",
			month: "short",
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		};

		return date.toLocaleString("en-GB", options).replace(",", "");
	};

	return (
		<SafeAreaView style={styles.container}>
			<Text style={styles.header}>{userName}</Text>
			<FlatList
				data={messages}
				keyExtractor={(_, index) => index.toString()}
				renderItem={({ item }) => (
					<View
						style={[
							styles.messageBubble,
							item.sender === currentUserId ? styles.sent : styles.received,
						]}
					>
						<Text style={styles.messageText}>{item.content}</Text>
						<Text style={styles.timestamp}>
							{formatTimestamp(item.timestamp)}
						</Text>
					</View>
				)}
			/>
			<View style={styles.inputContainer}>
				<TextInput
					value={message}
					onChangeText={setMessage}
					placeholder="Type a message..."
					style={styles.input}
				/>
				<TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
					<Text style={styles.sendButtonText}>Send</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		padding: 16,
	},
	header: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 16,
		textAlign: "center",
		color: "#000",
	},
	messageBubble: {
		maxWidth: "80%",
		padding: 12,
		borderRadius: 20,
		marginVertical: 4,
	},
	sent: {
		backgroundColor: "#DCF8C6",
		alignSelf: "flex-end",
	},
	received: {
		backgroundColor: "#ECECEC",
		alignSelf: "flex-start",
	},
	messageText: {
		fontSize: 16,
		color: "#000",
	},
	timestamp: {
		fontSize: 12,
		color: "#888",
		marginTop: 4,
		textAlign: "right",
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderTopWidth: 1,
		borderTopColor: "#ccc",
		paddingTop: 8,
	},
	input: {
		flex: 1,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 25,
		paddingVertical: 10,
		paddingHorizontal: 15,
		marginRight: 8,
		fontSize: 16,
		backgroundColor: "#F4F4F4",
	},
	sendButton: {
		backgroundColor: "#3897F0",
		borderRadius: 25,
		paddingVertical: 10,
		paddingHorizontal: 20,
	},
	sendButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
});

export default ChatScreen;
