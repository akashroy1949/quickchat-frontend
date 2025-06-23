import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import API from "@/services/api";
import { connectSocket } from "@/services/socket";
import PropTypes from "prop-types";

const Sidebar = ({ onConversationClick }) => {
    const [searchOpen, setSearchOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    const [conversations, setConversations] = useState([]);

    useEffect(() => {
        // Fetch conversations on mount
        API.getConversations()
            .then((res) => setConversations(res.data.conversations || []))
            .catch(() => setConversations([]));

        // Setup socket for real-time conversation updates
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        const socket = connectSocket(token, userId);

        // Listen for new messages to update conversation list
        socket.on("messageReceived", (msg) => {
            setConversations(prev => {
                return prev.map(conv => {
                    if (conv._id === msg.conversationId) {
                        return {
                            ...conv,
                            lastMessage: msg,
                            lastActivity: new Date().toISOString()
                        };
                    }
                    return conv;
                }).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
            });
        });

        // Listen for conversation updates
        socket.on("conversationUpdated", (data) => {
            setConversations(prev => {
                return prev.map(conv => {
                    if (conv._id === data.conversationId) {
                        return {
                            ...conv,
                            lastMessage: data.lastMessage,
                            lastActivity: data.lastActivity
                        };
                    }
                    return conv;
                }).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
            });
        });

        return () => {
            socket.off("messageReceived");
            socket.off("conversationUpdated");
        };
    }, []);

    const handleSearchClick = () => setSearchOpen((v) => !v);
    const handleSearchChange = async (e) => {
        const value = e.target.value;
        setSearch(value);
        if (value.length >= 2) {
            try {
                const res = await API.searchUsers(value);
                setResults(res.data.users || []);
            } catch {
                setResults([]);
            }
        } else {
            setResults([]);
        }
    };

    // Add direct chat creation on user click
    const handleUserClickInternal = async (user) => {
        try {
            const res = await API.createConversation({ participantId: user._id });
            const newConversation = res.data.conversation;

            // Add to conversations list if not already present
            setConversations(prev => {
                const exists = prev.some(conv => conv._id === newConversation._id);
                if (!exists) {
                    return [newConversation, ...prev];
                }
                return prev;
            });

            if (onConversationClick) onConversationClick(newConversation);
        } catch {
            if (onConversationClick) onConversationClick(null);
        }
    };

    return (
        <div className="w-80 bg-gray-900 text-white flex flex-col p-4 border-r border-gray-800">
            <div className="flex items-center mb-4">
                <button onClick={handleSearchClick} className="mr-2">
                    <FaSearch />
                </button>
                {searchOpen && (
                    <input
                        className="bg-gray-800 rounded px-2 py-1 ml-2 flex-1"
                        placeholder="Search users..."
                        value={search}
                        onChange={handleSearchChange}
                    />
                )}
            </div>
            {searchOpen && results.length > 0 && (
                <div className="bg-gray-800 rounded p-2 mb-2">
                    {results.map((user) => (
                        <div
                            key={user._id}
                            className="p-2 hover:bg-gray-700 rounded cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onClick={() => handleUserClickInternal(user)}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleUserClickInternal(user); }}
                        >
                            {user.name} ({user.email})
                        </div>
                    ))}
                </div>
            )}
            {/* List of chats/conversations here */}
            <div className="mt-4 flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="text-gray-400">Your chats will appear here.</div>
                ) : (
                    conversations.map((conv) => (
                        <div
                            key={conv._id}
                            className="p-2 hover:bg-gray-800 rounded cursor-pointer border-b border-gray-700"
                            role="button"
                            tabIndex={0}
                            onClick={() => onConversationClick(conv)}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onConversationClick(conv); }}
                        >
                            <div className="font-semibold">
                                {conv.isGroupChat ? conv.groupName : conv.name}
                            </div>
                            {conv.lastMessage && (
                                <div className="text-sm text-gray-400 truncate">
                                    {conv.lastMessage.content || "File attachment"}
                                </div>
                            )}
                            {conv.lastActivity && (
                                <div className="text-xs text-gray-500">
                                    {new Date(conv.lastActivity).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
            {/* TODO: User profile and logout button */}
        </div>
    );
};

Sidebar.propTypes = {
    onConversationClick: PropTypes.func,
};

export default Sidebar;
