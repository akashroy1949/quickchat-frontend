import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaTimes, FaTrashAlt, FaExclamationTriangle } from "react-icons/fa";
import { deleteConversation } from "../../redux/actions/Chat/deleteConversationAction";

const DeleteConversationModal = ({ conversationId, conversationName, isOpen, onClose, onSuccess }) => {
    const dispatch = useDispatch();
    const { loading } = useSelector(state => state.deleteConversation);
    const [confirmText, setConfirmText] = useState("");

    const handleDelete = async () => {
        if (confirmText.toLowerCase() !== "delete") {
            return;
        }

        try {
            await dispatch(deleteConversation(conversationId, () => {
                onSuccess && onSuccess();
                onClose();
            }));
        } catch (error) {
            console.error("Error deleting conversation:", error);
        }
    };

    const handleClose = () => {
        setConfirmText("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <div className="flex items-center space-x-3">
                        <FaTrashAlt className="text-red-500 text-xl" />
                        <h2 className="text-xl font-semibold text-white">Delete Conversation</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-white transition-colors"
                        disabled={loading}
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex items-start space-x-3 mb-6">
                        <FaExclamationTriangle className="text-yellow-500 text-xl mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="text-lg font-medium text-white mb-2">
                                Are you sure you want to delete this conversation?
                            </h3>
                            <p className="text-gray-300 mb-4">
                                This action cannot be undone. This will permanently delete the conversation
                                <span className="font-medium text-white"> "{conversationName}" </span>
                                and all its messages.
                            </p>
                            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                                <p className="text-red-300 text-sm">
                                    <strong>Warning:</strong> All messages, media files, and conversation history will be permanently removed.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Confirmation Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Type <span className="font-bold text-red-400">"DELETE"</span> to confirm:
                        </label>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="Type DELETE to confirm"
                            disabled={loading}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                        <button
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={loading || confirmText.toLowerCase() !== "delete"}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <FaTrashAlt className="mr-2" />
                                    Delete Conversation
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConversationModal;