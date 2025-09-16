import React, { useState } from "react";
import PropTypes from "prop-types";
import { getResourceUrl } from "@/utils/apiUrl";

const PinnedMessages = ({ messages, currentUserId, onScrollToMessage }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Filter only pinned messages
    const pinnedMessages = messages.filter(msg => msg.isPinned && !msg.isDeleted);

    if (pinnedMessages.length === 0) {
        return null;
    }

    // Format timestamp
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Get the latest pinned message
    const latestPinnedMessage = pinnedMessages[pinnedMessages.length - 1];

    // Truncate content for preview
    const truncateContent = (content, maxLength = 50) => {
        if (!content) return "";
        return content.length > maxLength
            ? content.substring(0, maxLength) + "..."
            : content;
    };

    return (
        <div className="bg-gray-800/30 rounded-lg mb-2">
            <div className="p-2 flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center text-yellow-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span className="text-sm font-medium">
                        {pinnedMessages.length === 1
                            ? "1 Pinned Message"
                            : `${pinnedMessages.length} Pinned Messages`}
                    </span>
                </div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {!isExpanded ? (
                <div
                    className="px-3 py-2 border-t border-gray-700/50 flex items-center justify-between cursor-pointer hover:bg-gray-700/20"
                    onClick={() => onScrollToMessage(latestPinnedMessage._id)}
                >
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                            <span className="text-xs text-gray-400 mr-2">
                                {latestPinnedMessage.sender?.name || "User"}:
                            </span>
                            <span className="text-sm text-gray-300 truncate">
                                {latestPinnedMessage.image ? "[Image] " : ""}
                                {latestPinnedMessage.file ? "[File] " : ""}
                                {truncateContent(latestPinnedMessage.content)}
                            </span>
                        </div>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                        {formatTime(latestPinnedMessage.createdAt || latestPinnedMessage.timestamp)}
                    </span>
                </div>
            ) : (
                <div className="border-t border-gray-700/50 max-h-60 overflow-y-auto">
                    {pinnedMessages.map(msg => (
                        <div
                            key={msg._id}
                            className="px-3 py-2 hover:bg-gray-700/20 cursor-pointer border-b border-gray-700/30 last:border-b-0"
                            onClick={() => onScrollToMessage(msg._id)}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-medium text-blue-400">
                                    {msg.sender?.name || "User"}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {formatTime(msg.createdAt || msg.timestamp)}
                                </span>
                            </div>

                            <div className="text-sm text-gray-300">
                                {msg.content}
                                {msg.isEdited && (
                                    <span className="text-xs text-gray-500 ml-1">(edited)</span>
                                )}
                            </div>

                            {msg.image && (
                                <div className="mt-1">
                                    <img
                                        src={getResourceUrl(msg.image)}
                                        alt="Pinned"
                                        className="h-16 w-auto rounded object-cover"
                                    />
                                </div>
                            )}

                            {msg.file && (
                                <div className="mt-1 flex items-center text-xs text-blue-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="truncate">{msg.fileName || "File attachment"}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

PinnedMessages.propTypes = {
    messages: PropTypes.array.isRequired,
    currentUserId: PropTypes.string.isRequired,
    onScrollToMessage: PropTypes.func.isRequired
};

export default PinnedMessages;