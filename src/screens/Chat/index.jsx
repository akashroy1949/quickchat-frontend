import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Chat/Sidebar";
import ChatWindow from "@/components/Chat/ChatWindow";
import ProfileModal from "@/components/Chat/ProfileModal";
import { useGlobalMessageStatus } from "@/hooks/useGlobalMessageStatus";
import API from "@/services/api";
import { connectSocket, joinConversation } from "@/services/socket";
import { BsChatLeftTextFill } from "react-icons/bs";

const ChatScreen = () => {
    const navigate = useNavigate();
    const [selectedUser, setSelectedUser] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [lastMessageSent, setLastMessageSent] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const sidebarRef = React.useRef(null);

    // Check authentication on component mount
    useEffect(() => {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        // If no token or userId in localStorage, redirect to login
        if (!token || !userId) {
            console.warn("⚠️ No authentication found, redirecting to login");
            navigate("/login");
            return;
        }

        // User is authenticated
        setIsAuthenticated(true);
    }, [navigate]);

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
        if (!messageData) return;

        // Add conversationId to the message data if it's not already there
        const messageWithConversation = {
            ...messageData,
            conversationId: messageData.conversation || messageData.conversationId || selectedConversation?._id
        };

        // Log the message data for debugging
        console.log("Message sent:", messageWithConversation);

        // Ensure we have all the necessary data for sidebar updates
        if (!messageWithConversation.conversationId) {
            console.error("Missing conversationId in message data");
            return;
        }

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

    // Show loading or redirect message while checking authentication
    if (!isAuthenticated) {
        return (
            <div className="flex h-screen bg-gray-900 items-center justify-center text-gray-400">
                <div className="text-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <h2 className="text-xl font-semibold mb-2">Checking authentication...</h2>
                    <p>Redirecting to login if you're not authenticated.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-900 overflow-hidden w-full">
            <Sidebar
                ref={sidebarRef}
                onUserClick={handleUserClick}
                onConversationClick={handleConversationClick}
                selectedConversation={selectedConversation}
                onMessageSent={lastMessageSent}
            />
            {selectedConversation ? (
                <ChatWindow
                    conversation={selectedConversation}
                    onMessageSent={handleMessageSent}
                />
            ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-400">
                    <div className="text-center p-8">
                        <BsChatLeftTextFill className="mx-auto text-gray-600 mb-4" size={64} />
                        <h2 className="text-xl font-semibold mb-2">Welcome to QuickChat</h2>
                        <p className="max-w-md">
                            Select a conversation from the sidebar or start a new chat to begin messaging.
                        </p>
                    </div>
                </div>
            )}
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
