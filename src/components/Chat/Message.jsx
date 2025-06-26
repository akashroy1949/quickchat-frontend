import React from "react";
import PropTypes from "prop-types";
import { getMessageDisplayStatus } from "@/utils/messageStatus";
import { subscribeToStatusUpdates } from "@/services/messageStatusService";
import { getResourceUrl } from "@/utils/apiUrl";

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

const Message = ({ message, currentUserId, isLastMessage, conversationId, isContinuation = false }) => {
    const isOwnMessage = message.sender?._id === currentUserId;
    const [forceUpdate, setForceUpdate] = React.useState(0);
    const [localStatus, setLocalStatus] = React.useState(null);

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
                setForceUpdate(prev => prev + 1); // Force re-render
            }
        });

        // Also listen for global events as fallback
        const handleStatusUpdate = (event) => {
            const { messageId, status: newStatus } = event.detail;
            if (messageId === message._id) {

                setLocalStatus(newStatus);
                setForceUpdate(prev => prev + 1); // Force re-render
            }
        };

        window.addEventListener('forceMessageStatusUpdate', handleStatusUpdate);

        return () => {
            unsubscribe();
            window.removeEventListener('forceMessageStatusUpdate', handleStatusUpdate);
        };
    }, [message._id, isOwnMessage, conversationId]);



    // Format timestamp
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${isContinuation ? 'mt-0.5' : 'mt-2'}`}>
            <div
                className={`max-w-xs lg:max-w-md px-3 py-2 
                    ${isOwnMessage
                        ? 'bg-[#005c4b] text-white'
                        : 'bg-[#202c33] text-white'
                    }
                    ${isContinuation
                        ? (isOwnMessage ? 'rounded-lg rounded-tr-sm' : 'rounded-lg rounded-tl-sm')
                        : 'rounded-lg'
                    }
                    relative
                `}
            >
                {/* Message sender name (only for received messages in group chats) */}
                {!isOwnMessage && !isContinuation && message.sender?.name && (
                    <div className="text-xs text-emerald-400 mb-1 font-medium">
                        {message.sender.name}
                    </div>
                )}

                {/* Message content */}
                <div className="break-words">
                    {message.content}
                </div>

                {/* File attachment */}
                {message.file && (
                    <div className="mt-2 bg-gray-800/30 p-2 rounded flex items-center">
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

                {/* Image attachment */}
                {message.image && (
                    <div className="mt-2">
                        <button
                            type="button"
                            className="p-0 border-none bg-transparent max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={() => window.open(getResourceUrl(message.image), '_blank')}
                            aria-label="Open image in new tab"
                        >
                            <img
                                src={getResourceUrl(message.image)}
                                alt="Shared"
                                className="max-w-full rounded-lg"
                                draggable={false}
                                onError={(e) => {
                                    console.error("Image failed to load:", message.image);
                                    e.target.src = "https://via.placeholder.com/400x300?text=Image+Failed+to+Load";
                                }}
                            />
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

                {/* Message tail for non-continuation messages */}
                {!isContinuation && (
                    <div
                        className={`absolute top-0 w-3 h-3 
                            ${isOwnMessage
                                ? 'right-0 -mr-1.5 bg-[#005c4b]'
                                : 'left-0 -ml-1.5 bg-[#202c33]'
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
                )}
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
    }).isRequired,
    currentUserId: PropTypes.string.isRequired,
    conversationId: PropTypes.string,
    isLastMessage: PropTypes.bool,
    isContinuation: PropTypes.bool,
};

export default Message;