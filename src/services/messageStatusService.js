/**
 * Real-time message status service
 * Handles immediate UI updates for message status changes
 */

class MessageStatusService {
    constructor() {
        this.subscribers = new Map(); // conversationId -> Set of callbacks
        this.messageStatuses = new Map(); // messageId -> status
    }

    // Subscribe to status updates for a specific conversation
    subscribe(conversationId, callback) {
        if (!this.subscribers.has(conversationId)) {
            this.subscribers.set(conversationId, new Set());
        }
        
        this.subscribers.get(conversationId).add(callback);
        
        // Return unsubscribe function
        return () => {
            const callbacks = this.subscribers.get(conversationId);
            if (callbacks) {
                callbacks.delete(callback);
                if (callbacks.size === 0) {
                    this.subscribers.delete(conversationId);
                }
            }
        };
    }

    // Update message status and notify subscribers
    updateStatus(conversationId, messageId, status) {
        const previousStatus = this.messageStatuses.get(messageId);
        
        // Only update if status actually changed
        if (previousStatus !== status) {
            this.messageStatuses.set(messageId, status);
            

            
            // Notify all subscribers for this conversation
            const callbacks = this.subscribers.get(conversationId);
            if (callbacks) {
                callbacks.forEach(callback => {
                    try {
                        callback({
                            messageId,
                            status,
                            previousStatus,
                            timestamp: Date.now()
                        });
                    } catch (error) {
                        console.error('Error in status update callback:', error);
                    }
                });
            }
            
            // Also dispatch global event for backward compatibility
            window.dispatchEvent(new CustomEvent('messageStatusChanged', {
                detail: {
                    conversationId,
                    messageId,
                    status,
                    previousStatus
                }
            }));
        }
    }

    // Update multiple messages at once
    updateMultipleStatuses(conversationId, updates) {
        const changes = [];
        
        updates.forEach(({ messageId, status }) => {
            const previousStatus = this.messageStatuses.get(messageId);
            if (previousStatus !== status) {
                this.messageStatuses.set(messageId, status);
                changes.push({ messageId, status, previousStatus });
            }
        });
        
        if (changes.length > 0) {

            
            // Notify subscribers
            const callbacks = this.subscribers.get(conversationId);
            if (callbacks) {
                callbacks.forEach(callback => {
                    changes.forEach(change => {
                        try {
                            callback({
                                ...change,
                                timestamp: Date.now()
                            });
                        } catch (error) {
                            console.error('Error in batch status update callback:', error);
                        }
                    });
                });
            }
        }
    }

    // Get current status of a message
    getStatus(messageId) {
        return this.messageStatuses.get(messageId) || 'sent';
    }

    // Clear statuses for a conversation (when leaving chat)
    clearConversation(conversationId) {
        this.subscribers.delete(conversationId);

    }

    // Get debug info
    getDebugInfo() {
        return {
            subscribers: this.subscribers.size,
            messageStatuses: this.messageStatuses.size,
            conversations: Array.from(this.subscribers.keys()).map(id => id.substring(0, 8))
        };
    }
}

// Create singleton instance
const messageStatusService = new MessageStatusService();

export default messageStatusService;

// Export convenience functions
export const subscribeToStatusUpdates = (conversationId, callback) => {
    return messageStatusService.subscribe(conversationId, callback);
};

export const updateMessageStatus = (conversationId, messageId, status) => {
    messageStatusService.updateStatus(conversationId, messageId, status);
};

export const updateMultipleMessageStatuses = (conversationId, updates) => {
    messageStatusService.updateMultipleStatuses(conversationId, updates);
};

export const getMessageStatus = (messageId) => {
    return messageStatusService.getStatus(messageId);
};

export const clearConversationStatuses = (conversationId) => {
    messageStatusService.clearConversation(conversationId);
};