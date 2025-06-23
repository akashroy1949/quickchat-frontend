import React from "react";

const ChatHeader = ({ conversation }) => {
    if (!conversation) return (
        <div className="p-4 border-b border-gray-800 bg-gray-900 text-white">
            <span>Select a chat to start messaging</span>
        </div>
    );
    return (
        <div className="p-4 border-b border-gray-800 bg-gray-900 text-white">
            <span className="font-bold">
                {conversation.isGroupChat ? conversation.groupName : conversation.name}
            </span>
        </div>
    );
};

export default ChatHeader;
