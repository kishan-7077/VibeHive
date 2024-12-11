const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const Post = require("../models/Post");
const User = require("../models/User");

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// In your backend file
router.get("/get-posts", async (req, res) => {
	try {
		const userId = req.query.userId;
		const query = userId ? { owner: userId } : {};

		const posts = await Post.find(query)
			.populate("owner", "name profileImage email") // Populate owner details
			.populate("comments.user", "name"); // Populate user details in comments

		// Check if there are no posts in the database
		if (posts.length === 0) {
			return res.json({ message: "No posts available" });
		}

		// If there are posts, return them
		res.json(posts);
	} catch (error) {
		res.status(500).json({ message: "Error loading posts data" });
	}
});

// Updated add-post route to handle image upload
router.post("/add-post", upload.single("image"), async (req, res) => {
	const { caption, owner, likes, comments } = req.body;

	if (!req.file || !owner) {
		return res
			.status(400)
			.json({ message: "Image file and user ID are required" });
	}

	try {
		// Upload image to Cloudinary
		cloudinary.uploader
			.upload_stream({ folder: "VibeHive_posts" }, async (error, result) => {
				if (error) {
					console.error("Error uploading to Cloudinary:", error);
					return res.status(500).json({ message: "Error uploading image" });
				}

				const imageUrl = result.secure_url;
				console.log("Image URL:", imageUrl);

				// Create a new post with the optional fields
				const newPost = new Post({
					image: imageUrl,
					caption: caption || "", // Default to empty string if no caption is provided
					owner: owner,
					likes: likes || [], // Default to 0 if no likes are provided
					comments: comments || [], // Default to empty array if no comments are provided
					createdAt: new Date(),
				});

				// Save the post to the database
				const savedPost = await newPost.save();

				// Send back the saved post
				res.status(201).json(savedPost);
			})
			.end(req.file.buffer);
	} catch (error) {
		console.error("Error adding post:", error);
		res.status(500).json({ message: "Error adding post" });
	}
});

router.post("/like-post", async (req, res) => {
	const { postId, owner } = req.body;

	if (!postId || !owner) {
		return res
			.status(400)
			.json({ message: "Post ID and user ID are required" });
	}

	try {
		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ message: "Post not found" });
		}

		const userIndex = post.likes.indexOf(owner);

		if (userIndex === -1) {
			post.likes.push(owner);
			await post.save();
			res.status(200).json({ message: "Post liked successfully", post });
		} else {
			post.likes.splice(userIndex, 1);
			await post.save();
			res.status(200).json({ message: "Like removed", post });
		}
	} catch (error) {
		console.error("Error handling like action:", error);
		res.status(500).json({ message: "Error liking/unliking post" });
	}
});

router.post("/add-comment", async (req, res) => {
	const { postId, user, comment } = req.body;

	if (!postId || !user || !comment) {
		return res
			.status(400)
			.json({ message: "Post ID, user, and comment are required" });
	}

	try {
		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ message: "Post not found" });
		}

		const newComment = {
			user,
			comment,
			createdAt: new Date(),
		};

		post.comments.push(newComment);
		await post.save();

		// Populate the user field in comments before returning the response
		const updatedPost = await Post.findById(postId).populate(
			"comments.user",
			"name"
		);

		res.json({ post: updatedPost });
	} catch (error) {
		console.error("Error adding comment:", error);
		res.status(500).json({ message: "Error adding comment" });
	}
});

router.post("/remove-comment", async (req, res) => {
	const { postId, commentId, user } = req.body;

	if (!postId || !commentId || !user) {
		return res
			.status(400)
			.json({ message: "Post ID, comment ID, and user ID are required" });
	}

	try {
		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ message: "Post not found" });
		}

		const commentIndex = post.comments.findIndex(
			(comment) =>
				comment._id.toString() === commentId && comment.user.toString() === user
		);

		if (commentIndex === -1) {
			return res.status(404).json({
				message: "Comment not found or user not authorized to remove it",
			});
		}

		post.comments.splice(commentIndex, 1);

		const updatedPost = await post.save();
		res
			.status(200)
			.json({ message: "Comment removed successfully", post: updatedPost });
	} catch (error) {
		console.error("Error removing comment:", error);
		res.status(500).json({ message: "Error removing comment" });
	}
});

module.exports = router;
