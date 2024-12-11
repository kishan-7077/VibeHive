const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// Get all messages between two users
router.get("/:userId/:receiverId", async (req, res) => {
	try {
		const { userId, receiverId } = req.params;

		const messages = await Message.find({
			$or: [
				{ sender: userId, receiver: receiverId },
				{ sender: receiverId, receiver: userId },
			],
		}).sort({ timestamp: 1 });

		res.json(messages);
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch messages" });
	}
});

// Save a new message to the database
router.post("/", async (req, res) => {
	const { sender, receiver, content } = req.body;

	try {
		const newMessage = new Message({ sender, receiver, content });
		await newMessage.save();
		res.status(201).json(newMessage);
	} catch (error) {
		res.status(500).json({ error: "Failed to save message" });
	}
});

module.exports = router;
