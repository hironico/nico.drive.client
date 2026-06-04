import { io } from "socket.io-client";

let socketInstance = null;

/**
 * Get or create the Socket.IO connection to the server.
 * The socket connects to the same origin (empty URL = same host/port).
 */
export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io("", {
      autoConnect: false,
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
  }
  return socketInstance;
};

/**
 * Connect the socket if not already connected.
 * Returns the socket instance.
 */
export const connectSocket = () => {
  const socket = getSocket();
  if (!socket.connected) {
    socket.connect();
    console.log("Socket.IO connecting...");
  }
  return socket;
};

/**
 * Disconnect the socket.
 */
export const disconnectSocket = () => {
  if (socketInstance && socketInstance.connected) {
    socketInstance.disconnect();
    console.log("Socket.IO disconnected.");
  }
};