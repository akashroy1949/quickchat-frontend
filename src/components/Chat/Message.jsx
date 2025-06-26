import React from "react";
import PropTypes from "prop-types";
import { getMessageDisplayStatus } from "@/utils/messageStatus";
import { subscribeToStatusUpdates } from "@/services/messageStatusService";

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

const Message = ({ message, currentUserId, isLastMessage, conversationId }) => {
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
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isOwnMessage
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-white'
                }`}>
                {/* Message sender name (only for received messages) */}
                {!isOwnMessage && (
                    <div className="text-xs text-gray-300 mb-1 font-medium">
                        {message.sender?.name || "User"}
                    </div>
                )}

                {/* Message content */}
                <div className="break-words">
                    {message.content}
                </div>

                {/* File attachment */}
                {message.file && (
                    <div className="mt-2">
                        <a
                            href={message.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-300 underline hover:text-blue-200 text-sm"
                        >
                            📎 File attachment
                        </a>
                    </div>
                )}

                {/* Image attachment */}
                {message.image && (
                    <div className="mt-2">
                        <button
                            type="button"
                            className="p-0 border-none bg-transparent max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={() => window.open(message.image, '_blank')}
                            aria-label="Open image in new tab"
                        >
                            <img
                                src={message.image}
                                alt="Shared"
                                className="max-w-full rounded-lg"
                                draggable={false}
                            />
                        </button>
                    </div>
                )}

                {/* Message timestamp and status */}
                <div className={`flex items-center justify-end mt-1 space-x-1 ${isOwnMessage ? 'text-blue-200' : 'text-gray-400'
                    }`}>
                    <span className="text-xs">
                        {formatTime(message.createdAt || message.timestamp)}
                    </span>
                    {status && <StatusIcon status={status} />}
                </div>
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
        image: PropTypes.string,
    }).isRequired,
    currentUserId: PropTypes.string.isRequired,
    conversationId: PropTypes.string,
    isLastMessage: PropTypes.bool,
};

export default Message;