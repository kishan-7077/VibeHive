import { io } from "socket.io-client";
import { API_URL } from "@env";

const socket = io(`${API_URL}`); // Replace with your server IP or URL

export default socket;
