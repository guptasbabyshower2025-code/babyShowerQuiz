import { io } from "socket.io-client";
export const socket = io("https://babyshowerquiz.onrender.com", {
  transports: ["websocket"],
});