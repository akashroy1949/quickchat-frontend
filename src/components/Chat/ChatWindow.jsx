import React, { useState } from "react";
import PropTypes from "prop-types";
import ChatHeader from "@/components/Chat/ChatHeader";
import MessageList from "@/components/Chat/MessageList";
import MessageInput from "@/components/Chat/MessageInput";

const ChatWindow = ({ conversation, onMessageSent }) => {
    const [newMessage, setNewMessage] = useState(null);

    const handleMessageSent = (messageData) => {
        setNewMessage(messageData);
        if (onMessageSent) {
            onMessageSent(messageData);
        }
    };

    return (
        <div className="flex flex-col flex-1 h-full bg-gray-900">
            <ChatHeader conversation={conversation} />
            <div className="flex-1 overflow-y-auto">
                <MessageList
                    conversationId={conversation?._id}
                    newMessage={newMessage}
                    onMessagesUpdate={() => { }}
                />
            </div>
            <MessageInput
                conversationId={conversation?._id}
                conversation={conversation}
                onMessageSent={handleMessageSent}
            />
        </div>
    );
};

ChatWindow.propTypes = {
    conversation: PropTypes.shape({
        _id: PropTypes.string,
        participants: PropTypes.array,
    }),
    onMessageSent: PropTypes.func,
};

export default ChatWindow;
