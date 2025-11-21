// socket.js
import { io } from "socket.io-client";

const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const socket = io(backend, {
  autoConnect: false,
  transports: ["websocket"],
  withCredentials: true,
});

// helper to join user room
export const joinUserRoom = (userId) => {
  if (socket.connected && userId) {
    socket.emit("join_user", userId.toString());
  }
};
