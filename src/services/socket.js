import { io } from "socket.io-client";

const DEV_BASE_URL = "http://localhost:5000";
const PROD_BASE_URL = "https://quickchat.dpdns.org";
const BASE_URL = window.location.hostname === "localhost" ? DEV_BASE_URL : PROD_BASE_URL;

let socket;

export function connectSocket(token, userId) {
    if (!socket) {
        socket = io(BASE_URL, {
            auth: { token },
            transports: ["websocket"],
        });

        if (userId) {
            socket.emit("userConnected", userId);
        }

        // Handle connection events
        socket.on("connect", () => {
            console.log("Socket connected successfully");
            if (userId) {
                socket.emit("userConnected", userId);
            }
        });

        socket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
        });

        socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
        });
    }
    return socket;
}

export function getSocket() {
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

// Utility functions for common socket operations
export function joinConversation(conversationId) {
    if (socket && conversationId) {
        socket.emit("joinConversation", conversationId);
    }
}

export function leaveConversation(conversationId) {
    if (socket && conversationId) {
        socket.emit("leaveConversation", conversationId);
    }
}

export function sendTyping(conversationId, userId) {
    if (socket && conversationId && userId) {
        socket.emit("typing", { sender: userId, conversationId });
    }
}

export function sendStopTyping(conversationId, userId) {
    if (socket && conversationId && userId) {
        socket.emit("stopTyping", { sender: userId, conversationId });
    }
}

export function markMessagesSeen(conversationId, userId, messageIds) {
    if (socket && conversationId && userId && messageIds?.length > 0) {
        socket.emit("messageSeen", { conversationId, userId, messageIds });
    }
}

export function sendMessage(messageData) {
    if (socket && messageData) {
        socket.emit("sendMessage", messageData);
    }
}
