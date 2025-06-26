import React, { useState } from "react";
import { FaEnvelope, FaExclamationTriangle } from "react-icons/fa";
import API from "@/services/api";

const ProfileModal = ({ user, onClose, onSendMessage }) => {
    const [reporting, setReporting] = useState(false);
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleReport = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            await API.reportUser(user._id, { reason, description });
            setSuccess("User reported successfully");
            setReporting(false);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to report user");
        }
    };

    const handleSendMessage = async () => {
        if (onSendMessage) {
            await onSendMessage(user);
        }
    };

    if (!user) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 relative">
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={onClose}
                >
                    &times;
                </button>
                <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-gray-300 mb-4" />
                    <div className="text-lg font-bold mb-1">{user.name}</div>
                    <div className="text-gray-500 mb-4">{user.email}</div>
                    <div className="flex space-x-4 mt-4">
                        <button
                            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            onClick={handleSendMessage}
                        >
                            <FaEnvelope className="mr-2" /> Send Message
                        </button>
                        <button className="flex items-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" onClick={() => setReporting(true)}>
                            <FaExclamationTriangle className="mr-2" /> Report
                        </button>
                    </div>
                    {reporting && (
                        <form className="mt-4 w-full" onSubmit={handleReport}>
                            <div className="mb-2">
                                <label className="block text-sm font-medium">Reason</label>
                                <select value={reason} onChange={e => setReason(e.target.value)} required className="w-full border rounded p-1">
                                    <option value="">Select reason</option>
                                    <option value="spam">Spam</option>
                                    <option value="harassment">Harassment</option>
                                    <option value="inappropriate_content">Inappropriate Content</option>
                                    <option value="fake_profile">Fake Profile</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="mb-2">
                                <label className="block text-sm font-medium">Description</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={500} className="w-full border rounded p-1" />
                            </div>
                            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
                            {success && <div className="text-green-600 text-sm mb-2">{success}</div>}
                            <div className="flex justify-end gap-2">
                                <button type="button" className="px-3 py-1 rounded bg-gray-200" onClick={() => setReporting(false)}>Cancel</button>
                                <button type="submit" className="px-3 py-1 rounded bg-red-500 text-white">Submit</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
