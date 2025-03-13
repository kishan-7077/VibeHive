const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");

const User = require("../models/User");
const Post = require("../models/Post");

// Set up multer storage and file filter (optional)
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage }); // Create the upload middleware

const transporter = nodemailer.createTransport({
	service: "Gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

transporter.verify((error, success) => {
	if (error) {
		console.log("Error:", error);
	} else {
		console.log("SMTP connection successful:", success);
	}
});

const authenticateToken = (req, res, next) => {
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(" ")[1];

	if (!token)
		return res.status(401).json({ message: "Access denied, token missing" });

	jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
		if (err) return res.status(403).json({ message: "Invalid token" });

		req.user = user;

		next();
	});
};

router.get("/", authenticateToken, async (req, res) => {
	try {
		const currentUserId = req.user.id; // Get the current user ID from the token
		const users = await User.find();
		const updatedUsers = users.map((user) => {
			const isFollowing = user.followers.includes(currentUserId);
			return { ...user._doc, isFollowing };
		});
		res
			.status(200)
			.json({ message: "Successfully fetched users", users: updatedUsers });
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error fetching users", error: error.message });
	}
});

router.post("/login", async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ message: "User doesn't exist" });
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(401).json({ message: "Incorrect password" });
		}

		// Generate JWT
		const token = jwt.sign(
			{ id: user._id, email: user.email },
			process.env.JWT_SECRET,
			{
				expiresIn: "1h", // Token expires in 1 hour
			}
		);

		res.status(200).json({ message: "Login successful", token });
	} catch (error) {
		res.status(500).json({ message: "Error logging in", error: error.message });
	}
});

router.post("/signup", async (req, res) => {
	const { name, email, password, profileImage } = req.body;

	try {
		// Check if the user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(409).json({ message: "Email already registered" });
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create user
		const newUser = await User.create({
			name,
			email,
			password: hashedPassword,
			profileImage: profileImage,
			isVerified: false,
		});

		const verificationToken = jwt.sign(
			{ id: newUser._id, email: newUser.email },
			process.env.JWT_SECRET,
			{ expiresIn: "1h" }
		);

		const verificationLink = `${process.env.CLIENT_URL}/verify?token=${verificationToken}`;
		await transporter.sendMail({
			from: process.env.EMAIL_USER,
			to: newUser.email,
			subject: "Verify the User",
			html: `<p>Click <a href=${verificationLink}>here </a> to verify your email. This link expires in 1 hour</p>`,
		});

		res
			.status(201)
			.json({ message: "User successfully created. Verification Email sent" });
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error signing up backend", error: error.message });
	}
});

router.post(
	"/upload-profile-image",
	upload.single("profileImage"),
	async (req, res) => {
		// Retrieve the userId from the request body (optional)
		const userId = req.body.userId;

		// Ensure that a profile image is provided
		if (!req.file) {
			return res.status(400).json({ message: "Profile image is required" });
		}

		try {
			// Upload image to Cloudinary
			cloudinary.uploader
				.upload_stream(
					{ folder: "VibeHive_profile" },
					async (error, result) => {
						if (error) {
							console.error("Error uploading to Cloudinary:", error);
							return res.status(500).json({ message: "Error uploading image" });
						}

						const imageUrl = result.secure_url;
						console.log("Profile Image URL:", imageUrl);

						// If userId is provided, update the user's profile image in the database
						if (userId) {
							const updatedUser = await User.findByIdAndUpdate(
								userId,
								{ profileImage: imageUrl },
								{ new: true }
							);

							// Check if user was found and updated
							if (!updatedUser) {
								return res.status(404).json({ message: "User not found" });
							}

							// Send back the updated user
							res.status(200).json(updatedUser);
							return imageUrl;
						} else {
							// If no userId is provided, just return the image URL
							res
								.status(200)
								.json({ message: "Image uploaded successfully", imageUrl });
						}
					}
				)
				.end(req.file.buffer);
		} catch (error) {
			console.error("Error uploading profile image:", error);
			res.status(500).json({ message: "Error uploading profile image" });
		}
	}
);

