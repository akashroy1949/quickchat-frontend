import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import API from "@/services/api";
import { connectSocket } from "@/services/socket";
import TypingIndicator from "./TypingIndicator";
import PropTypes from "prop-types";

const MessageList = ({ conversationId, newMessage }) => {
    const [messages, setMessages] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const messagesRef = useRef([]);
    const messagesEndRef = useRef(null);

    // Get user data from Redux as fallback
    const loginData = useSelector((state) => state.loginUser);

    // Helper function to get userId
    const getUserId = () => {
        let userId = localStorage.getItem("userId");
        if (!userId && loginData?.data?.data?._id) {
            userId = loginData.data.data._id;
            localStorage.setItem("userId", userId); // Store it for future use
        }
        return userId;
    };
    useEffect(() => {
        if (!conversationId) return;
        API.fetchMessages({ conversationId })
            .then(res => {
                setMessages(res.data.messages || []);
                messagesRef.current = res.data.messages || [];
            })
            .catch(() => {
                setMessages([]);
                messagesRef.current = [];
            });
        // Setup socket listener for real-time
        const token = localStorage.getItem("token");
        const userId = getUserId();
        const socket = connectSocket(token, userId);
        socket.emit("joinConversation", conversationId);
        socket.on("messageReceived", (msg) => {
            if (msg.conversationId === conversationId) {
                setMessages(prev => {
                    if (prev.some(m => m._id === msg._id)) return prev;
                    return [...prev, msg];
                });
                messagesRef.current = [...messagesRef.current, msg];
            }
        });

        // Handle typing indicators
        socket.on("typing", (data) => {
            if (data.conversationId === conversationId) {
                const currentUserId = getUserId();
                if (data.sender !== currentUserId) {
                    setTypingUsers(prev => {
                        if (!prev.includes(data.sender)) {
                            return [...prev, data.sender];
                        }
                        return prev;
                    });
                }
            }
        });

        socket.on("stopTyping", (data) => {
            if (data.conversationId === conversationId) {
                setTypingUsers(prev => prev.filter(userId => userId !== data.sender));
            }
        });

        // Handle conversation updates
        socket.on("conversationUpdated", (data) => {
            if (data.conversationId === conversationId) {
                // You can emit this to parent component if needed
                console.log("Conversation updated:", data);
            }
        });

        // Handle message seen events
        socket.on("messageSeen", (data) => {
            if (data.conversationId === conversationId) {
                // Update message seen status if needed
                console.log("Messages seen:", data);
            }
        });

        return () => {
            socket.emit("leaveConversation", conversationId);
            socket.off("messageReceived");
            socket.off("typing");
            socket.off("stopTyping");
            socket.off("conversationUpdated");
            socket.off("messageSeen");
        };
    }, [conversationId]);
    // Optimistic update for newMessage
    useEffect(() => {
        if (newMessage && (newMessage.conversation === conversationId || newMessage.conversationId === conversationId)) {
            setMessages(prev => {
                if (prev.some(m => m._id === newMessage._id)) return prev;
                return [...prev, newMessage];
            });
            messagesRef.current = [...messagesRef.current, newMessage];
        }
    }, [newMessage, conversationId]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle message seen functionality
    useEffect(() => {
        if (messages.length > 0 && conversationId) {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");
            const socket = connectSocket(token, userId);

            // Mark messages as seen after a short delay
            const timer = setTimeout(() => {
                const unseenMessageIds = messages
                    .filter(msg => msg.sender?._id !== userId && !msg.seen)
                    .map(msg => msg._id);

                if (unseenMessageIds.length > 0) {
                    socket.emit("messageSeen", {
                        conversationId,
                        userId,
                        messageIds: unseenMessageIds
                    });
                }
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [messages, conversationId]);

    return (
        <div className="p-4 space-y-2">
            {messages.length === 0 ? (
                <div className="bg-gray-800 p-2 rounded text-white">No messages yet.</div>
            ) : (
                messages.map(msg => (
                    <div key={msg._id} className="bg-gray-800 p-2 rounded text-white">
                        <span className="font-bold">{msg.sender?.name || "User"}:</span> {msg.content}
                        {msg.file && (
                            <a href={msg.file} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-400 underline">File</a>
                        )}
                        {msg.image && (
                            <img src={msg.image} alt="Shared" className="mt-2 max-w-xs rounded" />
                        )}
                    </div>
                ))
            )}

            {/* Typing indicators */}
            <TypingIndicator typingUsers={typingUsers} />

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
        </div>
    );
};

MessageList.propTypes = {
    conversationId: PropTypes.string,
    newMessage: PropTypes.object,
};

export default MessageList;
