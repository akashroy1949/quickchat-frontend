/**
 * Centralized message status manager that persists across conversation switches
 * This solves the issue where message status updates are lost when switching chats
 */

class MessageStatusManager {
    constructor() {
        this.statusCache = new Map(); // conversationId -> { messageId -> status }
        this.listeners = new Set();
        this.isInitialized = false;
        this.debugEnabled = false;
    }

    initialize() {
        if (this.isInitialized) return;

        this.isInitialized = true;
        this.debugEnabled = process.env.NODE_ENV === 'development';


    }

    enableDebug() {
        this.debugEnabled = true;
    }

    disableDebug() {
        this.debugEnabled = false;
    }

    debug(...args) {
        // Debug logging removed
    }

    // Add a listener for status updates
    addListener(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    // Notify all listeners of status updates
    notifyListeners(conversationId, updates) {
        this.debug(`Notifying ${this.listeners.size} listeners of status updates for conversation ${conversationId.substring(0, 8)}`);
        this.listeners.forEach(callback => {
            try {
                callback(conversationId, updates);
            } catch (error) {
                console.error('Error in MessageStatusManager listener:', error);
            }
        });
    }

    // Update message status for a conversation
    updateMessageStatus(conversationId, messageId, status) {
        if (!conversationId || !messageId) return;

        if (!this.statusCache.has(conversationId)) {
            this.statusCache.set(conversationId, new Map());
        }

        const conversationCache = this.statusCache.get(conversationId);
        const previousStatus = conversationCache.get(messageId);

        // Only update if status actually changed
        if (previousStatus !== status) {
            conversationCache.set(messageId, status);

            this.debug(`Status updated for message ${messageId.substring(0, 8)}: ${previousStatus} -> ${status}`);

            // Notify listeners with array format
            this.notifyListeners(conversationId, [{
                messageId,
                status,
                previousStatus
            }]);
        }
    }

    // Update multiple messages as seen
    updateMessagesSeen(conversationId, messageIds) {
        if (!conversationId || !Array.isArray(messageIds)) return;

        const updates = [];
        messageIds.forEach(messageId => {
            if (messageId) {
                const previousStatus = this.getMessageStatus(conversationId, messageId);
                this.updateMessageStatus(conversationId, messageId, 'seen');
                updates.push({
                    messageId,
                    status: 'seen',
                    previousStatus
                });
            }
        });

        this.debug(`Marked ${updates.length} messages as seen in conversation ${conversationId.substring(0, 8)}`);

        // Notify listeners if there were updates
        if (updates.length > 0) {
            this.notifyListeners(conversationId, updates);
        }
    }

    // Update message as delivered
    updateMessageDelivered(conversationId, messageId) {
        if (!conversationId || !messageId) return;

        // Only update to delivered if not already seen
        const currentStatus = this.getMessageStatus(conversationId, messageId);
        if (currentStatus !== 'seen') {
            const previousStatus = currentStatus;
            this.updateMessageStatus(conversationId, messageId, 'delivered');
            this.debug(`Message ${messageId.substring(0, 8)} updated to delivered`);

            // Notify listeners
            this.notifyListeners(conversationId, [{
                messageId,
                status: 'delivered',
                previousStatus
            }]);
        }
    }

    // Get current status of a message
    getMessageStatus(conversationId, messageId) {
        const conversationCache = this.statusCache.get(conversationId);
        return conversationCache?.get(messageId) || 'sent';
    }

    // Get all status updates for a conversation
    getConversationStatusUpdates(conversationId) {
        return this.statusCache.get(conversationId) || new Map();
    }

    // Apply cached status updates to messages array
    applyStatusUpdates(conversationId, messages) {
        const statusUpdates = this.getConversationStatusUpdates(conversationId);
        if (statusUpdates.size === 0) return messages;

        return messages.map(message => {
            const cachedStatus = statusUpdates.get(message._id);
            if (!cachedStatus) return message;

            return {
                ...message,
                delivered: cachedStatus === 'delivered' || cachedStatus === 'seen',
                seen: cachedStatus === 'seen'
            };
        });
    }

    // Clear cache for a conversation (useful when leaving chat)
    clearConversationCache(conversationId) {
        this.statusCache.delete(conversationId);
        this.debug(`Cleared cache for conversation ${conversationId.substring(0, 8)}`);
    }

    // Clear all cache
    clearAllCache() {
        this.statusCache.clear();
        this.debug('Cleared all status cache');
    }

    // Get statistics for debugging
    getStats() {
        const stats = {
            totalConversations: this.statusCache.size,
            totalMessages: 0,
            listeners: this.listeners.size
        };

        this.statusCache.forEach(conversationCache => {
            stats.totalMessages += conversationCache.size;
        });

        return stats;
    }
}

// Create singleton instance
const messageStatusManager = new MessageStatusManager();

// Auto-initialize
messageStatusManager.initialize();

export default messageStatusManager;

// Export convenience functions
export const updateMessageDelivered = (conversationId, messageId) => {
    messageStatusManager.updateMessageDelivered(conversationId, messageId);
};

export const updateMessagesSeen = (conversationId, messageIds) => {
    messageStatusManager.updateMessagesSeen(conversationId, messageIds);
};

export const getMessageStatus = (conversationId, messageId) => {
    return messageStatusManager.getMessageStatus(conversationId, messageId);
};

export const applyStatusUpdates = (conversationId, messages) => {
    return messageStatusManager.applyStatusUpdates(conversationId, messages);
};

export const addStatusListener = (callback) => {
    return messageStatusManager.addListener(callback);
};