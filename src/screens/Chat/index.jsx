import React, { useState } from "react";
import Sidebar from "@/components/Chat/Sidebar";
import ChatWindow from "@/components/Chat/ChatWindow";
import ProfileModal from "@/components/Chat/ProfileModal";

const ChatScreen = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState(null);

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

    return (
        <div className="flex h-screen bg-dark-bg">
            <Sidebar
                onUserClick={handleUserClick}
                onConversationClick={handleConversationClick}
            />
            <ChatWindow
                conversation={selectedConversation}
            />
            {showProfile && (
                <ProfileModal
                    user={selectedUser}
                    onClose={handleCloseProfile}
                />
            )}
        </div>
    );
};

export default ChatScreen;
