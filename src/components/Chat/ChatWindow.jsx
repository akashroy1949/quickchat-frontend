import React, { useState } from "react";
import ChatHeader from "@/components/Chat/ChatHeader";
import MessageList from "@/components/Chat/MessageList";
import MessageInput from "@/components/Chat/MessageInput";

const ChatWindow = ({ conversation, onMessageSent }) => {
    const [newMessage, setNewMessage] = useState(null);
    const [messages, setMessages] = useState([]);

    const handleMessageSent = (messageData) => {
        setNewMessage(messageData);
        if (onMessageSent) {
            onMessageSent(messageData);
        }
    };

    return (
        <div className="flex flex-col flex-1 h-full relative bg-gray-900">
            <ChatHeader conversation={conversation} />
            <div className="flex-1 overflow-y-auto bg-[#0b141a] bg-opacity-95 bg-[url('/chat-bg.png')] bg-repeat">
                <MessageList
                    conversationId={conversation?._id}
                    newMessage={newMessage}
                    onMessagesUpdate={setMessages}
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

export default ChatWindow;
