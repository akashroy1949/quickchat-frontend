import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaEllipsisV, FaUserCircle, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { BsChatLeftTextFill, BsThreeDotsVertical } from "react-icons/bs";
import { useSelector, useDispatch } from "react-redux";
import API from "@/services/api";
import { connectSocket, joinConversation, disconnectSocket } from "@/services/socket";
import PropTypes from "prop-types";
import { performLogout } from "@/redux/actions/Login/logoutAction";
import { fetchUserProfile } from "@/redux/actions/User/userProfileAction";

const Sidebar = React.forwardRef(({ onUserClick, onConversationClick, selectedConversation, onMessageSent }, ref) => {
    const [searchOpen, setSearchOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [unreadMap, setUnreadMap] = useState({}); // { [conversationId]: { count, lastMessage } }
    const [collapsed, setCollapsed] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Use ref to track selected conversation for socket handlers
    const selectedConversationRef = useRef(selectedConversation);

    // Update ref when selectedConversation changes
    useEffect(() => {
        selectedConversationRef.current = selectedConversation;
    }, [selectedConversation]);

    // Get user data from Redux - use user reducer for profile data
    const userData = useSelector((state) => state.user?.data);
    const loginData = useSelector((state) => state.loginUser);

    // Get dispatch for user profile actions - must be declared before useEffect
    const dispatch = useDispatch();

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

        // Get current user ID to check if message is from current user
        const currentUserId = getUserId();
        const isFromCurrentUser = msg.sender?._id === currentUserId || msg.sender === currentUserId;

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

                        // Join the conversation room for real-time updates
                        if (msg.conversationId) {
                            joinConversation(msg.conversationId);
                            console.log(`🔗 Joined conversation room: ${msg.conversationId}`);
                        }
                    })
                    .catch((error) => {
                        console.error("❌ Error fetching conversations:", error);
                    });
                return prev;
            }
        });

        // Update unread map unless this conversation is currently selected
        // or the message is from the current user
        setUnreadMap(prev => {
            // Don't increment unread count if:
            // 1. This conversation is currently selected
            // 2. The message is from the current user
            if ((selectedConversation && selectedConversation._id === msg.conversationId) || isFromCurrentUser) {
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

        // If this is a new message and not from current user, play notification sound
        // This is a common WhatsApp feature
        if (!isFromCurrentUser && msg.conversationId) {
            try {
                // Create a simple notification sound using the Web Audio API
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.type = 'sine';
                oscillator.frequency.value = 800;
                gainNode.gain.value = 0.1;

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.start();

                // Short notification sound
                setTimeout(() => {
                    oscillator.stop();
                }, 200);
            } catch (error) {
                console.log('Could not play notification sound');
            }
        }
    }

    // Helper function to update conversations when a conversation is updated
    function handleConversationUpdated(data, setConversations) {
        console.log("🔄 handleConversationUpdated called with:", data);

        if (!data || !data.conversationId) {
            console.error("Invalid conversation update data:", data);
            return;
        }

        setConversations(prev => {
            // Check if the conversation exists in the current list
            const existingConv = prev.find(conv => conv._id === data.conversationId);

            if (existingConv) {
                console.log("✅ Updating existing conversation in sidebar");
                // Update existing conversation
                return prev
                    .map(conv => {
                        if (conv._id === data.conversationId) {
                            return {
                                ...conv,
                                lastMessage: data.lastMessage || conv.lastMessage,
                                lastActivity: data.lastActivity || new Date().toISOString()
                            };
                        }
                        return conv;
                    })
                    .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
            } else {
                console.log("⚠️ Conversation not found in sidebar, fetching all conversations");
                // If conversation doesn't exist, fetch updated conversations
                API.getConversations()
                    .then((res) => {
                        const conversations = res.data.conversations || [];
                        console.log(`✅ Fetched ${conversations.length} conversations after update event`);
                        setConversations(conversations);

                        // Join the conversation room for real-time updates
                        if (data.conversationId) {
                            joinConversation(data.conversationId);
                            console.log(`🔗 Joined conversation room: ${data.conversationId}`);
                        }
                    })
                    .catch((error) => {
                        console.error("❌ Error fetching conversations:", error);
                    });
                return prev;
            }
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
        if (!messageData) return;

        // Extract conversationId - it could be in different properties depending on the API response
        const conversationId = messageData.conversationId || messageData.conversation;

        if (!conversationId) {
            console.warn("Missing conversationId in message data:", messageData);
            return;
        }

        setConversations(prev => {
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
                        content: messageData.content || "",
                        sender: messageData.sender,
                        createdAt: messageData.createdAt || new Date().toISOString(),
                        image: messageData.image || null,
                        file: messageData.file || null,
                        fileName: messageData.fileName || null,
                        fileSize: messageData.fileSize || null,
                        fileType: messageData.fileType || null,
                        // Initialize with sent status - will be updated when delivered/seen
                        delivered: false,
                        seen: false
                    },
                    lastActivity: new Date().toISOString()
                };

                // Log the updated conversation for debugging
                console.log("Updated conversation in sidebar:", {
                    id: updatedConversation._id,
                    lastMessage: {
                        content: updatedConversation.lastMessage.content,
                        image: updatedConversation.lastMessage.image ? "Yes" : "No",
                        file: updatedConversation.lastMessage.file ? "Yes" : "No",
                        fileName: updatedConversation.lastMessage.fileName
                    }
                });

                // Place at the beginning of the array
                return [updatedConversation, ...updatedConversations];
            } else {
                // If conversation doesn't exist in the list yet (rare case),
                // fetch all conversations to ensure we have the latest data
                console.log("Conversation not found in sidebar, fetching all conversations");
                setTimeout(() => {
                    API.getConversations()
                        .then((res) => {
                            const conversations = res.data.conversations || [];
                            setConversations(conversations);
                        })
                        .catch((error) => {
                            console.error("Error fetching conversations after message sent:", error);
                        });
                }, 500);
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

    // SIMPLIFIED APPROACH: Single useEffect for all socket and refresh logic
    useEffect(() => {
        const token = localStorage.getItem("token");
        const userId = getUserId();

        if (!token || !userId) {
            console.warn("Missing token or userId for socket connection in Sidebar");
            return;
        }

        console.log("🔄 Setting up global message listener and refresh mechanism");

        // Function to refresh conversations - we'll use this everywhere
        const refreshConversations = () => {
            console.log("🔄 Refreshing conversations list");
            API.getConversations()
                .then((res) => {
                    const conversations = res.data.conversations || [];
                    console.log(`✅ Fetched ${conversations.length} conversations`);
                    setConversations(conversations);

                    // Join all conversation rooms
                    conversations.forEach(conv => {
                        joinConversation(conv._id);
                    });
                })
                .catch((error) => {
                    console.error("❌ Error fetching conversations:", error);
                });
        };

        // Connect to socket
        const socket = connectSocket(token, userId);

        // GLOBAL MESSAGE LISTENER - This is the key to our solution
        // We'll refresh the entire sidebar whenever ANY socket event happens
        socket.onAny((event) => {
            console.log(`🔔 Socket event received: ${event}`);

            // These events should trigger a sidebar refresh
            const refreshEvents = [
                "messageReceived",
                "conversationUpdated",
                "newConversationVisible",
                "conversationBecameVisible",
                "newConversationCreated"
            ];

            if (refreshEvents.includes(event)) {
                console.log(`🔄 Refreshing sidebar due to ${event} event`);
                refreshConversations();
            }
        });

        // Listen for the global update event - this is our most reliable trigger
        socket.on("globalUpdate", (data) => {
            console.log("🌎 Global update received:", data);
            refreshConversations();
        });

        // Also refresh when a message is received (most important case)
        socket.on("messageReceived", (msg) => {
            console.log("📨 Message received, refreshing sidebar");
            refreshConversations();

            // Process the message for unread counts
            handleMessageReceived(msg, setConversations, setUnreadMap, selectedConversationRef.current, API, getUserId);
        });

        // Refresh when window gets focus
        const handleFocus = () => {
            console.log("🔄 Window focused, refreshing conversations");
            refreshConversations();
        };

        window.addEventListener('focus', handleFocus);

        // Initial refresh
        refreshConversations();

        // Set up periodic refresh every 10 seconds as a fallback
        const refreshInterval = setInterval(refreshConversations, 10000);

        return () => {
            window.removeEventListener('focus', handleFocus);
            clearInterval(refreshInterval);
            socket.offAny();
            socket.off("messageReceived");
            socket.off("globalUpdate");
        };
    }, [getUserId]);

    // Note: We've removed the old socket event handling code and replaced it with our simplified approach above

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
            console.log("Message sent, updating sidebar:", onMessageSent);

            // First try to update the conversation in the sidebar
            handleUserMessageSent(onMessageSent, setConversations);

            // As a fallback, also refresh all conversations to ensure sidebar is updated
            // This is especially important for file/image messages
            setTimeout(() => {
                API.getConversations()
                    .then((res) => {
                        const conversations = res.data.conversations || [];
                        setConversations(conversations);
                        console.log("Refreshed all conversations after message sent");
                    })
                    .catch((error) => {
                        console.error("Error refreshing conversations after message sent:", error);
                    });
            }, 1000);
        }
    }, [onMessageSent]);

    // Fetch user profile data when component mounts or when user logs in
    useEffect(() => {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        // Only fetch profile if we have authentication data and no user data yet
        if (token && userId && !userData) {
            console.log("Fetching user profile data...");
            dispatch(fetchUserProfile(
                (data) => {
                    console.log("User profile fetched successfully:", data);
                },
                (error) => {
                    console.error("Failed to fetch user profile:", error);
                }
            ));
        }
    }, [dispatch, userData]);


    // Toggle sidebar collapse
    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    // Toggle user menu
    const toggleUserMenu = () => {
        setShowUserMenu(!showUserMenu);
    };

    // Handle logout
    const handleLogout = () => {
        // Disconnect from socket
        disconnectSocket();

        // Dispatch logout action which will clear Redux state and storage
        dispatch(performLogout());
    };

    // Format date for conversation timestamp
    const formatMessageTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();

        // If today, show time
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        // If this week, show day name
        const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        if (daysDiff < 7) {
            return date.toLocaleDateString([], { weekday: 'short' });
        }

        // Otherwise show date
        return date.toLocaleDateString([], {
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className={`${collapsed ? 'w-16' : 'w-80'} bg-gray-900 text-white flex flex-col border-r border-gray-700 transition-all duration-300 relative h-full`}>
            {/* Collapse toggle button */}
            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-gray-700 rounded-full p-1 z-10 hover:bg-gray-600 transition-colors"
            >
                {collapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
            </button>

            {/* Header with user profile */}
            <div className="bg-gray-800 p-3 flex items-center justify-between">
                {!collapsed ? (
                    <>
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                                {userData?.profilePicture ? (
                                    <img
                                        src={userData.profilePicture}
                                        alt={userData?.name || "User"}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <FaUserCircle size={36} className="text-gray-500" />
                                )}
                            </div>
                            <div className="font-medium truncate">
                                {userData?.name || "User"}
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button onClick={handleSearchClick} className="text-gray-400 hover:text-white">
                                <FaSearch size={18} />
                            </button>
                            <button onClick={toggleUserMenu} className="text-gray-400 hover:text-white relative">
                                <BsThreeDotsVertical size={20} />
                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10">
                                        <button className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                                            Profile
                                        </button>
                                        <button className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                                            Settings
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="w-full flex justify-center">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                            {userData?.profilePicture ? (
                                <img
                                    src={userData.profilePicture}
                                    alt={userData?.name || "User"}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <FaUserCircle size={24} className="text-gray-500" />
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Search bar */}
            {!collapsed && searchOpen && (
                <div className="p-2 bg-gray-800 border-b border-gray-700">
                    <div className="bg-gray-700 rounded-lg flex items-center px-3 py-1.5">
                        <FaSearch className="text-gray-400 mr-2" size={14} />
                        <input
                            className="bg-transparent border-none outline-none w-full text-white placeholder-gray-400 text-sm"
                            placeholder="Search users..."
                            value={search}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>
            )}

            {/* Search results */}
            {!collapsed && searchOpen && results.length > 0 && (
                <div className="bg-gray-800 p-2 mb-1 max-h-60 overflow-y-auto">
                    {results.map((user) => (
                        <button
                            key={user._id}
                            type="button"
                            className="p-2 hover:bg-gray-700 rounded-lg cursor-pointer w-full text-left flex items-center"
                            onClick={() => onUserClick && onUserClick(user)}
                        >
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3 overflow-hidden">
                                {user.profilePicture ? (
                                    <img
                                        src={user.profilePicture}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <FaUserCircle size={24} className="text-gray-500" />
                                )}
                            </div>
                            <div>
                                <div className="font-medium text-white">{user.name}</div>
                                <div className="text-xs text-gray-400">{user.email}</div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Conversations list */}
            <div className={`flex-1 overflow-y-auto ${!collapsed ? 'px-1' : 'px-0'}`}>
                {conversations.length === 0 ? (
                    <div className={`text-gray-400 p-4 text-center ${collapsed ? 'text-xs' : ''}`}>
                        {collapsed ? "No chats" : "Your chats will appear here."}
                    </div>
                ) : (
                    conversations.map((conv) => {
                        const unread = unreadMap[conv._id]?.count || 0;
                        const lastUnreadMsg = unreadMap[conv._id]?.lastMessage;
                        const isSelected = selectedConversation?._id === conv._id;

                        // Extract message display logic into a variable
                        let messageContent;
                        let messagePreview;
                        const currentUserId = getUserId();

                        if (unread > 0) {
                            const messageToShow = unread === 1 ? lastUnreadMsg : (lastUnreadMsg || conv.lastMessage);

                            // Determine content based on message type
                            let content = "";
                            if (messageToShow?.image) {
                                // For images, show "Photo" with the file name if available
                                content = messageToShow.fileName
                                    ? `📷 Photo: ${messageToShow.fileName}`
                                    : "📷 Photo";
                                console.log("Image message in sidebar:", messageToShow);
                            } else if (messageToShow?.file) {
                                // For files, show the file name if available
                                content = messageToShow.fileName
                                    ? `📎 ${messageToShow.fileName}`
                                    : "📎 File attachment";
                                console.log("File message in sidebar:", messageToShow);
                            } else {
                                content = messageToShow?.content || "";
                            }

                            // For group chats, show sender name
                            if (conv.isGroupChat && messageToShow?.sender?.name) {
                                const senderName = messageToShow.sender._id === currentUserId ? "You" : messageToShow.sender.name;
                                messageContent = `${senderName}: ${content}`;
                            } else {
                                messageContent = content;
                            }

                            messagePreview = (
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-semibold text-white truncate flex-1 mr-2">
                                        {messageContent}
                                    </div>
                                </div>
                            );
                        } else if (conv.lastMessage) {
                            // Determine content based on message type
                            let content = "";
                            if (conv.lastMessage.image) {
                                // For images, show "Photo" with the file name if available
                                content = conv.lastMessage.fileName
                                    ? `📷 Photo: ${conv.lastMessage.fileName}`
                                    : "📷 Photo";
                                console.log("Image message in sidebar (regular):", conv.lastMessage);
                            } else if (conv.lastMessage.file) {
                                // For files, show the file name if available
                                content = conv.lastMessage.fileName
                                    ? `📎 ${conv.lastMessage.fileName}`
                                    : "📎 File attachment";
                                console.log("File message in sidebar (regular):", conv.lastMessage);
                            } else {
                                content = conv.lastMessage.content || "";
                            }

                            const isFromCurrentUser = conv.lastMessage.sender?._id === currentUserId;

                            // For group chats, show sender name
                            if (conv.isGroupChat && conv.lastMessage.sender?.name) {
                                const senderName = isFromCurrentUser ? "You" : conv.lastMessage.sender.name;
                                messageContent = `${senderName}: ${content}`;
                            } else {
                                messageContent = content;
                            }

                            // Show message status indicators for messages sent by current user
                            const messageStatus = isFromCurrentUser ? (
                                <div className="ml-1 flex-shrink-0">
                                    {conv.lastMessage.seen ? (
                                        <div className="flex" title="Read">
                                            <svg className="w-3 h-3 text-blue-400 -mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    ) : conv.lastMessage.delivered ? (
                                        <div className="flex" title="Delivered">
                                            <svg className="w-3 h-3 text-gray-400 -mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    ) : (
                                        <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20" title="Sent">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                            ) : null;

                            messagePreview = (
                                <div className="text-sm text-gray-400 truncate flex items-center">
                                    <span className="truncate flex-1">{messageContent}</span>
                                    {messageStatus}
                                </div>
                            );
                        } else {
                            messageContent = "No messages yet";
                            messagePreview = (
                                <div className="text-sm text-gray-500 italic">
                                    {messageContent}
                                </div>
                            );
                        }

                        if (collapsed) {
                            // Collapsed view - just show avatar with notification badge
                            return (
                                <button
                                    key={conv._id}
                                    type="button"
                                    className={`w-full flex justify-center py-3 hover:bg-gray-800 cursor-pointer relative ${isSelected ? 'bg-gray-700' : ''
                                        }`}
                                    onClick={() => onConversationClick(conv)}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden relative">
                                        {conv.groupImage ? (
                                            <img
                                                src={conv.groupImage}
                                                alt={conv.isGroupChat ? conv.groupName : conv.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <FaUserCircle size={24} className="text-gray-500" />
                                        )}

                                        {unread > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                                {unread > 9 ? '9+' : unread}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        }

                        // Full view
                        return (
                            <button
                                key={conv._id}
                                type="button"
                                className={`w-full text-left p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-800 flex items-center ${unread > 0 ? 'bg-gray-800/50' : ''
                                    } ${isSelected ? 'bg-gray-700' : ''}`}
                                onClick={() => onConversationClick(conv)}
                            >
                                <div className="w-12 h-12 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center mr-3 overflow-hidden">
                                    {conv.groupImage ? (
                                        <img
                                            src={conv.groupImage}
                                            alt={conv.isGroupChat ? conv.groupName : conv.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <FaUserCircle size={32} className="text-gray-500" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className={`font-medium truncate ${unread > 0 ? 'text-white' : 'text-gray-300'}`}>
                                            {conv.isGroupChat ? conv.groupName : conv.name}
                                        </div>

                                        {conv.lastActivity && (
                                            <div className={`text-xs ${unread > 0 ? 'text-blue-400' : 'text-gray-500'} ml-2 flex-shrink-0`}>
                                                {formatMessageTime(conv.lastActivity)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        {messagePreview}

                                        {unread > 0 && (
                                            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ml-2 flex-shrink-0">
                                                {unread > 9 ? '9+' : unread}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>

            {/* New chat button - only in expanded view */}
            {!collapsed && (
                <div className="p-3 border-t border-gray-800">
                    <button
                        onClick={handleSearchClick}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                    >
                        <BsChatLeftTextFill className="mr-2" />
                        New Chat
                    </button>
                </div>
            )}
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
