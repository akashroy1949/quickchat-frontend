import React, { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { FaEllipsisV, FaChartBar, FaDownload, FaTrashAlt, FaInfoCircle } from "react-icons/fa";
import { exportChat } from "../../redux/actions/Chat/exportChatAction";
import ChatStatisticsModal from "./ChatStatisticsModal";
import DeleteConversationModal from "./DeleteConversationModal";

const ChatOptionsDropdown = ({ conversationId, conversationName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const dropdownRef = useRef(null);
    const dispatch = useDispatch();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleExportChat = () => {
        dispatch(exportChat(conversationId, 'pdf'));
        setIsOpen(false);
    };

    const handleDeleteConversation = () => {
        setShowDeleteModal(true);
        setIsOpen(false);
    };

    const handleShowStats = () => {
        setShowStatsModal(true);
        setIsOpen(false);
    };

    const menuItems = [
        {
            icon: <FaChartBar className="text-blue-400" />,
            label: "Chat Statistics",
            action: handleShowStats,
            description: "View message counts and media statistics"
        },
        {
            icon: <FaDownload className="text-green-400" />,
            label: "Export Chat",
            action: handleExportChat,
            description: "Download conversation as PDF"
        },
        {
            icon: <FaTrashAlt className="text-red-400" />,
            label: "Delete Conversation",
            action: handleDeleteConversation,
            description: "Permanently delete this conversation",
            danger: true
        }
    ];

    return (
        <>
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700"
                    title="More options"
                >
                    <FaEllipsisV size={18} />
                </button>

                {isOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 py-2">
                        {/* Header */}
                        <div className="px-4 py-2 border-b border-gray-700">
                            <h3 className="text-sm font-medium text-gray-300">Conversation Options</h3>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                            {menuItems.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={item.action}
                                    className={`w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-start space-x-3 ${
                                        item.danger ? 'hover:bg-red-900/20' : ''
                                    }`}
                                >
                                    <div className="flex-shrink-0 mt-0.5">
                                        {item.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-sm font-medium ${
                                            item.danger ? 'text-red-400' : 'text-white'
                                        }`}>
                                            {item.label}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-0.5">
                                            {item.description}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-2 border-t border-gray-700">
                            <p className="text-xs text-gray-500">
                                Click on any option to proceed
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <ChatStatisticsModal
                conversationId={conversationId}
                isOpen={showStatsModal}
                onClose={() => setShowStatsModal(false)}
            />

            <DeleteConversationModal
                conversationId={conversationId}
                conversationName={conversationName}
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onSuccess={() => {
                    // Handle successful deletion - could navigate away or refresh
                    console.log("Conversation deleted successfully");
                }}
            />
        </>
    );
};

export default ChatOptionsDropdown;