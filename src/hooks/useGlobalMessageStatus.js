import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getSocket } from '@/services/socket';

import messageStatusManager from '@/utils/messageStatusManager';
import messageStatusService from '@/services/messageStatusService';

/**
 * Global hook to handle message status updates across all conversations
 * This ensures status indicators work even when switching between chats
 */
export const useGlobalMessageStatus = () => {
    const loginData = useSelector((state) => state.loginUser);
    const dispatch = useDispatch();

    // Helper function to get userId
    const getUserId = useCallback(() => {
        let userId = localStorage.getItem("userId");
        if (!userId && loginData?.data?.data?._id) {
            userId = loginData.data.data._id;
            localStorage.setItem("userId", userId);
        }
        return userId;
    }, [loginData]);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) {
            console.warn("🔌 No socket available in useGlobalMessageStatus");
            return;
        }

        const currentUserId = getUserId();


        // Remove any existing listeners first to prevent duplicates
        socket.off("messageDelivered");
        socket.off("messagesDelivered");
        socket.off("messageSeen");
        socket.off("messagesSeen");

        // Global handler for message delivered events
        const handleGlobalMessageDelivered = (data) => {
            // Handle both single message and batch formats
            if (data.conversationId) {
                if (data.messageId) {
                    // Single message format

                    messageStatusManager.updateMessageDelivered(data.conversationId, data.messageId);

                    // Update real-time status service
                    messageStatusService.updateStatus(data.conversationId, data.messageId, 'delivered');

                    // Force immediate UI update
                    window.dispatchEvent(new CustomEvent('forceMessageStatusUpdate', {
                        detail: {
                            conversationId: data.conversationId,
                            messageId: data.messageId,
                            status: 'delivered'
                        }
                    }));

                    window.dispatchEvent(new CustomEvent('globalMessageDelivered', {
                        detail: {
                            conversationId: data.conversationId,
                            messageId: data.messageId,
                            deliveredAt: new Date().toISOString()
                        }
                    }));
                } else if (data.messageIds && Array.isArray(data.messageIds)) {
                    // Batch format - process each message


                    // Update status service with batch update
                    const statusUpdates = data.messageIds.map(messageId => ({
                        messageId,
                        status: 'delivered'
                    }));
                    messageStatusService.updateMultipleStatuses(data.conversationId, statusUpdates);

                    data.messageIds.forEach(messageId => {
                        messageStatusManager.updateMessageDelivered(data.conversationId, messageId);

                        // Force immediate UI update
                        window.dispatchEvent(new CustomEvent('forceMessageStatusUpdate', {
                            detail: {
                                conversationId: data.conversationId,
                                messageId: messageId,
                                status: 'delivered'
                            }
                        }));

                        window.dispatchEvent(new CustomEvent('globalMessageDelivered', {
                            detail: {
                                conversationId: data.conversationId,
                                messageId: messageId,
                                deliveredAt: new Date().toISOString()
                            }
                        }));
                    });
                } else {
                    console.warn("Invalid message delivered data:", data);
                }
            } else {
                console.warn("Invalid message delivered data:", data);
            }
        };

        // Global handler for message seen events
        const handleGlobalMessageSeen = (data) => {
            // Validate data before processing
            if (data.conversationId && data.messageIds && Array.isArray(data.messageIds)) {
                // Update status service with batch update for immediate UI response
                const statusUpdates = data.messageIds.map(messageId => ({
                    messageId,
                    status: 'seen'
                }));
                messageStatusService.updateMultipleStatuses(data.conversationId, statusUpdates);

                // Update centralized status manager
                messageStatusManager.updateMessagesSeen(data.conversationId, data.messageIds);

                // Force immediate UI update for each message
                data.messageIds.forEach(messageId => {
                    window.dispatchEvent(new CustomEvent('forceMessageStatusUpdate', {
                        detail: {
                            conversationId: data.conversationId,
                            messageId: messageId,
                            status: 'seen'
                        }
                    }));
                });

                // Also emit custom event for backward compatibility
                window.dispatchEvent(new CustomEvent('globalMessageSeen', {
                    detail: {
                        conversationId: data.conversationId,
                        messageIds: data.messageIds,
                        seenAt: new Date().toISOString()
                    }
                }));
            } else {
                console.warn("Invalid message seen data:", data);
            }
        };

        // Global handler for batch message delivered events (new optimized event)
        const handleBatchMessageDelivered = (data) => {


            if (data.conversationId && data.messageIds && Array.isArray(data.messageIds)) {
                // Update status service with batch update for immediate UI response
                const statusUpdates = data.messageIds.map(messageId => ({
                    messageId,
                    status: 'delivered'
                }));
                messageStatusService.updateMultipleStatuses(data.conversationId, statusUpdates);
                // Process each message in the batch
                data.messageIds.forEach(messageId => {
                    messageStatusManager.updateMessageDelivered(data.conversationId, messageId);

                    // Force immediate UI update
                    window.dispatchEvent(new CustomEvent('forceMessageStatusUpdate', {
                        detail: {
                            conversationId: data.conversationId,
                            messageId: messageId,
                            status: 'delivered'
                        }
                    }));
                });

                // Emit batch event for components that need it
                window.dispatchEvent(new CustomEvent('globalMessagesDelivered', {
                    detail: {
                        conversationId: data.conversationId,
                        messageIds: data.messageIds,
                        deliveredAt: data.deliveredAt || new Date().toISOString()
                    }
                }));
            } else {
                console.warn("Invalid batch message delivered data:", data);
            }
        };

        // Global handler for batch message seen events (new optimized event)
        const handleBatchMessageSeen = (data) => {


            if (data.conversationId && data.messageIds && Array.isArray(data.messageIds)) {
                // Update status service with batch update for immediate UI response
                const statusUpdates = data.messageIds.map(messageId => ({
                    messageId,
                    status: 'seen'
                }));
                messageStatusService.updateMultipleStatuses(data.conversationId, statusUpdates);

                // Update centralized status manager
                messageStatusManager.updateMessagesSeen(data.conversationId, data.messageIds);

                // Force immediate UI update for each message
                data.messageIds.forEach(messageId => {
                    window.dispatchEvent(new CustomEvent('forceMessageStatusUpdate', {
                        detail: {
                            conversationId: data.conversationId,
                            messageId: messageId,
                            status: 'seen'
                        }
                    }));
                });

                // Emit batch event for components that need it
                window.dispatchEvent(new CustomEvent('globalMessagesSeen', {
                    detail: {
                        conversationId: data.conversationId,
                        messageIds: data.messageIds,
                        seenAt: data.seenAt || new Date().toISOString()
                    }
                }));
            } else {
                console.warn("Invalid batch message seen data:", data);
            }
        };

        // Set up global listeners that persist across conversation changes

        socket.on("messageDelivered", handleGlobalMessageDelivered);
        socket.on("messagesDelivered", handleBatchMessageDelivered);
        socket.on("messageSeen", handleGlobalMessageSeen);
        socket.on("messagesSeen", handleBatchMessageSeen);

        // Test socket connection
        socket.on("connect", () => {

        });

        socket.on("disconnect", () => {

        });

        // Add a comprehensive event listener to debug all socket events
        socket.onAny((eventName, ...args) => {
            if (eventName === "messageDelivered" || eventName === "messageSeen" ||
                eventName === "messagesDelivered" || eventName === "messagesSeen") {

            }

            // Debug all message-related events
            if (eventName.includes("message") || eventName.includes("Message")) {

            }
        });

        // Cleanup
        return () => {

            socket.off("messageDelivered", handleGlobalMessageDelivered);
            socket.off("messagesDelivered", handleBatchMessageDelivered);
            socket.off("messageSeen", handleGlobalMessageSeen);
            socket.off("messagesSeen", handleBatchMessageSeen);
            socket.off("connect");
            socket.off("disconnect");
            socket.offAny();
        };
    }, [getUserId]);

    return {
        userId: getUserId()
    };
};