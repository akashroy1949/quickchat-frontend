/**
 * Utility functions for managing message status
 */

export const MESSAGE_STATUS = {
    SENT: 'sent',
    DELIVERED: 'delivered',
    SEEN: 'seen'
};

/**
 * Determine the display status for a message
 * @param {Object} message - The message object
 * @param {string} currentUserId - The current user's ID
 * @returns {string|null} - The status to display or null if not own message
 */
export const getMessageDisplayStatus = (message, currentUserId) => {
    // Only show status for own messages
    if (message.sender?._id !== currentUserId) {
        return null;
    }

    if (message.seen) return MESSAGE_STATUS.SEEN;
    if (message.delivered) return MESSAGE_STATUS.DELIVERED;
    return MESSAGE_STATUS.SENT;
};

/**
 * Update messages with delivered status
 * @param {Array} messages - Array of messages
 * @param {string} messageId - ID of message to mark as delivered
 * @returns {Array} - Updated messages array
 */
export const updateMessageDelivered = (messages, messageId) => {
    return messages.map(msg => {
        if (msg._id === messageId) {
            return { ...msg, delivered: true };
        }
        return msg;
    });
};

/**
 * Update messages with seen status
 * @param {Array} messages - Array of messages
 * @param {Array} messageIds - IDs of messages to mark as seen
 * @returns {Array} - Updated messages array
 */
export const updateMessagesSeen = (messages, messageIds) => {
    return messages.map(msg => {
        if (messageIds?.includes(msg._id)) {
            return { ...msg, seen: true, delivered: true };
        }
        return msg;
    });
};

/**
 * Get unseen messages for a user (only messages received from others)
 * @param {Array} messages - Array of messages
 * @param {string} currentUserId - Current user's ID
 * @returns {Array} - Array of unseen message IDs
 */
export const getUnseenMessageIds = (messages, currentUserId) => {
    return messages
        .filter(msg => {
            // Only return messages that:
            // 1. Were NOT sent by current user
            // 2. Are not already seen
            // 3. Are delivered (only mark delivered messages as seen)
            return msg.sender?._id !== currentUserId && 
                   !msg.seen && 
                   msg.delivered;
        })
        .map(msg => msg._id);
};

/**
 * Get undelivered messages for a user
 * @param {Array} messages - Array of messages
 * @param {string} currentUserId - Current user's ID
 * @returns {Array} - Array of undelivered message IDs
 */
export const getUndeliveredMessageIds = (messages, currentUserId) => {
    return messages
        .filter(msg => msg.sender?._id !== currentUserId && !msg.delivered)
        .map(msg => msg._id);
};

/**
 * Normalize message object with default status values
 * @param {Object} message - Raw message object
 * @returns {Object} - Normalized message object
 */
export const normalizeMessage = (message) => {
    return {
        ...message,
        delivered: message.delivered || false,
        seen: message.seen || false
    };
};