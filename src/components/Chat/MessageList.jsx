import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import API from "@/services/api";
import { connectSocket, markMessagesSeen, markMessagesDelivered, joinConversation, leaveConversation, getSocket } from "@/services/socket";
import {
    normalizeMessage,
    updateMessageDelivered,
    updateMessagesSeen,
    getUnseenMessageIds,
    getUndeliveredMessageIds
} from "@/utils/messageStatus";
import { useGlobalMessageStatus } from "@/hooks/useGlobalMessageStatus";

import messageStatusManager, { addStatusListener, applyStatusUpdates } from "@/utils/messageStatusManager";
import { subscribeToStatusUpdates } from "@/services/messageStatusService";
import TypingIndicator from "./TypingIndicator";
import Message from "./Message";
import PropTypes from "prop-types";

const MessageList = ({ conversationId, newMessage, onMessagesUpdate }) => {
    const [messages, setMessages] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const [forceUpdateCounter, setForceUpdateCounter] = useState(0);
    const messagesRef = useRef([]);
    const messagesEndRef = useRef(null);

    // Get user data from Redux as fallback
    const loginData = useSelector((state) => state.loginUser);

    // Use global message status hook
    const { userId: globalUserId } = useGlobalMessageStatus();

    // Helper function to get userId
    const getUserId = React.useCallback(() => {
        let userId = localStorage.getItem("userId");
        if (!userId && loginData?.data?.data?._id) {
            userId = loginData.data.data._id;
            localStorage.setItem("userId", userId); // Store it for future use
        }
        return userId;
    }, [loginData]);

    // Get current user ID once and memoize it
    const currentUserId = getUserId();

    // Listen for status updates from the centralized manager
    useEffect(() => {
        if (!conversationId) return;

        // Subscribe to real-time status updates for immediate UI response
        const unsubscribeStatusService = subscribeToStatusUpdates(conversationId, (statusUpdate) => {
            const { messageId, status } = statusUpdate;


            // Immediately update the message in the UI
            setMessages(prevMessages => {
                const updatedMessages = prevMessages.map(message => {
                    if (message._id === messageId) {
                        return {
                            ...message,
                            delivered: status === 'delivered' || status === 'seen',
                            seen: status === 'seen'
                        };
                    }
                    return message;
                });

                messagesRef.current = updatedMessages;

                if (onMessagesUpdate) {
                    onMessagesUpdate(updatedMessages);
                }

                // Force React to re-render immediately
                setForceUpdateCounter(prev => prev + 1);

                return updatedMessages;
            });
        });

        // Listen to the centralized status manager
        const unsubscribe = addStatusListener((updateConversationId, updates) => {
            if (updateConversationId === conversationId) {



                // Apply status updates to current messages manually
                setMessages(prevMessages => {
                    const updatedMessages = prevMessages.map(message => {
                        // Check if this message has a status update
                        const update = updates.find(u => u.messageId === message._id);
                        if (update) {

                            return {
                                ...message,
                                delivered: update.status === 'delivered' || update.status === 'seen',
                                seen: update.status === 'seen'
                            };
                        }
                        return message;
                    });

                    // Update the ref as well
                    messagesRef.current = updatedMessages;

                    // Notify parent component
                    if (onMessagesUpdate) {
                        onMessagesUpdate(updatedMessages);
                    }

                    return updatedMessages;
                });

                // Log status flow for debugging

            }
        });

        // Force update listener for immediate UI updates
        const handleForceStatusUpdate = (event) => {
            const { conversationId: eventConvId, messageId, status } = event.detail;

            if (eventConvId === conversationId) {


                setMessages(prevMessages => {
                    const updatedMessages = prevMessages.map(message => {
                        if (message._id === messageId) {
                            const updatedMessage = {
                                ...message,
                                delivered: status === 'delivered' || status === 'seen',
                                seen: status === 'seen'
                            };

                            return updatedMessage;
                        }
                        return message;
                    });

                    messagesRef.current = updatedMessages;

                    if (onMessagesUpdate) {
                        onMessagesUpdate(updatedMessages);
                    }

                    // Force React to re-render
                    setForceUpdateCounter(prev => prev + 1);

                    return updatedMessages;
                });
            }
        };

        // Handle batch message delivered events (optimized)
        const handleGlobalMessagesDelivered = (event) => {
            const { conversationId: eventConvId, messageIds } = event.detail;

            if (eventConvId === conversationId) {


                setMessages(prevMessages => {
                    const updatedMessages = prevMessages.map(message => {
                        if (messageIds.includes(message._id)) {
                            return { ...message, delivered: true };
                        }
                        return message;
                    });

                    messagesRef.current = updatedMessages;

                    if (onMessagesUpdate) {
                        onMessagesUpdate(updatedMessages);
                    }

                    return updatedMessages;
                });
            }
        };

        // Handle batch message seen events (optimized)
        const handleGlobalMessagesSeen = (event) => {
            const { conversationId: eventConvId, messageIds } = event.detail;

            if (eventConvId === conversationId) {


                setMessages(prevMessages => {
                    const updatedMessages = prevMessages.map(message => {
                        if (messageIds.includes(message._id)) {
                            return { ...message, delivered: true, seen: true };
                        }
                        return message;
                    });

                    messagesRef.current = updatedMessages;

                    if (onMessagesUpdate) {
                        onMessagesUpdate(updatedMessages);
                    }

                    return updatedMessages;
                });
            }
        };

        // Also keep the legacy event listeners for backward compatibility
        const handleGlobalMessageDelivered = (event) => {
            const { conversationId: eventConvId, messageId } = event.detail;

            if (eventConvId === conversationId) {

                const updatedMessages = updateMessageDelivered(messagesRef.current, messageId);
                setMessages(updatedMessages);
                messagesRef.current = updatedMessages;

                if (onMessagesUpdate) {
                    onMessagesUpdate(updatedMessages);
                }
            }
        };

        const handleGlobalMessageSeen = (event) => {
            const { conversationId: eventConvId, messageIds } = event.detail;

            if (eventConvId === conversationId) {

                const updatedMessages = updateMessagesSeen(messagesRef.current, messageIds);
                setMessages(updatedMessages);
                messagesRef.current = updatedMessages;

                if (onMessagesUpdate) {
                    onMessagesUpdate(updatedMessages);
                }
            }
        };

        // Add event listeners
        window.addEventListener('forceMessageStatusUpdate', handleForceStatusUpdate);
        window.addEventListener('globalMessageDelivered', handleGlobalMessageDelivered);
        window.addEventListener('globalMessagesDelivered', handleGlobalMessagesDelivered);
        window.addEventListener('globalMessageSeen', handleGlobalMessageSeen);
        window.addEventListener('globalMessagesSeen', handleGlobalMessagesSeen);

        return () => {
            unsubscribeStatusService();
            unsubscribe();
            window.removeEventListener('forceMessageStatusUpdate', handleForceStatusUpdate);
            window.removeEventListener('globalMessageDelivered', handleGlobalMessageDelivered);
            window.removeEventListener('globalMessagesDelivered', handleGlobalMessagesDelivered);
            window.removeEventListener('globalMessageSeen', handleGlobalMessageSeen);
            window.removeEventListener('globalMessagesSeen', handleGlobalMessagesSeen);
        };
    }, [conversationId, onMessagesUpdate, currentUserId]);

    useEffect(() => {
        if (!conversationId) {
            // Clear typing users when no conversation is selected
            setTypingUsers([]);
            return;
        }

        // Clear typing users when conversation changes
        setTypingUsers([]);

        API.fetchMessages({ conversationId })
            .then(res => {
                // Normalize messages with proper status handling
                let messagesWithStatus = (res.data.messages || []).map(normalizeMessage);

                // Apply any cached status updates from the centralized manager
                messagesWithStatus = applyStatusUpdates(conversationId, messagesWithStatus);

                setMessages(messagesWithStatus);
                messagesRef.current = messagesWithStatus;

                // Notify parent component about messages update
                if (onMessagesUpdate) {
                    onMessagesUpdate(messagesWithStatus);
                }

                // After loading messages, mark undelivered messages as delivered
                // but only for messages sent TO current user (not FROM current user)
                setTimeout(() => {
                    const undeliveredIds = getUndeliveredMessageIds(messagesWithStatus, currentUserId);
                    if (undeliveredIds.length > 0) {

                        markMessagesDelivered(conversationId, undeliveredIds, currentUserId);
                    }
                }, 100); // Reduced delay for faster status updates


            })
            .catch(() => {
                setMessages([]);
                messagesRef.current = [];
            });
        // Setup socket listener for real-time
        const token = localStorage.getItem("token");
        const userId = currentUserId;
        const socket = connectSocket(token, userId);

        // Join the conversation room for real-time messaging
        joinConversation(conversationId);

        socket.on("messageReceived", (msg) => {
            if (msg.conversationId === conversationId) {

                // Normalize the received message
                const messageWithStatus = normalizeMessage(msg);

                setMessages(prev => {
                    if (prev.some(m => m._id === msg._id)) return prev;
                    const updatedMessages = [...prev, messageWithStatus];
                    messagesRef.current = updatedMessages;
                    return updatedMessages;
                });

                // Automatically mark the message as delivered since we received it
                setTimeout(() => {
                    markMessagesDelivered(conversationId, [msg._id], userId);
                }, 100); // Reduced delay for faster status updates
            }
        });

        // Handle typing indicators
        const handleTyping = (data) => {
            console.log("👨‍💻 Typing event received:", data);
            const currentUserId = getUserId();

            // Only process typing events for the current conversation
            if (data.conversationId !== conversationId) {
                console.log("🚫 Ignoring typing event for different conversation");
                return;
            }

            // Only show typing indicator if sender is not the current user
            if (data.sender && data.sender !== currentUserId) {
                console.log("👨‍💻 Adding user to typing list:", data.sender);
                setTypingUsers(prev => {
                    if (!prev.includes(data.sender)) {
                        return [...prev, data.sender];
                    }
                    return prev;
                });
            }
        };

        const handleStopTyping = (data) => {
            console.log("✋ Stop typing event received:", data);
            
            // Only process stop typing events for the current conversation
            if (data.conversationId !== conversationId) {
                console.log("🚫 Ignoring stop typing event for different conversation");
                return;
            }

            // Remove the user from typing list
            if (data.sender) {
                console.log("✋ Removing user from typing list:", data.sender);
                setTypingUsers(prev => prev.filter(userId => userId !== data.sender));
            }
        };

        socket.on("typing", handleTyping);
        socket.on("stopTyping", handleStopTyping);

        // Handle conversation updates
        socket.on("conversationUpdated", (data) => {
            if (data.conversationId === conversationId) {
                // You can emit this to parent component if needed

            }
        });

        // Note: Message delivered and seen events are now handled globally
        // to ensure they work across conversation switches

        return () => {
            // Leave the conversation room when component unmounts or conversation changes
            leaveConversation(conversationId);


            socket.off("messageReceived");
            socket.off("typing", handleTyping);
            socket.off("stopTyping", handleStopTyping);
            socket.off("conversationUpdated");
            // messageDelivered and messageSeen are handled globally
        };
    }, [conversationId, currentUserId, getUserId]);
    // Optimistic update for newMessage
    useEffect(() => {
        if (newMessage && (newMessage.conversation === conversationId || newMessage.conversationId === conversationId)) {

            // Normalize the new message - it should start as 'sent' only
            const messageWithStatus = {
                ...normalizeMessage(newMessage),
                // For own messages, we don't set delivered initially
                // Server will update this when other users receive it
            };

            setMessages(prev => {
                if (prev.some(m => m._id === newMessage._id)) return prev;
                const updatedMessages = [...prev, messageWithStatus];
                messagesRef.current = updatedMessages;
                return updatedMessages;
            });
        }
    }, [newMessage, conversationId]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle message seen functionality
    useEffect(() => {
        if (messages.length > 0 && conversationId) {
            const userId = getUserId();

            // Mark messages as seen after a short delay, but ONLY messages sent TO the current user
            const timer = setTimeout(() => {
                const unseenMessagesFromOthers = messages.filter(msg => {
                    // Only mark messages as seen that:
                    // 1. Were NOT sent by the current user (msg.sender._id !== userId)
                    // 2. Are not already seen (msg.seen === false or undefined)
                    // 3. Have a valid message ID
                    return msg.sender?._id !== userId &&
                        !msg.seen &&
                        msg._id;
                });

                const unseenMessageIds = unseenMessagesFromOthers.map(msg => msg._id);

                if (unseenMessageIds.length > 0) {
                    console.log(`📖 Marking ${unseenMessageIds.length} messages as seen in conversation ${conversationId}`);
                    markMessagesSeen(conversationId, userId, unseenMessageIds);
                }
            }, 500); // Reduced delay for faster seen status

            return () => clearTimeout(timer);
        }
    }, [messages, conversationId, getUserId]);

    return (
        <div className="p-4 h-full">
            {messages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                    <div className="bg-gray-800/30 p-6 rounded-lg text-gray-300 text-center max-w-md">
                        <div className="text-4xl mb-4">💬</div>
                        <div className="text-xl font-medium mb-2">No messages yet</div>
                        <div className="text-sm text-gray-400">
                            Start the conversation by sending a message below!
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-1">
                    {messages.map((msg, index) => {
                        // Group messages by date
                        const msgDate = new Date(msg.createdAt || msg.timestamp).toLocaleDateString();
                        const prevMsg = index > 0 ? messages[index - 1] : null;
                        const prevMsgDate = prevMsg ? new Date(prevMsg.createdAt || prevMsg.timestamp).toLocaleDateString() : null;

                        // Show date separator if this is the first message or if the date changed
                        const showDateSeparator = !prevMsg || msgDate !== prevMsgDate;

                        // Check if consecutive messages are from the same sender
                        const isSameSenderAsPrev = prevMsg &&
                            prevMsg.sender?._id === msg.sender?._id &&
                            msgDate === prevMsgDate &&
                            // Messages within 2 minutes are grouped
                            (new Date(msg.createdAt || msg.timestamp) - new Date(prevMsg.createdAt || prevMsg.timestamp)) < 120000;

                        return (
                            <React.Fragment key={`${msg._id}-${forceUpdateCounter}`}>
                                {showDateSeparator && (
                                    <div className="flex justify-center my-4">
                                        <div className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">
                                            {new Date(msg.createdAt || msg.timestamp).toLocaleDateString(undefined, {
                                                weekday: 'long',
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                )}
                                <Message
                                    message={msg}
                                    currentUserId={currentUserId}
                                    conversationId={conversationId}
                                    isLastMessage={index === messages.length - 1}
                                    isContinuation={isSameSenderAsPrev}
                                />
                            </React.Fragment>
                        );
                    })}
                </div>
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
    onMessagesUpdate: PropTypes.func,
};

export default MessageList;
