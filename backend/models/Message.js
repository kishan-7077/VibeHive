// models/Message.js

const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
	{
		sender: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		receiver: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
		timestamp: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true }
);

const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;
