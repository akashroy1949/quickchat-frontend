import React, { useState } from "react";
import ChatHeader from "@/components/Chat/ChatHeader";
import MessageList from "@/components/Chat/MessageList";
import MessageInput from "@/components/Chat/MessageInput";

const ChatWindow = ({ conversation }) => {
    const [newMessage, setNewMessage] = useState(null);
    return (
        <div className="flex flex-col flex-1 h-full">
            <ChatHeader conversation={conversation} />
            <div className="flex-1 overflow-y-auto">
                <MessageList conversationId={conversation?._id} newMessage={newMessage} />
            </div>
            <MessageInput conversationId={conversation?._id} onMessageSent={setNewMessage} />
        </div>
    );
};

export default ChatWindow;
