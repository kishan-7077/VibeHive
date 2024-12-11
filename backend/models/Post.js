const mongoose = require("mongoose");

const postSchema = mongoose.Schema(
	{
		image: {
			type: String, // URL or path to the image
			required: true,
		},
		caption: {
			type: String,
			required: false, // Caption is optional
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId, // Reference to the User model
			ref: "User", // The model name to reference
			required: true,
		},
		createdAt: {
			type: Date,
			default: Date.now, // Automatically set the creation date
		},
		updatedAt: {
			type: Date,
			default: Date.now, // Automatically set the updated date
		},
		likes: [
			{
				type: mongoose.Schema.Types.ObjectId, // References to users who liked the post
				ref: "User",
			},
		],
		comments: [
			{
				user: {
					type: mongoose.Schema.Types.ObjectId, // Reference to the user who commented
					ref: "User",
				},
				comment: {
					type: String, // The comment content
				},
				createdAt: {
					type: Date,
					default: Date.now, // Comment timestamp
				},
			},
		],
	},
	{ timestamps: true } // Automatically add `createdAt` and `updatedAt`
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
