import React, { useEffect, useState } from "react";
import { FaUserCircle, FaSearch, FaArrowLeft } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import ChatOptionsDropdown from "./ChatOptionsDropdown";
import { getOnlineUsersAction, set_user_online, set_user_offline } from "@/redux/actions/OnlineStatus/onlineStatusAction";
import { getSocket } from "@/services/socket";

const ChatHeader = ({ conversation }) => {
    const dispatch = useDispatch();
    const { onlineUsers, userLastSeen } = useSelector((state) => state.onlineStatus);

    // Utility function to format last seen time
    const formatLastSeen = (lastSeenDate) => {
        if (!lastSeenDate) return "Offline";

        const now = new Date();
        const lastSeen = new Date(lastSeenDate);
        const diffMs = now - lastSeen;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return "Last seen just now";
        if (diffMins < 60) return `Last seen ${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `Last seen ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `Last seen ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        if (diffDays < 30) return `Last seen ${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
        if (diffDays < 365) return `Last seen ${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
        return `Last seen ${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
    };

    // Get the other participant in a direct chat
    const getOtherParticipant = (conversation) => {
        if (!conversation || conversation.isGroupChat) return null;
        // For direct chats, find the participant that's not the current user
        const currentUserId = localStorage.getItem("userId");
        return conversation.participants?.find(p => p._id !== currentUserId);
    };

    const otherParticipant = getOtherParticipant(conversation);
    const isOnline = otherParticipant && onlineUsers.includes(otherParticipant._id.toString());

    useEffect(() => {
        // Fetch online users when component mounts or conversation changes
        if (conversation && !conversation.isGroupChat) {
            dispatch(getOnlineUsersAction());
        }
    }, [conversation, dispatch]);

    useEffect(() => {
        // Listen for real-time online/offline status updates
        const socket = getSocket();
        if (socket) {
            const handleUserOnline = (data) => {
                if (data.userId) {
                    dispatch(set_user_online(data.userId));
                }
            };

            const handleUserOffline = (data) => {
                if (data.userId) {
                    dispatch(set_user_offline(data.userId, data.lastSeen));
                }
            };

            socket.on("userOnline", handleUserOnline);
            socket.on("userOffline", handleUserOffline);

            return () => {
                socket.off("userOnline", handleUserOnline);
                socket.off("userOffline", handleUserOffline);
            };
        }
    }, [dispatch]);

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
                            : (
                                <span className={isOnline ? "text-green-400" : "text-gray-400"}>
                                    {isOnline ? "Online" : formatLastSeen(userLastSeen[otherParticipant?._id.toString()])}
                                </span>
                            )}
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
