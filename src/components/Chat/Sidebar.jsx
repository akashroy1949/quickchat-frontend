import React, { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import { useSelector } from "react-redux";
import API from "@/services/api";
import { connectSocket, joinConversation } from "@/services/socket";
import PropTypes from "prop-types";

const Sidebar = React.forwardRef(({ onUserClick, onConversationClick, selectedConversation, onMessageSent }, ref) => {
    const [searchOpen, setSearchOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [unreadMap, setUnreadMap] = useState({}); // { [conversationId]: { count, lastMessage } }

    // Use ref to track selected conversation for socket handlers
    const selectedConversationRef = useRef(selectedConversation);

    // Update ref when selectedConversation changes
    useEffect(() => {
        selectedConversationRef.current = selectedConversation;
    }, [selectedConversation]);

    // Get user data from Redux as fallback
    const loginData = useSelector((state) => state.loginUser);

    // Helper function to get userId
    const getUserId = React.useCallback(() => {
        let userId = localStorage.getItem("userId");
        if (!userId && loginData?.data?.data?._id) {
            userId = loginData.data.data._id;
            localStorage.setItem("userId", userId); // Store it for future use
        }
        return userId;
    }, [loginData]);

    // Helper function to update conversations when a message is received
    function handleMessageReceived(msg, setConversations, setUnreadMap, selectedConversation, API, getUserId) {
        console.log("🔧 handleMessageReceived called with:", {
            messageId: msg._id,
            conversationId: msg.conversationId,
            sender: msg.sender?.name || msg.sender
        });

        setConversations(prev => {
            console.log(`🔍 Current conversations count: ${prev.length}`);
            const existingConv = prev.find(conv => conv._id === msg.conversationId);
            console.log(`🔍 Found existing conversation: ${existingConv ? 'YES' : 'NO'}`);

            if (existingConv) {
                console.log("✅ Updating existing conversation in sidebar");
                // Update existing conversation
                const updated = prev
                    .map(conv => {
                        if (conv._id === msg.conversationId) {
                            return {
                                ...conv,
                                lastMessage: msg,
                                lastActivity: new Date().toISOString()
                            };
                        }
                        return conv;
                    })
                    .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
                console.log("🔄 Conversations reordered after message");
                return updated;
            } else {
                console.log("⚠️ Conversation not found in sidebar, fetching all conversations");
                // If conversation doesn't exist, fetch updated conversations
                API.getConversations()
                    .then((res) => {
                        const conversations = res.data.conversations || [];
                        console.log(`✅ Fetched ${conversations.length} conversations after missing conversation`);
                        setConversations(conversations);
                    })
                    .catch((error) => {
                        console.error("❌ Error fetching conversations:", error);
                    });
                return prev;
            }
        });

        // Update unread map unless this conversation is currently selected
        setUnreadMap(prev => {
            if (selectedConversation && selectedConversation._id === msg.conversationId) {
                return prev;
            }

            const prevEntry = prev[msg.conversationId] || { count: 0, lastMessage: null };
            return {
                ...prev,
                [msg.conversationId]: {
                    count: prevEntry.count + 1,
                    lastMessage: msg
                }
            };
        });
    }

    // Helper function to update conversations when a conversation is updated
    function handleConversationUpdated(data, setConversations) {
        setConversations(prev => {
            return prev
                .map(conv => {
                    if (conv._id === data.conversationId) {
                        return {
                            ...conv,
                            lastMessage: data.lastMessage,
                            lastActivity: data.lastActivity
                        };
                    }
                    return conv;
                })
                .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
        });
    }

    // Helper function to handle message seen event
    function handleMessageSeen(data, setUnreadMap) {
        if (data.conversationId) {
            setUnreadMap(prev => ({
                ...prev,
                [data.conversationId]: { count: 0, lastMessage: null }
            }));
        }
    }

    // Helper function to handle when user sends a message (move conversation to top)
    function handleUserMessageSent(messageData, setConversations) {
        if (!messageData || !messageData.conversationId) return;

        setConversations(prev => {
            const conversationId = messageData.conversationId;
            const existingConvIndex = prev.findIndex(conv => conv._id === conversationId);

            if (existingConvIndex !== -1) {
                // Move existing conversation to top and update lastMessage
                const updatedConversations = [...prev];
                const [conversationToMove] = updatedConversations.splice(existingConvIndex, 1);

                // Update the conversation with new message data
                const updatedConversation = {
                    ...conversationToMove,
                    lastMessage: {
                        _id: messageData._id,
                        content: messageData.content,
                        sender: messageData.sender,
                        createdAt: messageData.createdAt || new Date().toISOString(),
                        image: messageData.image,
                        file: messageData.file
                    },
                    lastActivity: new Date().toISOString()
                };

                // Place at the beginning of the array
                return [updatedConversation, ...updatedConversations];
            }

            return prev;
        });
    }

    useEffect(() => {
        // Fetch conversations on mount
        API.getConversations()
            .then((res) => {
                const conversations = res.data.conversations || [];
                setConversations(conversations);

                // Join all conversation rooms to receive real-time updates
                conversations.forEach(conv => {
                    joinConversation(conv._id);
                });

                // Initialize unread counts based on conversation data
                const initialUnreadMap = {};
                const userId = getUserId();

                conversations.forEach(conv => {
                    // If conversation has unread count from server, use it
                    if (conv.unreadCount && conv.unreadCount > 0) {
                        initialUnreadMap[conv._id] = {
                            count: conv.unreadCount,
                            lastMessage: conv.lastMessage
                        };
                    }
                });

                setUnreadMap(initialUnreadMap);
            })
            .catch(() => setConversations([]));
    }, [getUserId]);

    // Separate useEffect for socket setup to avoid re-creating listeners
    useEffect(() => {
        const token = localStorage.getItem("token");
        const userId = getUserId();

        if (!token || !userId) {
            console.warn("Missing token or userId for socket connection in Sidebar");
            return;
        }

        const socket = connectSocket(token, userId);
        console.log(`🔌 Sidebar setting up socket listeners for user: ${userId}`);

        // Create handlers that capture current state
        const messageReceivedHandler = (msg) => {
            console.log("📨 Sidebar received messageReceived event:", msg);
            console.log("🔄 Processing message for conversation:", msg.conversationId);
            console.log("👤 Current selected conversation:", selectedConversationRef.current?._id);
            handleMessageReceived(msg, setConversations, setUnreadMap, selectedConversationRef.current, API, getUserId);
        };

        const conversationUpdatedHandler = (data) => {
            console.log("🔄 Sidebar received conversationUpdated event:", data);
            handleConversationUpdated(data, setConversations);
        };

        const newConversationVisibleHandler = (data) => {
            console.log("🆕 Sidebar received newConversationVisible event:", data);
            console.log("🔄 Refreshing conversations list...");

            // Fetch updated conversations to include the newly visible one
            API.getConversations()
                .then((res) => {
                    const conversations = res.data.conversations || [];
                    console.log(`✅ Fetched ${conversations.length} conversations after newConversationVisible event`);
                    setConversations(conversations);

                    // Join the new conversation room
                    if (data.conversationId) {
                        joinConversation(data.conversationId);
                        console.log(`🔗 Joined conversation room: ${data.conversationId}`);
                    }
                })
                .catch((error) => {
                    console.error("❌ Error fetching conversations after newConversationVisible:", error);
                });
        };

        const conversationBecameVisibleHandler = (data) => {
            console.log("📡 Sidebar received conversationBecameVisible broadcast:", data);
            const currentUserId = getUserId();

            // Check if this user is in the newly visible users list
            if (data.newlyVisibleUsers && data.newlyVisibleUsers.includes(currentUserId)) {
                console.log("🎯 This user is newly visible for conversation:", data.conversationId);
                console.log("🔄 Refreshing conversations list due to broadcast...");

                // Fetch updated conversations
                API.getConversations()
                    .then((res) => {
                        const conversations = res.data.conversations || [];
                        console.log(`✅ Fetched ${conversations.length} conversations after broadcast event`);
                        setConversations(conversations);

                        // Join the new conversation room
                        if (data.conversationId) {
                            joinConversation(data.conversationId);
                            console.log(`🔗 Joined conversation room via broadcast: ${data.conversationId}`);
                        }
                    })
                    .catch((error) => {
                        console.error("❌ Error fetching conversations after broadcast:", error);
                    });
            } else {
                console.log("ℹ️ Broadcast not relevant for this user");
            }
        };

        const messageSeenHandler = (data) => {
            console.log("👁️ Sidebar received messageSeen event:", data);
            handleMessageSeen(data, setUnreadMap);
        };

        const messagesSeenHandler = (data) => {
            console.log("👁️ Sidebar received messagesSeen event:", data);
            handleMessageSeen(data, setUnreadMap);
        };

        // Listen for new messages to update conversation list
        socket.on("messageReceived", messageReceivedHandler);

        // Listen for conversation updates
        socket.on("conversationUpdated", conversationUpdatedHandler);

        // Listen for new conversation visibility events
        socket.on("newConversationVisible", newConversationVisibleHandler);
        socket.on("conversationBecameVisible", conversationBecameVisibleHandler);

        // Listen for message seen events to reset unread counts
        socket.on("messageSeen", messageSeenHandler);
        socket.on("messagesSeen", messagesSeenHandler);

        // Listen for message delivered events (optional - for future use)
        socket.on("messageDelivered", (data) => {
            // Could be used for delivery status indicators in the future
        });

        return () => {
            socket.off("messageReceived", messageReceivedHandler);
            socket.off("conversationUpdated", conversationUpdatedHandler);
            socket.off("newConversationVisible", newConversationVisibleHandler);
            socket.off("conversationBecameVisible", conversationBecameVisibleHandler);
            socket.off("messageSeen", messageSeenHandler);
            socket.off("messagesSeen", messagesSeenHandler);
            socket.off("messageDelivered");
        };
    }, [getUserId]); // Remove selectedConversation from dependencies

    // Expose functions to parent component
    React.useImperativeHandle(ref, () => ({
        addConversation: (newConversation) => {
            setConversations(prev => {
                // Check if conversation already exists
                const exists = prev.some(conv => conv._id === newConversation._id);
                if (!exists) {
                    // Add to the top of the list
                    return [newConversation, ...prev];
                }
                return prev;
            });
        },
        refreshConversations: async () => {
            try {
                const res = await API.getConversations();
                const conversations = res.data.conversations || [];
                setConversations(conversations);
            } catch (error) {
                console.error("Error refreshing conversations:", error);
            }
        }
    }));

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



    // Reset unread count in UI when a conversation is opened
    // This provides immediate visual feedback while the MessageList handles actual "mark as seen"
    useEffect(() => {
        if (selectedConversation?._id) {
            setUnreadMap(prev => ({
                ...prev,
                [selectedConversation._id]: { count: 0, lastMessage: null }
            }));
        }
    }, [selectedConversation]);

    // On login/mount, fetch all messages for each conversation and count unseen for the current user
    useEffect(() => {
        API.getConversations().then(async res => {
            const conversations = res.data.conversations || [];
            setConversations(conversations);
            const userId = getUserId();
            const initialUnreadMap = {};
            // For each conversation, fetch messages and count unseen
            await Promise.all(conversations.map(async (conv) => {
                try {
                    const msgRes = await API.fetchMessages({ conversationId: conv._id });
                    const messages = msgRes.data.messages || [];
                    // Count messages not seen by user and not sent by user
                    const unseen = messages.filter(msg => {
                        if (!msg.sender || !msg.sender._id) return false;
                        if (msg.sender._id === userId) return false;
                        // For group chats, check seenBy array
                        if (Array.isArray(msg.seenBy) && msg.seenBy.length > 0) {
                            return !msg.seenBy.some(entry => entry.user === userId);
                        }
                        // For direct chats, use 'seen' boolean
                        return !msg.seen;
                    }).length;
                    if (unseen > 0) {
                        // Find the last unseen message for display
                        const lastUnseenMsg = [...messages].reverse().find(msg => {
                            if (!msg.sender || !msg.sender._id) return false;
                            if (msg.sender._id === userId) return false;
                            if (Array.isArray(msg.seenBy) && msg.seenBy.length > 0) {
                                return !msg.seenBy.some(entry => entry.user === userId);
                            }
                            return !msg.seen;
                        });
                        initialUnreadMap[conv._id] = {
                            count: unseen,
                            lastMessage: lastUnseenMsg || conv.lastMessage
                        };
                    }
                } catch { }
            }));
            setUnreadMap(initialUnreadMap);
        });
    }, [getUserId]);

    // Handle when user sends a message (to move conversation to top)
    useEffect(() => {
        if (onMessageSent) {
            handleUserMessageSent(onMessageSent, setConversations);
        }
    }, [onMessageSent]);

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
                        <button
                            key={user._id}
                            type="button"
                            className="p-2 hover:bg-gray-700 rounded cursor-pointer w-full text-left"
                            onClick={() => onUserClick && onUserClick(user)}
                        >
                            {user.name} ({user.email})
                        </button>
                    ))}
                </div>
            )}
            {/* List of chats/conversations here */}
            <div className="mt-4 flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="text-gray-400">Your chats will appear here.</div>
                ) : (
                    conversations.map((conv) => {
                        const unread = unreadMap[conv._id]?.count || 0;
                        const lastUnreadMsg = unreadMap[conv._id]?.lastMessage;

                        // Extract message display logic into a variable
                        let messageDisplay;
                        if (unread > 0) {
                            messageDisplay = (
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-bold text-white truncate flex-1 mr-2">
                                        {(() => {
                                            const messageToShow = unread === 1 ? lastUnreadMsg : (lastUnreadMsg || conv.lastMessage);
                                            const content = messageToShow?.content || "File attachment";

                                            // For group chats, show sender name
                                            if (conv.isGroupChat && messageToShow?.sender?.name) {
                                                const currentUserId = getUserId();
                                                const senderName = messageToShow.sender._id === currentUserId ? "You" : messageToShow.sender.name;
                                                return `${senderName}: ${content}`;
                                            }

                                            return content;
                                        })()}
                                    </div>
                                    {unread > 1 && (
                                        <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 font-bold min-w-[20px] text-center">
                                            {unread}
                                        </span>
                                    )}
                                </div>
                            );
                        } else if (conv.lastMessage) {
                            messageDisplay = (
                                <div className="text-sm text-gray-400 truncate">
                                    {(() => {
                                        const content = conv.lastMessage.content || "File attachment";

                                        // For group chats, show sender name
                                        if (conv.isGroupChat && conv.lastMessage.sender?.name) {
                                            const currentUserId = getUserId();
                                            const senderName = conv.lastMessage.sender._id === currentUserId ? "You" : conv.lastMessage.sender.name;
                                            return `${senderName}: ${content}`;
                                        }

                                        return content;
                                    })()}
                                </div>
                            );
                        } else {
                            messageDisplay = (
                                <div className="text-sm text-gray-500 italic">
                                    No messages yet
                                </div>
                            );
                        }

                        return (
                            <button
                                key={conv._id}
                                type="button"
                                className={`w-full text-left p-2 hover:bg-gray-800 rounded cursor-pointer border-b border-gray-700 ${unread > 0 ? 'bg-gray-800/50 border-l-4 border-l-blue-500' : ''
                                    } ${selectedConversation?._id === conv._id ? 'bg-gray-700' : ''
                                    }`}
                                onClick={() => onConversationClick(conv)}
                            >
                                <div className={`font-semibold ${unread > 0 ? 'text-white' : 'text-gray-300'}`}>
                                    {conv.isGroupChat ? conv.groupName : conv.name}
                                </div>

                                {/* Message display logic based on unread count */}
                                {messageDisplay}
                                {conv.lastActivity && (
                                    <div className="text-xs text-gray-500">
                                        {new Date(conv.lastActivity).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                )}
                            </button>
                        );
                    })
                )}
            </div>
            {/* TODO: User profile and logout button */}
        </div>
    );
});

Sidebar.propTypes = {
    onUserClick: PropTypes.func,
    onConversationClick: PropTypes.func,
    selectedConversation: PropTypes.object,
    onMessageSent: PropTypes.object,
};

Sidebar.displayName = 'Sidebar';

export default Sidebar;
