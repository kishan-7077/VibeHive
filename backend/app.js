require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyparser = require("body-parser");
const socketIo = require("socket.io");
const http = require("http");
const Message = require("./models/Message");

const port = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;
const app = express();

// Create an HTTP server to work with socket.io
const server = http.createServer(app);

// Set up Socket.IO with the server
const io = socketIo(server);

app.use(cors());
app.use(bodyparser.json());

mongoose
	.connect(MONGO_URL)
	.then(() => console.log("Connected to DB"))
	.catch((err) => console.log("Error in connection to DB: ", err));

io.on("connection", (socket) => {
	console.log("A user connected:", socket.id);

	socket.on("join_room", (room) => {
		socket.join(room);
		console.log(`User joined room: ${room}`);
	});

	socket.on("send_message", async ({ sender, receiver, content }) => {
		try {
			const newMessage = new Message({ sender, receiver, content });
			await newMessage.save();

			// Emit the message to the room
			io.to(receiver).emit("receive_message", { sender, content });
			io.to(sender).emit("receive_message", { sender, content });

			console.log(`Message sent: ${content} from ${sender} to ${receiver}`);
		} catch (error) {
			console.error("Error saving message:", error);
		}
	});

	socket.on("disconnect", () => {
		console.log("User disconnected:", socket.id);
	});
});

app.use("/users", require("./routes/userRoutes"));
app.use("/posts", require("./routes/postRoutes"));
app.use("/messages", require("./routes/messageRoutes"));

server.listen(port, () => {
	console.log(`Listening on port: ${port}`);
});
