import React, { useRef, useState, useEffect } from "react";
import { FaPaperPlane, FaPaperclip } from "react-icons/fa";
import API from "@/services/api";
import { connectSocket } from "@/services/socket";

const MessageInput = ({ conversationId, onMessageSent }) => {
    const fileInputRef = useRef();
    const [content, setContent] = useState("");
    const [file, setFile] = useState(null);
    const [sending, setSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);

    // Helper function to get userId
    const getUserId = () => {
        let userId = localStorage.getItem("userId");

        // If no userId, try to extract from token
        if (!userId) {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    userId = payload.id || payload._id || payload.userId;
                    if (userId) {
                        localStorage.setItem("userId", userId);
                    }
                } catch (e) {
                    console.error("Failed to decode token:", e);
                }
            }
        }

        return userId;
    };

    // Handle typing indicators
    const handleTyping = () => {
        if (!conversationId) return;

        const token = localStorage.getItem("token");
        const userId = getUserId();

        if (!userId) return;

        const socket = connectSocket(token, userId);

        if (!isTyping) {
            setIsTyping(true);
            socket.emit("typing", {
                sender: userId,
                conversationId
            });
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing after 3 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socket.emit("stopTyping", {
                sender: userId,
                conversationId
            });
        }, 3000);
    };

    const handleSend = async () => {
        if (!content.trim() && !file) return;
        setSending(true);

        // Stop typing when sending message
        if (isTyping) {
            const token = localStorage.getItem("token");
            const userId = getUserId();
            const socket = connectSocket(token, userId);
            socket.emit("stopTyping", {
                sender: userId,
                conversationId
            });
            setIsTyping(false);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        }

        try {
            const formData = new FormData();
            formData.append("conversationId", conversationId);
            if (content) formData.append("content", content);
            if (file) formData.append("file", file);
            const res = await API.sendMessage(formData);
            const token = localStorage.getItem("token");
            const userId = getUserId();
            const socket = connectSocket(token, userId);
            const messageObj = res?.data?.data;
            socket.emit("sendMessage", {
                _id: messageObj?._id,
                sender: messageObj?.sender || { _id: userId },
                conversationId,
                content,
                file: messageObj?.file || null,
                image: messageObj?.image || null,
                createdAt: messageObj?.createdAt || new Date().toISOString(),
            });
            if (onMessageSent) onMessageSent(messageObj);
            setContent("");
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch {
            // Optionally show error
        } finally {
            setSending(false);
        }
    };
    const handleAttach = () => {
        fileInputRef.current.click();
    };
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Cleanup typing timeout on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="flex items-end p-4 border-t border-gray-800 bg-gray-900 gap-2">
            <button onClick={handleAttach} className="text-gray-400 hover:text-white mb-1" disabled={sending}>
                <FaPaperclip />
            </button>
            <textarea
                className="flex-1 bg-gray-800 rounded px-3 py-2 text-white resize-none max-h-32 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-white/40"
                placeholder="Type a message..."
                value={content}
                onChange={e => {
                    setContent(e.target.value);
                    handleTyping();
                }}
                onKeyDown={handleKeyDown}
                disabled={sending}
                rows={1}
                style={{ overflowY: 'auto' }}
            />
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
                disabled={sending}
            />
            <button onClick={handleSend} className="text-blue-500 hover:text-blue-700 mb-1 px-2 py-2 rounded-full disabled:opacity-50" disabled={sending || (!content.trim() && !file)}>
                <FaPaperPlane size={20} />
            </button>
        </div>
    );
};

export default MessageInput;
