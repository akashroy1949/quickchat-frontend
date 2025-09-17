import React from "react";
import { FaUserCircle, FaSearch, FaArrowLeft } from "react-icons/fa";
import ChatOptionsDropdown from "./ChatOptionsDropdown";

const ChatHeader = ({ conversation }) => {
    if (!conversation) return (
        <div className="px-4 py-3 border-b border-gray-700 bg-gray-800 text-white">
            <span>Select a chat to start messaging</span>
        </div>
    );

    return (
        <div className="px-4 py-3 border-b border-gray-700 bg-gray-800 text-white flex items-center justify-between">
            <div className="flex items-center">
                <div className="md:hidden mr-2">
                    <button className="text-gray-400 hover:text-white">
                        <FaArrowLeft size={16} />
                    </button>
                </div>

                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3 overflow-hidden">
                    {conversation.groupImage ? (
                        <img
                            src={conversation.groupImage}
                            alt={conversation.isGroupChat ? conversation.groupName : conversation.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <FaUserCircle size={24} className="text-gray-500" />
                    )}
                </div>

                <div>
                    <div className="font-medium">
                        {conversation.isGroupChat ? conversation.groupName : conversation.name}
                    </div>
                    <div className="text-xs text-gray-400">
                        {conversation.isGroupChat
                            ? `${conversation.participants?.length || 0} participants`
                            : "Online"}
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <button className="text-gray-400 hover:text-white">
                    <FaSearch size={16} />
                </button>
                <ChatOptionsDropdown
                    conversationId={conversation?._id}
                    conversationName={conversation?.isGroupChat ? conversation?.groupName : conversation?.name}
                />
            </div>
        </div>
    );
};

export default ChatHeader;