router.get("/verify", async (req, res) => {
	const { token } = req.query;

	try {
		// Verify the token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Find the user and mark them as verified
		const user = await User.findById(decoded.id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		if (user.isVerified) {
			return res.status(400).json({ message: "User is already verified" });
		}

		// Update the user's verification status
		user.isVerified = true;
		await user.save();

		res.status(200).json({ message: "Email successfully verified" });
	} catch (error) {
		res
			.status(400)
			.json({ message: "Invalid or expired token", error: error.message });
	}
});

router.get("/profile", authenticateToken, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select("-password"); // Exclude password
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const posts = await Post.find({ user: user });
		const followerCount = user.followers.length;
		const followingCount = user.following.length;

		res
			.status(200)
			.json({ message: "Profile fetched successfully", user, posts });
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error fetching profile", error: error.message });
	}
});

router.put("/profile", authenticateToken, async (req, res) => {
	const { name, email } = req.body;
	try {
		const user = await User.findById(req.user.id);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		user.name = name || user.name;
		user.email = email || user.email;

		await user.save();

		res.status(200).json({ message: "Profile updated successfully", user });
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error updating profile", error: error.message });
	}
});

// Password reset route
router.post("/reset-password", async (req, res) => {
	const { email } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: "1h",
		});

		const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

		// send mail
		await transporter.sendMail({
			from: process.env.EMAIL_USER,
			to: user.email,
			subject: "Reset Your Password",
			html: `<p>Click <a href=${resetLink}>here</a> to reset your password. This link is valid for only 1 hour </p>`,
		});

		res.status(200).json({ message: "Password reset link sent" });
	} catch (error) {
		res.status(500).json({
			message: "Error sending reset password email",
			error: error.message,
		});
	}
});

router.post("/update-password", async (req, res) => {
	const { token, newPassword } = req.body;
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.id);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);

		user.password = hashedPassword;
		await user.save();

		res.status(200).json({ message: "Password updated successfully" });
	} catch (error) {
		res.status(400).json({
			message: "Invalid token or error resetting password",
			error: error.message,
		});
	}
});

router.post("/follow/:id", authenticateToken, async (req, res) => {
	console.log(req.user);

	try {
		const currentUser = await User.findById(req.user.id);
		const userToFollow = await User.findById(req.params.id);

		if (!userToFollow) {
			return res.status(404).json({ message: "User not found" });
		}

		if (currentUser.following.includes(userToFollow._id)) {
			return res.status(400).json({ message: "Already following this user" });
		}

		currentUser.following.push(userToFollow._id);
		userToFollow.followers.push(currentUser._id);

		await currentUser.save();
		await userToFollow.save();

		res.status(200).json({ message: "Followed successfully" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

router.post("/unfollow/:id", authenticateToken, async (req, res) => {
	try {
		const currentUser = await User.findById(req.user.id);
		const userToUnfollow = await User.findById(req.params.id);

		if (!userToUnfollow) {
			return res.status(404).json({ message: "User not found" });
		}

		if (!currentUser.following.includes(userToUnfollow._id)) {
			return res.status(400).json({ message: "Not following this user" });
		}

		currentUser.following.pull(userToUnfollow._id);
		userToUnfollow.followers.pull(currentUser._id);

		await currentUser.save();
		await userToUnfollow.save();

		res.status(200).json({ message: "Unfollowed successfully" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

router.get("/follow-status/:userId", authenticateToken, async (req, res) => {
	const { userId } = req.params; // Get the userId from the URL parameter
	const currentUserId = req.user.id; // Get the logged-in user's ID from the token payload

	try {
		// Find the user with the given userId
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		// Check if the logged-in user is following the specified user
		const isFollowing = user.followers.includes(currentUserId);

		return res.json({ isFollowing }); // Send the follow status as a response
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: "Server error" });
	}
});

module.exports = router;
