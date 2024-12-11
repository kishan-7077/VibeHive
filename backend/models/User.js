const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	profileImage: {
		type: String, // Store the URL of the profile image
		default:
			"https://res.cloudinary.com/dii6q6ufe/image/upload/v1733755706/VibeHive_posts/i2xyhsxqonbdaotbksqp.jpg",
		// required: true, // Optional: provide a default image URL
	},
	isVerified: {
		type: Boolean,
		default: false,
	},
	following: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
	followers: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
