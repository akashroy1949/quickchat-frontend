import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import { getMessageDisplayStatus } from "@/utils/messageStatus";
import { subscribeToStatusUpdates } from "@/services/messageStatusService";
import { getResourceUrl } from "@/utils/apiUrl";
import API from "@/services/api";
import ReactionPicker from "./ReactionPicker";
import { notifyMessageEdited, notifyMessageDeleted, notifyMessagePinned, notifyMessageReaction } from "@/services/socket";

const StatusIcon = ({ status }) => {

    switch (status) {
        case "sent":
            return (
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20" title="Sent">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            );
        case "delivered":
            return (
                <div className="flex" title="Delivered">
                    <svg className="w-4 h-4 text-gray-400 -mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </div>
            );
        case "seen":
            return (
                <div className="flex" title="Seen">
                    <svg className="w-4 h-4 text-blue-400 -mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </div>
            );
        default:
            return null;
    }
};

StatusIcon.propTypes = {
    status: PropTypes.string,
};

const Message = ({ message, currentUserId, conversationId, isContinuation = false, onMessageUpdate }) => {
    // Ensure we have a valid currentUserId and message sender
    const isOwnMessage = currentUserId && message.sender?._id && message.sender._id === currentUserId;

    // Debug logging for message alignment issues
    React.useEffect(() => {
        if (!currentUserId) {
            console.warn("⚠️ Message component: currentUserId is undefined/null", { currentUserId, messageId: message._id });
        }
        if (!message.sender?._id) {
            console.warn("⚠️ Message component: message.sender._id is undefined/null", { messageId: message._id, message });
        }
    }, [currentUserId, message._id, message.sender?._id]);

    // Debug logging for reactions
    React.useEffect(() => {
        if (message.reactions && message.reactions.length > 0) {
            console.log("🎯 Message reactions loaded:", message.reactions);
            console.log("📝 Message ID:", message._id);
        }
    }, [message.reactions, message._id]);
    const [localStatus, setLocalStatus] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);
    const [showReactions, setShowReactions] = useState(false);
    const [showQuickReactions, setShowQuickReactions] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [rightClickMenu, setRightClickMenu] = useState(null);
    const editInputRef = useRef(null);
    const messageRef = useRef(null);

    // Common quick reactions
    const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "👏"];

    // Use the utility function to get message status
    const status = localStatus || getMessageDisplayStatus(message, currentUserId);

    // Subscribe to real-time status updates for this specific message
    React.useEffect(() => {
        if (!isOwnMessage || !conversationId) return; // Only listen for own messages

        // Subscribe to status updates for this conversation
        const unsubscribe = subscribeToStatusUpdates(conversationId, (statusUpdate) => {
            const { messageId, status: newStatus } = statusUpdate;
            if (messageId === message._id) {
                setLocalStatus(newStatus);
                // Force re-render by updating local status
            }
        });

        // Also listen for global events as fallback
        const handleStatusUpdate = (event) => {
            const { messageId, status: newStatus } = event.detail;
            if (messageId === message._id) {
                setLocalStatus(newStatus);
                // Force re-render by updating local status
            }
        };

        window.addEventListener('forceMessageStatusUpdate', handleStatusUpdate);

        return () => {
            unsubscribe();
            window.removeEventListener('forceMessageStatusUpdate', handleStatusUpdate);
        };
    }, [message._id, isOwnMessage, conversationId]);

    // Focus the edit input when editing starts
    React.useEffect(() => {
        if (isEditing && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [isEditing]);

    // Close context menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (rightClickMenu && !event.target.closest('.reaction-context-menu')) {
                setRightClickMenu(null);
            }
        };

        if (rightClickMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [rightClickMenu]);

    // Handle message edit
    const handleEditMessage = async () => {
        if (editContent.trim() === message.content) {
            setIsEditing(false);
            return;
        }

        try {
            const response = await API.editMessage(message._id, editContent.trim());
            if (response.data && response.data.data) {
                // Emit socket event for real-time updates
                notifyMessageEdited(message._id, editContent.trim(), conversationId);

                if (onMessageUpdate) {
                    onMessageUpdate(response.data.data);
                }
            }
            setIsEditing(false);
        } catch (error) {
            console.error("Error editing message:", error);
            // Revert to original content
            setEditContent(message.content);
            setIsEditing(false);
        }
    };

    // Handle message delete
    const handleDeleteMessage = async () => {
        if (!window.confirm("Are you sure you want to delete this message?")) {
            return;
        }

        try {
            await API.deleteMessage(message._id);

            // Emit socket event for real-time updates
            notifyMessageDeleted(message._id, conversationId);

            if (onMessageUpdate) {
                onMessageUpdate({ ...message, isDeleted: true });
            }
        } catch (error) {
            console.error("Error deleting message:", error);
        }
    };

    // Handle message pin/unpin
    const handlePinMessage = async () => {
        try {
            const response = await API.pinMessage(message._id);
            if (response.data && response.data.data) {
                // Emit socket event for real-time updates
                notifyMessagePinned(
                    message._id,
                    !message.isPinned,
                    currentUserId,
                    conversationId
                );

                if (onMessageUpdate) {
                    onMessageUpdate(response.data.data);
                }
            }
        } catch (error) {
            console.error("Error pinning message:", error);
        }
    };

    // Handle adding reaction
    const handleReaction = async (emoji) => {
        try {
            console.log("🎯 Adding reaction:", emoji, "to message:", message._id);
            console.log("👤 Current user ID:", currentUserId);

            // Optimistically update the UI immediately for the sender
            const optimisticMessage = { ...message };

            // Initialize reactions array if it doesn't exist
            if (!optimisticMessage.reactions) {
                optimisticMessage.reactions = [];
            }

            // Check if user already reacted with this emoji
            const existingReactionIndex = optimisticMessage.reactions.findIndex(
                reaction => reaction.user && reaction.user._id === currentUserId && reaction.emoji === emoji
            );

            console.log("🔍 Existing reaction index:", existingReactionIndex);

            if (existingReactionIndex !== -1) {
                // Remove the reaction
                console.log("🗑️ Removing existing reaction");
                optimisticMessage.reactions.splice(existingReactionIndex, 1);
            } else {
                // Add the reaction
                console.log("➕ Adding new reaction");
                optimisticMessage.reactions.push({
                    emoji,
                    user: { _id: currentUserId, name: "You" },
                    createdAt: new Date()
                });
            }

            console.log("📝 Optimistic message reactions:", optimisticMessage.reactions);

            // Immediately update the UI
            if (onMessageUpdate) {
                console.log("🔄 Calling onMessageUpdate with optimistic data");
                onMessageUpdate(optimisticMessage);
            } else {
                console.warn("⚠️ onMessageUpdate callback not provided");
            }

            // Then make the API call
            console.log("🌐 Making API call to backend");
            const response = await API.reactToMessage(message._id, emoji);
            console.log("📡 API response:", response);

            if (response.data && response.data.data) {
                // Emit socket event for real-time updates to other users
                console.log("📡 Emitting socket event for other users");
                notifyMessageReaction(
                    message._id,
                    response.data.data.reactions,
                    conversationId
                );

                // Update with the server response (in case there were conflicts)
                console.log("🔄 Updating with server response");
                if (onMessageUpdate) {
                    onMessageUpdate(response.data.data);
                }
            }
            setShowReactions(false);
        } catch (error) {
            console.error("❌ Error adding reaction:", error);
            // Revert optimistic update on error by refreshing from server
            if (onMessageUpdate) {
                // You might want to fetch the message again or handle the error appropriately
            }
        }
    };



    // Format timestamp
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Check if message is deleted
    if (message.isDeleted) {
        return (
            <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${isContinuation ? 'mt-0.5' : 'mt-2'}`}>
                <div className={`max-w-xs lg:max-w-md px-3 py-2 bg-gray-800/30 text-gray-400 italic rounded-lg`}>
                    <div className="flex items-center space-x-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>This message was deleted</span>
                    </div>
                </div>
            </div>
        );
    }


    // Group reactions by emoji
    const groupedReactions = message.reactions ? message.reactions.reduce((acc, reaction) => {
        if (!acc[reaction.emoji]) {
            acc[reaction.emoji] = [];
        }
        acc[reaction.emoji].push(reaction.user);
        return acc;
    }, {}) : {};

    // Debug grouped reactions
    if (Object.keys(groupedReactions).length > 0) {
        console.log("🔄 Grouped reactions for message", message._id, ":", groupedReactions);
    }

    return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${isContinuation ? 'mt-1' : 'mt-3'} group`}>
            <div
                ref={messageRef}
                className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-4 py-3 
                    ${message.isPinned ? 'border-l-2 border-blue-500' : ''}
                    ${isOwnMessage
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-800 text-gray-100'
                    }
                    ${isContinuation
                        ? (isOwnMessage ? 'rounded-lg rounded-tr-sm' : 'rounded-lg rounded-tl-sm')
                        : 'rounded-lg'
                    }
                    ${message.isPinned ? 'pin-pulse' : ''}
                    relative message-highlight
                `}
                onMouseEnter={() => setShowOptions(true)}
                onMouseLeave={() => setShowOptions(false)}
            >
                {/* Message options */}
                {showOptions && (
                    <div className={`absolute ${isOwnMessage ? 'left-0 -ml-10' : 'right-0 -mr-10'} top-0 flex space-x-1 message-options`}>
                        <button
                            className="p-1 bg-gray-700 rounded-full text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
                            onClick={() => {
                                setShowQuickReactions(!showQuickReactions);
                                setShowReactions(false);
                            }}
                            title="Quick React"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                        <button
                            className="p-1 bg-gray-700 rounded-full text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
                            onClick={() => {
                                setShowReactions(!showReactions);
                                setShowQuickReactions(false);
                            }}
                            title="All Emojis"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </button>
                        <button
                            className="p-1 bg-gray-700 rounded-full text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
                            onClick={handlePinMessage}
                            title={message.isPinned ? "Unpin" : "Pin"}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        </button>
                        {isOwnMessage && (
                            <>
                                <button
                                    className="p-1 bg-gray-700 rounded-full text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
                                    onClick={() => {
                                        setIsEditing(true);
                                        setEditContent(message.content);
                                    }}
                                    title="Edit"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    className="p-1 bg-gray-700 rounded-full text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
                                    onClick={handleDeleteMessage}
                                    title="Delete"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Quick reactions */}
                {showQuickReactions && (
                    <div className="absolute -top-10 left-0 z-10 bg-gray-800 rounded-full p-1 shadow-lg flex space-x-1 message-options">
                        {quickReactions.map(emoji => (
                            <button
                                key={emoji}
                                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-700 rounded-full transition-colors"
                                onClick={() => {
                                    handleReaction(emoji);
                                    setShowQuickReactions(false);
                                }}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}

                {/* Reaction picker */}
                {showReactions && (
                    <div className="absolute -top-[450px] left-0 z-50">
                        <ReactionPicker
                            onSelectEmoji={handleReaction}
                            onClose={() => setShowReactions(false)}
                        />
                    </div>
                )}

                {/* Pinned indicator */}
                {message.isPinned && (
                    <div className="flex items-center text-yellow-500 text-xs mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        <span>Pinned</span>
                    </div>
                )}

                {/* Message sender name (only for received messages in group chats) */}
                {!isOwnMessage && !isContinuation && message.sender?.name && (
                    <div className="text-xs text-emerald-400 mb-1 font-medium">
                        {message.sender.name}
                    </div>
                )}

                {/* Message content */}
                {isEditing ? (
                    <div className="flex flex-col space-y-2">
                        <textarea
                            ref={editInputRef}
                            className="w-full p-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={2}
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-500 transition-colors"
                                onClick={() => setIsEditing(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-500 transition-colors"
                                onClick={handleEditMessage}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="break-words">
                        {message.content}
                        {message.isEdited && (
                            <span className="text-xs text-gray-400 ml-1">(edited)</span>
                        )}
                    </div>
                )}

                {/* File attachment */}
                {message.file && (
                    <div className="mt-2">
                        {/* Video Preview */}
                        {message.fileType && message.fileType.startsWith('video/') && (
                            <div className="bg-gray-800/30 p-2 rounded">
                                <video
                                    controls
                                    className="max-w-xs max-h-48 rounded-lg"
                                    preload="metadata"
                                    onError={(e) => {
                                        console.error("Video failed to load:", message.file);
                                        e.target.style.display = 'none';
                                        e.target.nextElementSibling.style.display = 'block';
                                    }}
                                >
                                    <source src={getResourceUrl(message.file)} type={message.fileType} />
                                    Your browser does not support the video tag.
                                </video>
                                <div className="mt-1 text-xs text-gray-400 text-center" style={{ display: 'none' }}>
                                    Video failed to load - <a href={getResourceUrl(message.file)} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200">Download</a>
                                </div>
                            </div>
                        )}

                        {/* Audio Preview */}
                        {message.fileType && message.fileType.startsWith('audio/') && (
                            <div className="w-full -mx-4 px-4">
                                <audio
                                    controls
                                    className="w-full default-audio-player"
                                    style={{
                                        minWidth: '300px',
                                        maxWidth: '100%',
                                        height: '40px'
                                    }}
                                    onError={(e) => {
                                        console.error("Audio failed to load:", message.file);
                                        e.target.style.display = 'none';
                                        e.target.nextElementSibling.style.display = 'block';
                                    }}
                                >
                                    <source src={getResourceUrl(message.file)} type={message.fileType} />
                                    Your browser does not support the audio element.
                                </audio>
                                <div className="mt-1 text-xs text-gray-400 text-center" style={{ display: 'none' }}>
                                    Audio failed to load - <a href={getResourceUrl(message.file)} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200">Download</a>
                                </div>
                            </div>
                        )}

                        {/* Other Files (Documents, etc.) */}
                        {(!message.fileType || (!message.fileType.startsWith('video/') && !message.fileType.startsWith('audio/'))) && (
                            <div className="bg-gray-800/30 p-2 rounded flex items-center">
                                <div className="bg-gray-700 p-2 rounded-full mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <a
                                        href={getResourceUrl(message.file)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-300 hover:text-blue-200 text-sm block truncate"
                                    >
                                        {message.fileName || "File attachment"}
                                    </a>
                                    {message.fileSize && (
                                        <span className="text-xs text-gray-400">
                                            {Math.round(message.fileSize / 1024)} KB
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Image attachment */}
                {message.image && (
                    <div className="mt-2">
                        <button
                            type="button"
                            className="p-0 border-none bg-transparent max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={() => window.open(getResourceUrl(message.image), '_blank')}
                            aria-label="Open image in new tab"
                        >
                            <img
                                src={getResourceUrl(message.image)}
                                alt="Shared"
                                className="max-w-xs max-h-48 object-contain rounded-lg"
                                draggable={false}
                                onError={(e) => {
                                    console.error("Image failed to load:", message.image);
                                    e.target.src = "https://via.placeholder.com/200x150?text=Image+Failed+to+Load";
                                }}
                            />
                        </button>
                    </div>
                )}

                {/* Reactions display */}
                {message.reactions && message.reactions.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                        {Object.entries(groupedReactions).map(([emoji, users]) => {
                            // Check if current user has this reaction
                            const userReaction = message.reactions.find(r =>
                                r.user && r.user._id === currentUserId && r.emoji === emoji
                            );

                            return (
                                <div
                                    key={emoji}
                                    className={`bg-gray-700/50 rounded-full px-2 py-0.5 flex items-center text-sm cursor-pointer transition-all duration-200 hover:bg-gray-600/50 ${userReaction ? 'ring-1 ring-blue-400/50' : ''
                                        }`}
                                    title={`${users.map(u => u.name || 'User').join(', ')}${userReaction ? ' (Click to remove your reaction)' : ''}`}
                                    onClick={() => {
                                        if (userReaction) {
                                            // Remove user's reaction
                                            handleReaction(emoji);
                                        }
                                    }}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        if (userReaction) {
                                            setRightClickMenu({
                                                emoji,
                                                x: e.clientX,
                                                y: e.clientY
                                            });
                                        }
                                    }}
                                >
                                    <span className="mr-1">{emoji}</span>
                                    <span className="text-xs">{users.length}</span>
                                    {userReaction && (
                                        <button
                                            className="ml-1 text-xs text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleReaction(emoji);
                                            }}
                                            title="Remove your reaction"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Right-click context menu for reactions */}
                {rightClickMenu && (
                    <div
                        className="fixed z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-lg py-2 min-w-[120px] reaction-context-menu"
                        style={{
                            left: rightClickMenu.x,
                            top: rightClickMenu.y
                        }}
                        onClick={() => setRightClickMenu(null)}
                    >
                        <button
                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors flex items-center"
                            onClick={() => {
                                handleReaction(rightClickMenu.emoji);
                                setRightClickMenu(null);
                            }}
                        >
                            <span className="mr-2">🗑️</span>
                            Remove {rightClickMenu.emoji}
                        </button>
                    </div>
                )}

                {/* Message timestamp and status */}
                <div className={`flex items-center justify-end mt-1 space-x-1 ${isOwnMessage ? 'text-gray-300/70' : 'text-gray-400/70'}`}>
                    <span className="text-[10px]">
                        {formatTime(message.createdAt || message.timestamp)}
                    </span>
                    {isOwnMessage && status && <StatusIcon status={status} />}
                </div>

                {/* Message tail for non-continuation messages - REMOVED to eliminate unwanted arrows */}
                {/* {!isContinuation && (
                    <div
                        className={`absolute top-0 w-3 h-3
                            ${isOwnMessage
                                ? 'right-0 -mr-1.5 bg-gray-700'
                                : 'left-0 -ml-1.5 bg-gray-800'
                            }
                            ${isOwnMessage
                                ? 'rounded-bl-lg'
                                : 'rounded-br-lg'
                            }
                        `}
                        style={{
                            clipPath: isOwnMessage
                                ? 'polygon(0 0, 100% 0, 100% 100%)'
                                : 'polygon(0 0, 100% 0, 0 100%)'
                        }}
                    />
                )} */}
            </div>
        </div>
    );
};

Message.propTypes = {
    message: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        sender: PropTypes.shape({
            _id: PropTypes.string,
            name: PropTypes.string,
        }),
        createdAt: PropTypes.string,
        timestamp: PropTypes.string,
        seen: PropTypes.bool,
        delivered: PropTypes.bool,
        file: PropTypes.string,
        fileName: PropTypes.string,
        fileSize: PropTypes.number,
        image: PropTypes.string,
        isEdited: PropTypes.bool,
        editedAt: PropTypes.string,
        isPinned: PropTypes.bool,
        pinnedAt: PropTypes.string,
        pinnedBy: PropTypes.object,
        isDeleted: PropTypes.bool,
        deletedAt: PropTypes.string,
        reactions: PropTypes.arrayOf(PropTypes.shape({
            emoji: PropTypes.string,
            user: PropTypes.object,
            createdAt: PropTypes.string
        }))
    }).isRequired,
    currentUserId: PropTypes.string.isRequired,
    conversationId: PropTypes.string,
    isLastMessage: PropTypes.bool,
    isContinuation: PropTypes.bool,
    onMessageUpdate: PropTypes.func
};

export default Message;