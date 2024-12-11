import { io } from "socket.io-client";

const socket = io("http://192.168.1.15:5000"); // Replace with your server IP or URL

export default socket;
