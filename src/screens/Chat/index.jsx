import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Chat/Sidebar";
import ChatWindow from "@/components/Chat/ChatWindow";
import ProfileModal from "@/components/Chat/ProfileModal";
import { useGlobalMessageStatus } from "@/hooks/useGlobalMessageStatus";
import API from "@/services/api";
import { connectSocket, joinConversation } from "@/services/socket";

const ChatScreen = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [lastMessageSent, setLastMessageSent] = useState(null);
    const sidebarRef = React.useRef(null);

    // Enable global message status tracking
    useGlobalMessageStatus();

    useEffect(() => {
        // Initialize socket connection when chat screen loads
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        if (token && userId) {
            connectSocket(token, userId);

        } else {
            console.warn("⚠️ Missing token or userId for socket connection");
        }
    }, []);

    const handleUserClick = (user) => {
        setSelectedUser(user);
        setShowProfile(true);
    };

    const handleCloseProfile = () => {
        setShowProfile(false);
        setSelectedUser(null);
    };

    const handleConversationClick = (conv) => {
        setSelectedConversation(conv);
    };

    const handleMessageSent = (messageData) => {
        // Add conversationId to the message data if it's not already there
        const messageWithConversation = {
            ...messageData,
            conversationId: messageData.conversation || selectedConversation?._id
        };
        setLastMessageSent(messageWithConversation);
    };

    const handleSendMessage = async (user) => {
        try {
            // Create conversation first
            const res = await API.createConversation({ participantId: user._id });
            const newConversation = res.data.conversation;

            // Join the conversation room for real-time updates
            joinConversation(newConversation._id);

            // Add the conversation to sidebar immediately
            if (sidebarRef.current) {
                sidebarRef.current.addConversation(newConversation);
            }

            // Set the conversation as selected
            setSelectedConversation(newConversation);

            // Close the profile modal
            setShowProfile(false);
            setSelectedUser(null);

            return newConversation;
        } catch (error) {
            console.error("Error creating conversation:", error);
            return null;
        }
    };

    return (
        <div className="flex h-screen bg-dark-bg">
            <Sidebar
                ref={sidebarRef}
                onUserClick={handleUserClick}
                onConversationClick={handleConversationClick}
                selectedConversation={selectedConversation}
                onMessageSent={lastMessageSent}
            />
            <ChatWindow
                conversation={selectedConversation}
                onMessageSent={handleMessageSent}
            />
            {showProfile && (
                <ProfileModal
                    user={selectedUser}
                    onClose={handleCloseProfile}
                    onSendMessage={handleSendMessage}
                />
            )}
        </div>
    );
};

export default ChatScreen;
