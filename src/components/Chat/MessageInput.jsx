import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FaPaperPlane, FaPaperclip, FaMicrophone, FaTimes } from "react-icons/fa";
import { BsEmojiSmile } from "react-icons/bs";
import EmojiPicker from "emoji-picker-react";
import API from "@/services/api";
import { connectSocket, sendMessageWithStatus, sendTyping, sendStopTyping } from "@/services/socket";

const MessageInput = ({ conversationId, onMessageSent }) => {
    const fileInputRef = useRef();
    const [content, setContent] = useState("");
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [sending, setSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);
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

        if (!userId) {
            console.warn("🔤 Cannot send typing event: missing userId");
            return;
        }

        // Connect socket if needed
        connectSocket(token, userId);

        if (!isTyping) {
            setIsTyping(true);
            sendTyping(userId, conversationId);
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing after 3 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            sendStopTyping(userId, conversationId);
        }, 3000);
    };

    const handleSend = async () => {
        if (!content.trim() && !file) return;
        setSending(true);

        // Stop typing when sending message
        if (isTyping) {
            const userId = getUserId();
            sendStopTyping(userId, conversationId);
            setIsTyping(false);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        }

        try {
            const formData = new FormData();
            formData.append("conversationId", conversationId);
            if (content) formData.append("content", content);

            if (file) {
                // Add file to form data
                formData.append("file", file);

                // Also add file metadata as separate fields for redundancy
                formData.append("fileName", file.name);
                formData.append("fileSize", file.size);
                formData.append("fileType", file.type);

                console.log("Sending file:", {
                    name: file.name,
                    size: file.size,
                    type: file.type
                });
            }

            console.log("Sending message with formData");
            const res = await API.sendMessage(formData);
            const token = localStorage.getItem("token");
            const userId = getUserId();
            connectSocket(token, userId);
            const messageObj = res?.data?.data;

            // Log the response from the server
            console.log("Message sent response:", messageObj);

            // Create a complete message object with all necessary fields
            const completeMessageObj = {
                _id: messageObj?._id,
                sender: messageObj?.sender || { _id: userId },
                conversationId: conversationId,
                conversation: conversationId, // Include both formats for compatibility
                content: content || "",
                file: messageObj?.file || null,
                fileName: messageObj?.fileName || (file ? file.name : null),
                fileSize: messageObj?.fileSize || (file ? file.size : null),
                fileType: file ? file.type : null,
                image: messageObj?.image || null,
                createdAt: messageObj?.createdAt || new Date().toISOString(),
                delivered: false,  // Initially not delivered
                seen: false       // Initially not seen
            };

            // Log the complete message object for debugging
            console.log("Complete message object:", {
                _id: completeMessageObj._id,
                content: completeMessageObj.content,
                file: completeMessageObj.file ? "Yes" : "No",
                fileName: completeMessageObj.fileName,
                image: completeMessageObj.image ? "Yes" : "No"
            });

            // Use the enhanced send function with proper status tracking
            sendMessageWithStatus(completeMessageObj);

            // Pass the complete message object to the parent component
            if (onMessageSent) onMessageSent(completeMessageObj);
            setContent("");
            setFile(null);
            setFilePreview(null);
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
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);

            // Log file details for debugging
            console.log("File selected:", {
                name: selectedFile.name,
                type: selectedFile.type,
                size: selectedFile.size
            });

            // Create preview URL for images, videos, and audio
            if (selectedFile.type.startsWith('image/') ||
                selectedFile.type.startsWith('video/') ||
                selectedFile.type.startsWith('audio/')) {
                const previewUrl = URL.createObjectURL(selectedFile);
                setFilePreview(previewUrl);
                console.log("Media preview created for:", selectedFile.type);
            } else {
                // For other files, just show the file name
                setFilePreview(null);
                console.log("Non-media file selected");
            }
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Handle emoji selection
    const handleEmojiClick = (emojiData) => {
        setContent(prevContent => prevContent + emojiData.emoji);
        setShowEmojiPicker(false);
    };

    // Toggle emoji picker
    const toggleEmojiPicker = () => {
        setShowEmojiPicker(prevState => !prevState);
    };

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Cleanup typing timeout on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="flex flex-col p-4 bg-gray-800 border-t border-gray-700 gap-3">
            {/* File Preview Section */}
            {file && (
                <div className="flex items-center mb-2 bg-gray-700 rounded-lg p-3 w-full max-w-md">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                            {filePreview ? (
                                <div className="relative mr-3">
                                    {file.type.startsWith('image/') && (
                                        <img
                                            src={filePreview}
                                            alt="Preview"
                                            className="h-16 w-16 object-cover rounded-md"
                                        />
                                    )}
                                    {file.type.startsWith('video/') && (
                                        <video
                                            src={filePreview}
                                            className="h-16 w-16 object-cover rounded-md"
                                            muted
                                            preload="metadata"
                                        />
                                    )}
                                    {file.type.startsWith('audio/') && (
                                        <div className="flex items-center justify-center h-16 w-16 bg-gray-600 rounded-md">
                                            <span className="text-white text-lg">🎵</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-16 w-16 bg-gray-600 rounded-md mr-3">
                                    <FaPaperclip size={20} className="text-gray-300" />
                                </div>
                            )}

                            <div className="flex flex-col">
                                <span className="text-white text-sm font-medium truncate max-w-[180px]">
                                    {file.name}
                                </span>
                                <span className="text-gray-400 text-xs">
                                    {(file.size / 1024).toFixed(1)} KB • {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleRemoveFile}
                            className="text-gray-400 ml-2 p-2 hover:text-red-400 bg-gray-600 rounded-full"
                        >
                            <FaTimes size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Message Input Section */}
            <div className="flex items-center gap-3">
                <div className="flex items-center space-x-2 text-gray-400 relative">
                    <button
                        onClick={toggleEmojiPicker}
                        className="hover:text-gray-200 p-2"
                        disabled={sending}
                    >
                        <BsEmojiSmile size={22} />
                    </button>
                    {showEmojiPicker && (
                        <div
                            className="absolute bottom-12 left-0 z-10"
                            ref={emojiPickerRef}
                        >
                            <EmojiPicker
                                onEmojiClick={handleEmojiClick}
                                searchDisabled={false}
                                width={300}
                                height={400}
                                theme="dark"
                            />
                        </div>
                    )}
                    <button
                        onClick={handleAttach}
                        className="hover:text-gray-200 p-2"
                        disabled={sending}
                    >
                        <FaPaperclip size={20} />
                    </button>
                </div>

                <div className="flex-1 bg-gray-700 rounded-lg px-4 py-3">
                    <textarea
                        className="w-full bg-transparent text-white resize-none max-h-32 min-h-[24px] focus:outline-none placeholder:text-gray-400"
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
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                    disabled={sending}
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                />

                <button
                    onClick={handleSend}
                    className={`p-3 rounded-lg ${content.trim() || file
                        ? 'bg-green-600 text-white hover:bg-green-500'
                        : 'bg-gray-600 text-gray-400 hover:bg-gray-500'
                        } disabled:opacity-50`}
                    disabled={sending || (!content.trim() && !file)}
                >
                    {content.trim() || file ? (
                        <FaPaperPlane size={18} />
                    ) : (
                        <FaMicrophone size={18} />
                    )}
                </button>
            </div>
        </div>
    );
};

MessageInput.propTypes = {
    conversationId: PropTypes.string,
    onMessageSent: PropTypes.func,
};

export default MessageInput;
