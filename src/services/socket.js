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

            if (userId) {
                socket.emit("userConnected", userId);
            }
        });

        socket.on("disconnect", (reason) => {

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

export function sendTyping(senderId, conversationId) {
    if (socket && senderId && conversationId) {

        socket.emit("typing", { sender: senderId, conversationId });
    }
}

export function sendStopTyping(senderId, conversationId) {
    if (socket && senderId && conversationId) {

        socket.emit("stopTyping", { sender: senderId, conversationId });
    }
}

// Legacy functions for direct messages (backward compatibility)
export function sendDirectTyping(senderId, receiverId) {
    if (socket && senderId && receiverId) {
        socket.emit("directTyping", { sender: senderId, receiver: receiverId });
    }
}

export function sendDirectStopTyping(senderId, receiverId) {
    if (socket && senderId && receiverId) {
        socket.emit("directStopTyping", { sender: senderId, receiver: receiverId });
    }
}

export function markMessagesSeen(conversationId, userId, messageIds) {
    if (socket && conversationId && userId && messageIds?.length > 0) {

        socket.emit("messageSeen", {
            conversationId,
            seenByUserId: userId, // Clearer naming
            messageIds
        });
    }
}

export function markMessagesDelivered(conversationId, messageIds, deliveredToUserId) {
    if (socket && conversationId && messageIds?.length > 0) {
        const userId = localStorage.getItem("userId");

        socket.emit("messageDelivered", {
            conversationId,
            messageIds,
            deliveredToUserId: deliveredToUserId || userId
        });
    }
}

// Enhanced function to send message with proper status tracking
export function sendMessageWithStatus(messageData) {
    if (socket && messageData) {

        socket.emit("sendMessage", {
            ...messageData,
            timestamp: new Date().toISOString()
        });
    }
}

export function sendMessage(messageData) {
    if (socket && messageData) {
        socket.emit("sendMessage", messageData);
    }
}

// Function to request a refresh of conversations
export function requestConversationsRefresh() {
    if (socket) {
        socket.emit("requestConversationsRefresh");
    }
}
